import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CatalogTypeService } from './catalog-type.service';
import { CreateCatalogTypeDto } from './dto/create-catalog-type.dto';
import { UpdateCatalogTypeDto } from './dto/update-catalog-type.dto';
import { QueryCatalogTypeDto } from './dto/query-catalog-type.dto';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { QueryCatalogItemDto } from './dto/query-catalog-item.dto';

@Controller('catalog-type')
export class CatalogTypeController {
  constructor(private readonly catalogTypeService: CatalogTypeService) {}

  // ───────────────────────────────────────────────────────────────────────────
  // CATALOG (Master) Endpoints
  // ───────────────────────────────────────────────────────────────────────────
  @Post()
  createCatalog(@Body() createCatalogTypeDto: CreateCatalogTypeDto) {
    return this.catalogTypeService.createCatalog(createCatalogTypeDto);
  }

  @Get()
  findAllCatalogs(@Query() query: QueryCatalogTypeDto) {
    return this.catalogTypeService.findAllCatalogs(query);
  }

  @Get('/:id')
  findOneCatalog(@Param('id') id: string) {
    return this.catalogTypeService.findOneCatalog(id);
  }

  @Patch('/:id')
  updateCatalog(
    @Param('id') id: string,
    @Body() updateCatalogTypeDto: UpdateCatalogTypeDto,
  ) {
    return this.catalogTypeService.updateCatalog(id, updateCatalogTypeDto);
  }

  @Delete('/:id')
  removeCatalog(@Param('id') id: string) {
    return this.catalogTypeService.removeCatalog(id);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CATALOG ITEM (Detail) Endpoints
  // ───────────────────────────────────────────────────────────────────────────
  @Post('/items')
  createCatalogItem(@Body() createCatalogItemDto: CreateCatalogItemDto) {
    return this.catalogTypeService.createCatalogItem(createCatalogItemDto);
  }

  @Get('/:catalogId/items')
  findAllCatalogItems(
    @Param('catalogId') catalogId: string,
    @Query() query: QueryCatalogItemDto,
  ) {
    return this.catalogTypeService.findAllCatalogItems(catalogId, query);
  }

  @Get('/items/:id')
  findOneCatalogItem(@Param('id') id: string) {
    return this.catalogTypeService.findOneCatalogItem(id);
  }

  @Patch('/items/:id')
  updateCatalogItem(
    @Param('id') id: string,
    @Body() updateCatalogItemDto: UpdateCatalogItemDto,
  ) {
    return this.catalogTypeService.updateCatalogItem(id, updateCatalogItemDto);
  }

  @Delete('/items/:id')
  removeCatalogItem(@Param('id') id: string) {
    return this.catalogTypeService.removeCatalogItem(id);
  }
}
