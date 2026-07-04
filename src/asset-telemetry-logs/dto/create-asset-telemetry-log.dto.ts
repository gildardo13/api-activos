import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

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

    @IsDateString()
    recordedAt: Date;
}
