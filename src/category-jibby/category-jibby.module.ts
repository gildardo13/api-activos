import { Module } from '@nestjs/common';
import { CategoryJibbyService } from './category-jibby.service';
import { CategoryJibbyController } from './category-jibby.controller';

@Module({
  controllers: [CategoryJibbyController],
  providers: [CategoryJibbyService],
})
export class CategoryJibbyModule {}
