import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum AssignmentType {
  PROJECT = 'PROJECT',
  STAFF = 'STAFF',
  AREA = 'AREA',
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
  @IsDateString()
  returnedAt?: string;
}