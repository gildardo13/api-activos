import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class CategoryJibby {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export enum ClasificationType {
  MOVABLE = 'MOVABLE',
  INMOVABLE = 'INMOVABLE',
}

export class CreateAssetTypeDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsEnum(ClasificationType)
  clasificationType?: ClasificationType;

  @IsObject()
  categoryId?: CategoryJibby;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsOptional()
  templateDesign?: any;
}