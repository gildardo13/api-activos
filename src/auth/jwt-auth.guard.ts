import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthCacheService } from './auth-cache-user.service';
import axios from 'axios';

type User = {
  email: string;
  id: string;
  permissions: Record<string, string[]>;
  name?: string;
};

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  private readonly authUrl = process.env.AUTH_ENV === 'prod' ? process.env.AUTH_URL_PROD : process.env.AUTH_URL_DEV;

  constructor(
    private reflector: Reflector,
    private cache: AuthCacheService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const session = request.headers?.authorization?.split(' ')[1]; // Obtiene el token del Bearer

    if (!session) {
      throw new UnauthorizedException('Sesión no encontrada en cabeceras');
    }

    try {
      const entry = this.cache.get(session);
      let user: User;

      if (!entry || entry.expiresAt < Date.now()) {
        const response = await axios.get(`${this.authUrl}/api/auth/oauth2/userinfo`, {
          headers: {
            Authorization: `Bearer ${session}`,
          },
        });

        const data = response.data;
        const u = data.user;
        const email = typeof u === 'object' && u ? u.email : (data.user || '');
        const id = typeof u === 'object' && u ? u.id : (data.id || '');
        const name = typeof u === 'object' && u ? u.name : '';
        
        user = { email, id, name, permissions: data.permissions || {} };
        this.cache.set(session, user);
      } else {
        user = entry.user;
      }

      request['user'] = user;
      request['userInfo'] = { sub: user.id, permissions: user.permissions }; // Para compatibilidad heredada

      // Permisos requeridos
      const requiredPermissions =
        this.reflector.get<string[]>('permissions', context.getHandler()) || [];

      // Si no hay permisos requeridos, solo valida la sesión
      if (!requiredPermissions.length) {
        return true;
      }

      const permissions = user.permissions;
      if (!permissions) {
        throw new ForbiddenException('Permisos no disponibles');
      }

      // Validación de permisos
      const hasAll = requiredPermissions.every((perm) => {
        const [resource, action] = perm.split(':');
        return permissions[resource]?.includes(action);
      });

      if (!hasAll) {
        throw new ForbiddenException('Permisos insuficientes');
      }

      return true;
    } catch (error) {
      console.error('JwtRefreshGuard Error:', error?.message || error);
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
  }
}
