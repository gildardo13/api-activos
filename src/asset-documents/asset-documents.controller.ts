import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';
import { AssetDocumentsService } from './asset-documents.service';
import { CreateAssetDocumentDto } from './dto/create-asset-document.dto';
import { UpdateAssetDocumentDto } from './dto/update-asset-document.dto';
import { PrismaClient } from '@prisma/client';
import { QueryAssetDocumentsDto } from './dto/query-asset-documents.dto';

@Controller('asset-documents')
export class AssetDocumentsController {
  constructor(private readonly assetDocumentsService: AssetDocumentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAssetDocumentDto: CreateAssetDocumentDto,
  ) {
    return this.assetDocumentsService.create(createAssetDocumentDto);
  }

  @Get('/get-all')
  @HttpCode(HttpStatus.OK)
  findAll( @Query() query: QueryAssetDocumentsDto) {
    return this.assetDocumentsService.findAll(query);
  }

  @Get('validate-required/:assetId')
  @HttpCode(HttpStatus.OK)
  validateRequired(@Param('assetId') assetId: string) {
    return this.assetDocumentsService.validateRequiredDocuments(assetId);
  }

  @Get('/get-asset-by-id/:id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.assetDocumentsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetDocumentDto: UpdateAssetDocumentDto,
  ) {
    return this.assetDocumentsService.update(id, updateAssetDocumentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.assetDocumentsService.remove(id);
  }
}
