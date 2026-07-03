import { IsOptional, IsString } from "class-validator";

export class CreateProjectDto {
    @IsString()
    name: string;
    @IsString()
    code: string;
    @IsOptional()
    @IsString()
    status?: string;
    @IsOptional()
    @IsString()
    typeId?: string;
}
