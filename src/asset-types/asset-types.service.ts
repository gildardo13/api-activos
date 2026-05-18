import { Injectable } from '@nestjs/common';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { UpdateAssetTypeDto } from './dto/update-asset-type.dto';

@Injectable()
export class AssetTypesService {
  create(createAssetTypeDto: CreateAssetTypeDto) {
    return 'This action adds a new assetType';
  }

  findAll() {
    return `This action returns all assetTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assetType`;
  }

  update(id: number, updateAssetTypeDto: UpdateAssetTypeDto) {
    return `This action updates a #${id} assetType`;
  }

  remove(id: number) {
    return `This action removes a #${id} assetType`;
  }
}
