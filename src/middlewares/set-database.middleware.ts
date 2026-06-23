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

  constructor(
    private readonly prismaMultiService: PrismaMultiService,
    private readonly integrationService: IntegrationService,
  ) { }

  async use(req: AppRequest, res: Response, next: NextFunction) {
    const urlAuth = process.env.CONTROL_ACTIVOS_ENV === "prod"
      ? process.env.CONTROL_ACTIVOS_AUTH_BACK_PROD
      : process.env.CONTROL_ACTIVOS_AUTH_BACK_DEV;


    if (process.env.CONTROL_ACTIVOS_ENV === 'dev') {
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
      /* ----------------------------------------------------
      * ADMIN → Control Activos
      * -------------------------------------------------- */

      const adminSession = req.cookies.app_session;

      if (adminSession) {
        const adminRes = await fetch(
          `${urlAuth}/api/auth/oauth2/userinfo`,
          {
            headers: {
              Authorization: `Bearer ${adminSession}`,
            },
          },
        );

        if (adminRes) {
          const { user, organization } = await adminRes.json();
          if (['admin', 'owner'].includes(user.role)) {
            const empresa =
              organization.id ||
              (req.headers['empresa'] as string | undefined);

            if (!empresa) {
              return res.status(400).json({ message: 'Empresa requerida' });
            }

            const prisma =
              await this.prismaMultiService.getClientForCompany(empresa);
          
            req.prisma = prisma;
            req.empresa = empresa;
            req.userInfo = {
              sub: user.id,
            };

            // Sync lazy de RH en background con el token ya validado
            /*const userKey = `${empresa}-${user.id}`;
            if (!SetDatabaseMiddleware.syncedUsers.has(userKey)) {
              SetDatabaseMiddleware.syncedUsers.add(userKey);
              this.integrationService.triggerBootstrapSync(adminSession, empresa);
            }*/

            return next();
          }
        }
        // si falla, NO return → sigue al flujo Control Activos normal
      }

      /* ----------------------------------------------------
      * LEGACY (header empresa)
      * -------------------------------------------------- */
      // header empresa (flujo legacy)
      const headerEmpresa = (req.headers['empresa'] ||
        req.headers['x-tenant-id'] ||
        req.headers['tenantid']) as string | undefined;

      if (headerEmpresa) {
        const prisma =
          await this.prismaMultiService.getClientForCompany(headerEmpresa);

        req.prisma = prisma;
        req.empresa = headerEmpresa;
        return next();
      }

      /* ----------------------------------------------------
      * USUARIO Control Activos (OAuth)
      * -------------------------------------------------- */
      const accessToken = req.cookies?.['jibby.session_token'];

      if (!accessToken) {
        return res.status(401).json({ message: 'Sesión requerida' });
      }

      const userinfoRes = await fetch(
        `${urlAuth}/api/auth/oauth2/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!userinfoRes.ok) {
        return res.status(401).json({ message: 'Sesión inválida set-middleware' });
      }

      const userinfo = await userinfoRes.json();
      req.userInfo = userinfo.user;
      req.accessToken = accessToken;
      console.log("🚀 ~ SetDatabaseMiddleware ~ use ~ userinfo:", userinfo)

      const empresa = userinfo.organization?.id;

      if (!empresa) {
        return res
          .status(400)
          .json({ message: 'Empresa activa no encontrada' });
      }

      const prisma = await this.prismaMultiService.getClientForCompany(empresa);

      req.prisma = prisma;
      req.empresa = empresa;

      // Sync lazy de RH en background con el token ya validado
      /*const userKey = `${empresa}-${userinfo.user?.id || req.userInfo?.sub}`;
      if (!SetDatabaseMiddleware.syncedUsers.has(userKey)) {
        SetDatabaseMiddleware.syncedUsers.add(userKey);
        this.integrationService.triggerBootstrapSync(accessToken, empresa);
      }*/

      next();
    } catch (error) {
      console.error('SetDatabaseMiddleware error:', error);
      return res.status(500).json({ message: 'Error al resolver contexto' });
    }
  }
}
