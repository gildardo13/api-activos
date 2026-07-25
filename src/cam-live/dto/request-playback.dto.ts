  import {
  IsInt,
  IsOptional,
  IsIn,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestPlaybackDto {
  @ApiProperty({
    description: 'Numeric ID or ident of the device in flespi',
    example: '00D2072875',
  })
  @IsNotEmpty()
  deviceId: number | string;

  @ApiProperty({
    description: 'Start of the recorded video (UNIX timestamp in seconds)',
    example: 1711108800,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  from: number;

  @ApiProperty({
    description: 'Duration of the fragment in seconds',
    example: 30,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(600)
  duration: number;

  @ApiPropertyOptional({
    description: 'MDVR camera channel',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  channel?: number;

  @ApiPropertyOptional({
    description: "Recording quality: 'main' or 'sub'",
    example: 'main',
    default: 'main',
  })
  @IsOptional()
  @IsIn(['main', 'sub'])
  streamtype?: 'main' | 'sub';
}

export class QueryTimelineDto {
  @ApiProperty({
    description: 'Numeric ID or ident of the device in flespi',
    example: '00D2072875',
  })
  @IsNotEmpty()
  deviceId: number | string;

  @ApiProperty({
    description: 'Start of the range to query (UNIX timestamp in seconds)',
    example: 1711358244,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  from: number;

  @ApiProperty({
    description: 'End of the range to query (UNIX timestamp in seconds)',
    example: 1711358326,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  to: number;
}
