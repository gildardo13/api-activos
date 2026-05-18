import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { AssetFieldDefinitionsService } from './asset-field-definitions.service';
import { CreateAssetFieldDefinitionDto } from './dto/create-asset-field-definition.dto';
import { UpdateAssetFieldDefinitionDto } from './dto/update-asset-field-definition.dto';
import { PrismaClient } from '@prisma/client';

@Controller('asset-field-definitions')
export class AssetFieldDefinitionsController {
  constructor(
    private readonly assetFieldDefinitionsService: AssetFieldDefinitionsService,
  ) { }

  @Post('/create-asset-field-definition')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAssetFieldDefinitionDto: CreateAssetFieldDefinitionDto,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetFieldDefinitionsService.create(
      createAssetFieldDefinitionDto,
      prisma,
    );
  }

  @Get('/find-all')
  @HttpCode(HttpStatus.OK)
  findAll(@Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetFieldDefinitionsService.findAll(prisma);
  }

 
  @Get('/asset-types/:id/fields')
  @HttpCode(HttpStatus.OK)
  findByAssetType(
    @Param('id') assetTypeId: string,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetFieldDefinitionsService.findByAssetType(
      assetTypeId,
      prisma,
    );
  }

  @Get('/find-one/:id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetFieldDefinitionsService.findOne(
      id,
      prisma,
    );
  }

  @Patch('/update-asset-field-definition/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetFieldDefinitionDto: UpdateAssetFieldDefinitionDto,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetFieldDefinitionsService.update(
      id,
      updateAssetFieldDefinitionDto,
      prisma,
    );
  }

  @Delete('/delete-asset-field-definition/:id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetFieldDefinitionsService.remove(
      id,
      prisma,
    );
  }
}