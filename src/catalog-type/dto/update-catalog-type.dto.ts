import { PartialType } from '@nestjs/mapped-types';
import { CreateCatalogTypeDto } from './create-catalog-type.dto';

export class UpdateCatalogTypeDto extends PartialType(CreateCatalogTypeDto) {}
