export class AssetAssignment {
    id: string;
    assetId: string;
    assignmentType: string;
    projectId?: string;
    staffId?: string;
    areaId?: string;
    assignedAt: Date;
    returnedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
