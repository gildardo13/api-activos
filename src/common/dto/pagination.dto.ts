// src/common/dto/pagination.dto.ts
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @Type(() => Number) // Transforma el valor del query a un número
  @IsInt()
  page: number;

  @Type(() => Number) // Transforma el valor del query a un número
  @IsInt()
  pageSize: number;
}
