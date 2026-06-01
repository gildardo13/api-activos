import { Prisma } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { isAnyArrayBuffer } from 'util/types';

export enum StatusAsset {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export class CreateAssetDto {
  @IsString()
  assetTypeId: string;

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
  attributesData?: Prisma.InputJsonValue;
}