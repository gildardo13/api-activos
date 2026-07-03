import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum AssignmentTypeFilter {
  STAFF = 'STAFF',
  AREA = 'AREA',
  PROJECT = 'PROJECT',
}

export class QueryHistoryAssignmentDto {
  /** Texto libre: busca en nombre de colaborador, área o proyecto */
  @IsOptional()
  @IsString()
  searchTerm?: string;

  /** Filtra por tipo: STAFF | AREA | PROJECT */
  @IsOptional()
  @IsEnum(AssignmentTypeFilter)
  assignmentType?: AssignmentTypeFilter;
}
