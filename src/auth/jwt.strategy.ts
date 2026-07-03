import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del encabezado Authorization
      secretOrKey: process.env.JWT_SECRET, // Clave secreta para validar el token (asegúrate de tener la variable de entorno configurada)
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Token inválido');
    }
    return payload; // Se adjunta como req.user
  }
}
