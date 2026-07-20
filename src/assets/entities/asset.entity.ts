import { StatusApproval } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class Asset {
  id: string;

  @IsString()
  @IsOptional()
  assetTypeId?: string;

  @IsString()
  @IsOptional()
  gpsDeviceId?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
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

  @IsOptional()
  @IsString()
  mainPhotograph?: string;

  @IsOptional()
  attributesData?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(StatusApproval)
  statusApproval?: StatusApproval;

  @IsObject()
  @IsOptional()
  metadata?: any;
  
  @IsOptional()
  @IsString()
  commentsApproval?: string;
}