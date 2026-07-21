import { IsString } from "class-validator";

export class CreateCamLiveDto {
    @IsString()
    camaraId: string

    @IsString()
    usuarioId: string
}
