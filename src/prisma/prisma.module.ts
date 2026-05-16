import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaMultiService } from './prisma-multi.service';

@Global() // Esto hace que PrismaService esté disponible globalmente
@Module({
  providers: [PrismaService, PrismaMultiService],
  exports: [PrismaService, PrismaMultiService], // Exportar el PrismaService
})
export class PrismaModule { }
