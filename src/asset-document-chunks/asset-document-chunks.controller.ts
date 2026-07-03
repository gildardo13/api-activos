import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssetDocumentChunksService } from './asset-document-chunks.service';
import { CreateAssetDocumentChunkDto } from './dto/create-asset-document-chunk.dto';
import { UpdateAssetDocumentChunkDto } from './dto/update-asset-document-chunk.dto';

@Controller('asset-document-chunks')
export class AssetDocumentChunksController {
  constructor(private readonly assetDocumentChunksService: AssetDocumentChunksService) {}

  @Post()
  create(@Body() createAssetDocumentChunkDto: CreateAssetDocumentChunkDto) {
    return this.assetDocumentChunksService.create(createAssetDocumentChunkDto);
  }

  @Get()
  findAll() {
    return this.assetDocumentChunksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetDocumentChunksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDocumentChunkDto: UpdateAssetDocumentChunkDto) {
    return this.assetDocumentChunksService.update(+id, updateAssetDocumentChunkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetDocumentChunksService.remove(+id);
  }
}
