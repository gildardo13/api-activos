import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class Asset {
  id: string;
  
  @IsString()
  assetTypeId: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsOptional()
  @IsString()
  lastLocation?: string;
}