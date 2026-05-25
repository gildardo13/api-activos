import { IsString } from "class-validator";

export class CategoryJibby {
    @IsString()
    id: string;

    @IsString()
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
