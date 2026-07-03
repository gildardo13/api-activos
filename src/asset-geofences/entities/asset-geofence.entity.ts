export class AssetGeofence {
    id: string;
    assetId?: string;
    name: string;
    coordinates: string;
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED';

    createdAt: Date;
    updatedAt: Date;

}
