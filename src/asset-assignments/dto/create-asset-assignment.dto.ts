import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum AssignmentType {
  PROJECT = 'PROJECT',
  STAFF = 'STAFF',
  AREA = 'AREA',
}


export enum StatusReturn{
  RETURNED = 'RETURNED',
  IN_USE = 'IN_USE',
  PENDING = 'PENDING'
}


export class CreateAssetAssignmentDto {
  @IsNotEmpty()
  @IsString()
  assetId: string;

  @IsNotEmpty()
  @IsEnum(AssignmentType)
  assignmentType: AssignmentType;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  staffId?: string;

  @IsOptional()
  @IsString()
  areaId?: string;

  @IsNotEmpty()
  @IsDateString()
  assignedAt: string;

  @IsOptional()
  @IsEnum(StatusReturn)
  statusReturned?: StatusReturn;

  @IsOptional()
  @IsDateString()
  returnedAt?: string;
}