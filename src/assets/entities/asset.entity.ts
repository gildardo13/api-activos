import { StatusApproval } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

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
  attributesData?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(StatusApproval)
  statusApproval?: StatusApproval;

  @IsOptional()
  @IsString()
  commentsApproval?: string;
}