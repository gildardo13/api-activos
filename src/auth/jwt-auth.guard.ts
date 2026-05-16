// auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const req = context.switchToHttp().getRequest();

    // // Identidad resuelta por middleware
    // if (!req.userInfo?.sub) {
    //   throw new UnauthorizedException('Sesión inválida auth guard');
    // }

    // // Permisos requeridos
    // const requiredPermissions =
    //   this.reflector.get<string[]>('permissions', context.getHandler()) || [];

    // // Si no hay permisos, solo valida sesión
    // if (!requiredPermissions.length) {
    //   return true;
    // }

    // const permissions = req.userInfo.permissions;
    // if (!permissions) {
    //   throw new ForbiddenException('Permisos no disponibles');
    // }

    // // Validación de permisos
    // const hasAll = requiredPermissions.every((perm) => {
    //   const [resource, action] = perm.split(':');
    //   return permissions[resource]?.includes(action);
    // });

    // if (!hasAll) {
    //   throw new ForbiddenException('Permisos insuficientes');
    // }

    return true;
  }
}
