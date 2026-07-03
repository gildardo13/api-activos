import { Injectable } from '@nestjs/common';
import { CreateAssetDocumentChunkDto } from './dto/create-asset-document-chunk.dto';
import { UpdateAssetDocumentChunkDto } from './dto/update-asset-document-chunk.dto';

@Injectable()
export class AssetDocumentChunksService {
  create(createAssetDocumentChunkDto: CreateAssetDocumentChunkDto) {
    return 'This action adds a new assetDocumentChunk';
  }

  findAll() {
    return `This action returns all assetDocumentChunks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assetDocumentChunk`;
  }

  update(id: number, updateAssetDocumentChunkDto: UpdateAssetDocumentChunkDto) {
    return `This action updates a #${id} assetDocumentChunk`;
  }

  remove(id: number) {
    return `This action removes a #${id} assetDocumentChunk`;
  }
}
