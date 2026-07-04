import { IsEnum, IsObject, IsOptional, IsString } from "class-validator";


export enum StatusApproval {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export class CreateApprovalFlowBodyDto {
    @IsOptional()
    @IsString()
    idReference?: string;

    @IsOptional()
    @IsString()
    idRequest: string;

    @IsObject()
    @IsOptional()
    metadata?: any;

    @IsString()
    @IsOptional()
    typeAction?: string;

    @IsOptional()
    @IsEnum(StatusApproval)
    statusApproval?: StatusApproval;

    @IsString()
    @IsOptional()
    commentsApproval: string;

}
