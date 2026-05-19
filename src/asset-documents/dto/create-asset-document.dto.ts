import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAssetDocumentDto {
  @IsOptional()
  @IsString()
  fieldDefinitionId?: string;

  @IsOptional()
  @IsString()
  field_definition_id?: string;

  @IsOptional()
  @IsString()
  assetId?: string;

  @IsOptional()
  @IsString()
  asset_id?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  file_name?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  file_url?: string;

  @IsOptional()
  @IsDateString()
  uploadedAt?: string;

  @IsOptional()
  @IsDateString()
  uploaded_at?: string;
}
