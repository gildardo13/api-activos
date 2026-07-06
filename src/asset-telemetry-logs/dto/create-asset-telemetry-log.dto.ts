import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";

export class TelemetryMetadataDto {
    @IsInt()
    @IsOptional()
    din1?: number;

    @IsInt()
    @IsOptional()
    din2?: number;

    @IsInt()
    @IsOptional()
    dout1?: number;

    @IsInt()
    @IsOptional()
    ain1?: number;

    @IsInt()
    @IsOptional()
    ignition?: number;

    @IsNumber()
    @IsOptional()
    externalVoltage?: number;

    @IsNumber()
    @IsOptional()
    batteryVoltage?: number;
}

export class CreateAssetTelemetryLogDto {
    @IsString()
    @IsOptional()
    assetId: string;

    @IsString()
    latitud: string;

    @IsString()
    longitud: string;

    @IsString()
    speed: string;

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => TelemetryMetadataDto)
    metadata?: TelemetryMetadataDto;

    @IsDateString()
    recordedAt: Date;
}
