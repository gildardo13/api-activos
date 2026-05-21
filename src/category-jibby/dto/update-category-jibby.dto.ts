import { PartialType } from '@nestjs/swagger';
import { CreateCategoryJibbyDto } from './create-category-jibby.dto';

export class UpdateCategoryJibbyDto extends PartialType(CreateCategoryJibbyDto) {}
