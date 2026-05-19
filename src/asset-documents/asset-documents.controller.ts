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
} from '@nestjs/common';
import { AssetDocumentsService } from './asset-documents.service';
import { CreateAssetDocumentDto } from './dto/create-asset-document.dto';
import { UpdateAssetDocumentDto } from './dto/update-asset-document.dto';
import { PrismaClient } from '@prisma/client';

@Controller('asset-documents')
export class AssetDocumentsController {
  constructor(private readonly assetDocumentsService: AssetDocumentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAssetDocumentDto: CreateAssetDocumentDto,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetDocumentsService.create(createAssetDocumentDto, prisma);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetDocumentsService.findAll(prisma);
  }

  @Get('validate-required/:assetId')
  @HttpCode(HttpStatus.OK)
  validateRequired(@Param('assetId') assetId: string, @Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetDocumentsService.validateRequiredDocuments(assetId, prisma);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string, @Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetDocumentsService.findOne(id, prisma);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetDocumentDto: UpdateAssetDocumentDto,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetDocumentsService.update(id, updateAssetDocumentDto, prisma);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetDocumentsService.remove(id, prisma);
  }
}
