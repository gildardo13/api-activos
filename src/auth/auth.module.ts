import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshGuard } from './jwt-auth.guard';
import { SecondaryPrismaModule } from '../prisma/prisma-auth.module';
import { PrismaServiceAuth } from 'src/prisma/prisma-auth.service';
import { AuthCacheService } from './auth-cache-user.service';

@Module({
  providers: [AuthService, JwtStrategy, JwtRefreshGuard, PrismaServiceAuth, AuthCacheService],
  controllers: [AuthController],
  exports: [AuthService, JwtRefreshGuard, JwtModule, PrismaServiceAuth, AuthCacheService],
  imports: [
    forwardRef(() => SecondaryPrismaModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
  ],
})
export class AuthModule { }
