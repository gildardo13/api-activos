import { IsObject, IsOptional, IsString } from "class-validator";

export class CreateApprovalFlowDto { }




export class CreateSolicitudDto {
    @IsOptional()
    @IsString()
    moduleActionId?: string;

    @IsString()
    clientReferenceId: string;

    @IsObject()
    @IsOptional()
    metadata?: any;
}


export class ApprovedFlowDto {
    @IsString()
    requestId: string;

    @IsOptional()
    @IsString()
    comments?: string;
}
