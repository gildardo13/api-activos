import { IsEnum, IsOptional, IsString } from "class-validator";

export class Project {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsString()
    code: string;

    @IsString()
    status: string;

    @IsString()
    @IsOptional()
    typeId?: string;
}
