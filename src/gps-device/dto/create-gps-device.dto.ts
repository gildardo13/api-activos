import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateGpsDeviceDto {
  @IsString()
  imei: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  providerCompany?: string;


  @IsOptional()
  @IsBoolean()
  isCamera?: boolean;

  @IsOptional()
  @IsString()
  deviceCam?: string;
}