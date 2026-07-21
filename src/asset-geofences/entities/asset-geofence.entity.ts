export class AssetGeofence {
    id: string;
    assetId?: string;
    name: string;
    coordinates: string;
    location: string;
    isLimitMovible: boolean; 
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED';

    createdAt: Date;
    updatedAt: Date;

}
