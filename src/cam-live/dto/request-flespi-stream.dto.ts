import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
  Min,
  ArrayNotEmpty,
  ArrayMaxSize,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestFlespiStreamDto {
  @IsNotEmpty()
  deviceId: number | string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  channel?: number;


  @IsOptional()
  @IsIn(['main', 'sub'])
  streamtype?: 'main' | 'sub';
}

export class RequestStreamBatchDto {
  @IsNotEmpty()
  deviceId: number | string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(8)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  channels: number[];

  @IsOptional()
  @IsIn(['main', 'sub'])
  streamtype?: 'main' | 'sub';
}


export class bodySaveMedia {

  @IsString()
  deviceId: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsNumber()
  duration: number;

  @IsNumber()
  channel: number;

  @IsOptional()
  @IsBoolean()
  queue: boolean



}
