import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async generateTokenExtern(
    payload: Record<string, any>,
    prisma: any,
  ) {
    if (payload?.sysName?.sysName !== 'Auth') {
      throw new UnauthorizedException(
        'No está autorizado para generar peticiones de token a este sistema.',
      );
    }

    return this.jwtService.sign(payload, {
      expiresIn: '365d', // ❗ Token sin expiración
    });
  }

  async validateUser(payload: any) {
    console.log('payload user validate: ' + payload);
    return null;
  }
}
