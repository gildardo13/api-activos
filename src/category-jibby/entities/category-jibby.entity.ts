import { IsString } from "class-validator";

export class CategoryJibby {
    id: string;

    @IsString()
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
