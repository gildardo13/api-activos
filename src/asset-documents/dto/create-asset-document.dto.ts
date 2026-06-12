import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusApproval } from 'src/assets/dto/create-asset.dto';

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

  @IsOptional()
  @IsEnum(StatusApproval)
  statusApproval?: StatusApproval;
}
