import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class CategoryJibby{
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateAssetTypeDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
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
}