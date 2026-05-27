import { Prisma } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { isAnyArrayBuffer } from 'util/types';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
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
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsString()
  lastLocation?: string;

  @IsOptional()
  attributesData?: Prisma.InputJsonValue;
}