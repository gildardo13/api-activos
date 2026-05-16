import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
    imports: [ConfigModule, MulterModule.register({}),],
    controllers: [CloudinaryController],
    providers: [CloudinaryService],
    exports: [CloudinaryService]
})
export class CloudinaryModule {}