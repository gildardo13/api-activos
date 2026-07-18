import { Prisma } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { isAnyArrayBuffer } from 'util/types';

export enum StatusAsset {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum StatusApproval {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateAssetDto {
  @IsString()
  assetTypeId: string;
  @IsOptional()
  @IsString()
  gpsDeviceId?: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(StatusAsset)
  status?: StatusAsset;

  @IsOptional()
  @IsString()
  lastLocation?: string;

  @IsOptional()
  @IsString()
  mainPhotograph?: string;

  @IsOptional()
  attributesData?: any;

  @IsOptional()
  @IsEnum(StatusApproval)
  statusApproval?: StatusApproval;

  @IsOptional()
  @IsString()
  commentsApproval?: string;
}