import { Controller, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new token with expiration 365 days' })
  @ApiQuery({ name: 'sysName', example: 'Auth', type: String })
  async createToken(@Query() sysName: string, @Req() req: Request) {
    const prisma = req['prisma'] as any;

    return this.authService.generateTokenExtern({ sysName }, prisma);
  }
}
