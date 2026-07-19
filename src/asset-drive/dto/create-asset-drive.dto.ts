import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAssetFolderDto {
  @IsString()
  assetId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}


export class CreateAssetFileDto {
  @IsString()
  folderId: string;

  @IsString()
  name: string;

  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsInt()
  sizeBytes?: number;
}