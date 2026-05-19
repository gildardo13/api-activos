import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAssetDocumentDto {
  @IsOptional()
  @IsString()
  fieldDefinitionId?: string;

  @IsOptional()
  @IsString()
  assetId?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsDateString()
  uploadedAt?: string;
}
