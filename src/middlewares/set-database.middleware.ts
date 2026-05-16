// set-database.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaMultiService } from '../prisma/prisma-multi.service';
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
  constructor(private readonly prismaMultiService: PrismaMultiService) {}

  async use(req: AppRequest, res: Response, next: NextFunction) {
    try {
      /* ----------------------------------------------------
       * ADMIN → Control Activos
       * -------------------------------------------------- */

      const adminSession = req.cookies['jibby.session_token'];

      if (adminSession) {
        const adminRes = await fetch(
          `${process.env.AUTH_URL}/api/auth/get-session`,
          {
            headers: {
              Cookie: `jibby.session_token=${adminSession}`,
            },
          },
        );

        if (adminRes.ok) {
          const { user, session } = await adminRes.json();

          if (['admin', 'owner'].includes(user.role)) {
            const empresa =
              session.activeOrganizationId ||
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

            return next();
          }
        }
        // si falla, NO return → sigue al flujo Control Activos normal
      }

      /* ----------------------------------------------------
       * LEGACY (header empresa)
       * -------------------------------------------------- */
      // header empresa (flujo legacy)
      const headerEmpresa = req.headers['empresa'] as string | undefined;

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
      const accessToken = req.cookies?.app_session;

      if (!accessToken) {
        return res.status(401).json({ message: 'Sesión requerida' });
      }

      const userinfoRes = await fetch(
        `${process.env.AUTH_URL}/api/auth/oauth2/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log("🚀 ~ SetDatabaseMiddleware ~ use ~ userinfoRes:", userinfoRes)

      if (!userinfoRes.ok) {
        return res.status(401).json({ message: 'Sesión inválida set-middleware' });
      }

      const userinfo = await userinfoRes.json();
      req.userInfo = userinfo;
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

      next();
    } catch (error) {
      console.error('SetDatabaseMiddleware error:', error);
      return res.status(500).json({ message: 'Error al resolver contexto' });
    }
  }
}
