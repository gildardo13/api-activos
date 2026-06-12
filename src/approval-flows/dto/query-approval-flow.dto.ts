import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';


export class QueryAssignmentPending {
  @IsOptional()
  @IsUUID()
  action?: string;

  @IsOptional()
  @IsUUID()
  type?: string;

  @Type(() => Number)
  @IsInt()
  page: number;

  @Type(() => Number)
  @IsInt()
  pageSize: number;

}