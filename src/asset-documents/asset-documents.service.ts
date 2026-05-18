import { Injectable } from '@nestjs/common';
import { CreateAssetDocumentDto } from './dto/create-asset-document.dto';
import { UpdateAssetDocumentDto } from './dto/update-asset-document.dto';

@Injectable()
export class AssetDocumentsService {
  create(createAssetDocumentDto: CreateAssetDocumentDto) {
    return 'This action adds a new assetDocument';
  }

  findAll() {
    return `This action returns all assetDocuments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assetDocument`;
  }

  update(id: number, updateAssetDocumentDto: UpdateAssetDocumentDto) {
    return `This action updates a #${id} assetDocument`;
  }

  remove(id: number) {
    return `This action removes a #${id} assetDocument`;
  }
}
