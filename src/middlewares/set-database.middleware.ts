// set-database.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaMultiService } from '../prisma/prisma-multi.service';
import { IntegrationService } from '../common/integration/integration.service';
import fetch from 'node-fetch';

export interface AppRequest extends Request {
  accessToken?: string;
  empresa?: string;
  prisma?: any;
  userInfo?: {
    sub: string;
    organization?: {
      id: string;
      slug: string;
    };
    permissions?: Record<string, string[]>;
  };
}

@Injectable()
export class SetDatabaseMiddleware implements NestMiddleware {

  // Cache para trackear qué usuarios ya detonaron la sincronización
  private static syncedUsers = new Set<string>();

  // Cache corto de validación de token: evita pegarle al auth-backend externo
  // en cada request (el dashboard dispara varias peticiones en paralelo por
  // cada carga de página, y sin caché eso satura/ralentiza el servicio externo).
  private static userinfoCache = new Map<
    string,
    { user: any; organization: any; expiresAt: number }
  >();
  private static readonly USERINFO_CACHE_TTL_MS = 60 * 1000;

  constructor(
    private readonly prismaMultiService: PrismaMultiService,
    private readonly integrationService: IntegrationService,
  ) { }

  async use(req: AppRequest, res: Response, next: NextFunction) {
    const urlAuth = process.env.CONTROL_ACTIVOS_ENV === "prod"
      ? process.env.CONTROL_ACTIVOS_AUTH_BACK_PROD
      : process.env.CONTROL_ACTIVOS_AUTH_BACK_DEV;


    if (['dev', 'test'].includes(process.env.CONTROL_ACTIVOS_ENV)) {
      let empresa = (req.headers['empresa'] as string | undefined)
        || (req.headers['organizationid'] as string | undefined)
        || (req.headers['x-tenant-id'] as string | undefined)
        || (req.headers['tenantid'] as string | undefined);
      if (!empresa) {
        if (process.env.DATABASE_URL) {
          const match = process.env.DATABASE_URL.match(/\/([^/]+)_activos/);
          if (match) {
            empresa = match[1];
          }
        }
        if (!empresa) {
          empresa = '60uqgXu63l6AqKyXscLkqHBXl7IJLU7Z'; // Fallback
        }
      }

      const prisma = await this.prismaMultiService.getClientForCompany(empresa);

      req.prisma = prisma;
      req.empresa = empresa;
      req.accessToken = 'dev-mock-token-xyz-123';
      req.userInfo = {
        sub: 'dev-mock-user-id',
        organization: {
          id: empresa,
          slug: 'dev-mock-organization',
        },
      } as any;

      return next();
    }

    try {
      // El token viaja como header Authorization: Bearer (interceptor de axios en el
      // frontend); la cookie app_session queda como fallback para requests que no
      // pasan por ese interceptor (ej. navegación directa / descargas).
      const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : req.cookies?.app_session;

      if (!token) {
        return res.status(401).json({ message: 'Sesión requerida' });
      }

      let cached = SetDatabaseMiddleware.userinfoCache.get(token);
      let user: any;
      let organization: any;

      if (cached && cached.expiresAt > Date.now()) {
        ({ user, organization } = cached);
      } else {
        const userinfoRes = await fetch(`${urlAuth}/api/auth/oauth2/userinfo`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userinfoRes.ok) {
          SetDatabaseMiddleware.userinfoCache.delete(token);
          return res.status(401).json({ message: 'Sesión inválida' });
        }

        ({ user, organization } = await userinfoRes.json());
        SetDatabaseMiddleware.userinfoCache.set(token, {
          user,
          organization,
          expiresAt: Date.now() + SetDatabaseMiddleware.USERINFO_CACHE_TTL_MS,
        });
      }

      // Un admin/owner puede operar sobre una organización distinta a la suya
      // pasando el header empresa/organizationid explícitamente.
      const headerEmpresa =
        (req.headers['empresa'] as string | undefined) ||
        (req.headers['organizationid'] as string | undefined);
      const isAdminOverride = ['admin', 'owner'].includes(user?.role) && !!headerEmpresa;
      const empresa = isAdminOverride ? headerEmpresa : organization?.id;

      if (!empresa) {
        return res.status(400).json({ message: 'Empresa activa no encontrada' });
      }

      const prisma = await this.prismaMultiService.getClientForCompany(empresa);

      req.prisma = prisma;
      req.empresa = empresa;
      req.userInfo = user;
      req.accessToken = token;

      next();
    } catch (error) {
      console.error('SetDatabaseMiddleware error:', error);
      return res.status(500).json({ message: 'Error al resolver contexto' });
    }
  }
}
