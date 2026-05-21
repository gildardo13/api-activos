import { IsDateString, IsOptional, IsString } from "class-validator";

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
    @IsDateString()
    recordedAt: Date;
}
