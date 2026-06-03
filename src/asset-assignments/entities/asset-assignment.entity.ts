import { StatusReturn } from "@prisma/client";

export class AssetAssignment {
    id: string;
    assetId: string;
    assignmentType: string;
    projectId?: string;
    staffId?: string;
    areaId?: string;
    assignedAt: Date;
    returnedAt: Date;
    statusReturned?: StatusReturn;
    createdAt: Date;
    updatedAt: Date;
}
