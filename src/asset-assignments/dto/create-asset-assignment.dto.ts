import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAssetAssignmentDto {
  @IsOptional()
  @IsString()
  assetId?: string;

  @IsOptional()
  @IsString()
  assignmentType?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  staffId?: string;

  @IsOptional()
  @IsString()
  areaId?: string;

  @IsOptional()
  @IsDateString()
  assignedAt?: string;

  @IsOptional()
  @IsDateString()
  returnedAt?: string;
}