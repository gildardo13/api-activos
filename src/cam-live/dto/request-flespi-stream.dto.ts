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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestFlespiStreamDto {
  @ApiProperty({
    description:
      'Numeric ID or ident/serial of the device in flespi (e.g. 8620300 or "00D2072875")',
    example: '00D2072875',
  })
  @IsNotEmpty()
  deviceId: number | string;

  @ApiProperty({
    description: 'ID of the user requesting the stream',
    example: 'usr-abc123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'MDVR camera channel (1 = front lens, 2 = cabin, ...)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  channel?: number;

  @ApiPropertyOptional({
    description:
      "Stream quality: 'main' (maximum) or 'sub' (reduced, recommended over 4G)",
    example: 'sub',
    default: 'sub',
  })
  @IsOptional()
  @IsIn(['main', 'sub'])
  streamtype?: 'main' | 'sub';
}

export class RequestStreamBatchDto {
  @ApiProperty({
    description:
      'Numeric ID or ident/serial of the device in flespi (e.g. 8620300 or "00D2072875")',
    example: '00D2072875',
  })
  @IsNotEmpty()
  deviceId: number | string;

  @ApiProperty({
    description: 'ID of the user requesting the streams',
    example: 'usr-abc123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description:
      'Camera channels to start simultaneously (1 = front, 2 = cabin, ...)',
    example: [1, 2],
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(8)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  channels: number[];

  @ApiPropertyOptional({
    description:
      "Stream quality: 'main' (maximum) or 'sub' (reduced, recommended over 4G and for mosaic view)",
    example: 'sub',
    default: 'sub',
  })
  @IsOptional()
  @IsIn(['main', 'sub'])
  streamtype?: 'main' | 'sub';
}
