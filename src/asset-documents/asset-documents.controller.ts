import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssetDocumentsService } from './asset-documents.service';
import { CreateAssetDocumentDto } from './dto/create-asset-document.dto';
import { UpdateAssetDocumentDto } from './dto/update-asset-document.dto';

@Controller('asset-documents')
export class AssetDocumentsController {
  constructor(private readonly assetDocumentsService: AssetDocumentsService) {}

  @Post()
  create(@Body() createAssetDocumentDto: CreateAssetDocumentDto) {
    return this.assetDocumentsService.create(createAssetDocumentDto);
  }

  @Get()
  findAll() {
    return this.assetDocumentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetDocumentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDocumentDto: UpdateAssetDocumentDto) {
    return this.assetDocumentsService.update(+id, updateAssetDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetDocumentsService.remove(+id);
  }
}
