import { Injectable } from '@nestjs/common';
import { CreateAssetFieldDefinitionDto } from './dto/create-asset-field-definition.dto';
import { UpdateAssetFieldDefinitionDto } from './dto/update-asset-field-definition.dto';

@Injectable()
export class AssetFieldDefinitionsService {
  create(createAssetFieldDefinitionDto: CreateAssetFieldDefinitionDto) {
    return 'This action adds a new assetFieldDefinition';
  }

  findAll() {
    return `This action returns all assetFieldDefinitions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assetFieldDefinition`;
  }

  update(id: number, updateAssetFieldDefinitionDto: UpdateAssetFieldDefinitionDto) {
    return `This action updates a #${id} assetFieldDefinition`;
  }

  remove(id: number) {
    return `This action removes a #${id} assetFieldDefinition`;
  }
}
