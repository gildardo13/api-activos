import { IsObject, IsOptional, IsString } from "class-validator";

export class CreateApprovalFlowDto { }



export interface Metadata {
    typeAction: string;
}

export class CreateSolicitudDto {
    @IsOptional()
    @IsString()
    moduleActionId?: string;

    @IsString()
    clientReferenceId: string;

    @IsObject()
    @IsOptional()
    metadata?: Metadata;

}
