import { IsDateString, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

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

export class RhArea{
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class RhStaff{
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
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
  @IsObject()
  staffId?: RhStaff;

  @IsOptional()
  @IsObject()
  areaId?: RhArea;

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