import { IsString } from "class-validator";

export class CreateCategoryJibbyDto {
    @IsString()
    name: string;
}
