import { Injectable } from '@nestjs/common';
import { CreateAssetGeofenceDto } from './dto/create-asset-geofence.dto';
import { UpdateAssetGeofenceDto } from './dto/update-asset-geofence.dto';

@Injectable()
export class AssetGeofencesService {
  create(createAssetGeofenceDto: CreateAssetGeofenceDto) {
    return 'This action adds a new assetGeofence';
  }

  findAll() {
    return `This action returns all assetGeofences`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assetGeofence`;
  }

  update(id: number, updateAssetGeofenceDto: UpdateAssetGeofenceDto) {
    return `This action updates a #${id} assetGeofence`;
  }

  remove(id: number) {
    return `This action removes a #${id} assetGeofence`;
  }
}
