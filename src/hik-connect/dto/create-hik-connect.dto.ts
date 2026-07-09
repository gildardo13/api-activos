import { IsOptional, IsString } from "class-validator";
export class CreateHikConnectDto {}


export class DtoBodyCamHik {
    @IsString()
    @IsOptional()
    deviceSerial?: string; // Agrega esta línea

    @IsString()
    @IsOptional()
    resourceId?: string;   // Agrega esta línea

    @IsString()
    @IsOptional()
    suffix?: string;
}
