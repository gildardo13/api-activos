import { IsOptional, IsString } from 'class-validator';

export class CreateCatalogItemDto {
  @IsString()
  catalogId: string;

  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
