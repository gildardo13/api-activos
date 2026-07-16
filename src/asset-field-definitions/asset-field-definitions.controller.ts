import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, ParseIntPipe} from '@nestjs/common';
import { AssetFieldDefinitionsService } from './asset-field-definitions.service';
import { CreateAssetFieldDefinitionDto} from './dto/create-asset-field-definition.dto';
import { UpdateAssetFieldDefinitionDto } from './dto/update-asset-field-definition.dto';
import { QueryAssetFieldDefinitionDto } from './dto/query-asset-field.dto';
import { ReorderAssetFieldDefinitionsDto } from './dto/reorder-asset-field-definitions.dto';

@Controller('asset-field-definitions')
export class AssetFieldDefinitionsController {
  constructor(
    private readonly assetFieldDefinitionsService: AssetFieldDefinitionsService,
  ) { }

  @Post('/create-asset-field-definition')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAssetFieldDefinitionDto: CreateAssetFieldDefinitionDto,
  ) {

    return this.assetFieldDefinitionsService.create(
      createAssetFieldDefinitionDto,
    );
  }

  @Get('/find-all')
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() query: QueryAssetFieldDefinitionDto,
  ) {

    return this.assetFieldDefinitionsService.findAll(query);
  }

  @Get('/asset-types/:id')
  @HttpCode(HttpStatus.OK)
  findByAssetTypeIdType(
    @Param('id') assetTypeId: string,

  ) {
    return this.assetFieldDefinitionsService.findByAssetTypeId(
      assetTypeId
    );
  }

  @Get('/asset-types/pagination/:id')
  @HttpCode(HttpStatus.OK)
  findByAssetTypeIdTypePagination(
    @Param('id') assetTypeId: string,
    @Query() query: QueryAssetFieldDefinitionDto,
  ) {
    return this.assetFieldDefinitionsService.findByAssetTypeIdPagination(
      assetTypeId,
      query
    );
  }

 
  @Get('/asset-types/:id/fields')
  @HttpCode(HttpStatus.OK)
  findByAssetType(
    @Param('id') assetTypeId: string
  ) {
    return this.assetFieldDefinitionsService.findByAssetTypeId(
      assetTypeId
    );
  }

  @Get('/find-one/:id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id') id: string,

  ) {
    return this.assetFieldDefinitionsService.findOne(
      id,
    );
  }

  @Patch('/update-asset-field-definition/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetFieldDefinitionDto: UpdateAssetFieldDefinitionDto,
  ) {
    return this.assetFieldDefinitionsService.update(
      id,
      updateAssetFieldDefinitionDto,
    );
  }

  @Delete('/delete-asset-field-definition/:id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string,
  ) {

    return this.assetFieldDefinitionsService.remove(
      id
    );
  }

  @Patch('/reorder')
  @HttpCode(HttpStatus.OK)
  reorder(
    @Body() dto: ReorderAssetFieldDefinitionsDto,
  ) {
    return this.assetFieldDefinitionsService.reorder(dto);
  }

  @Get('/grid-combinations/:count')
  @HttpCode(HttpStatus.OK)
  getGridCombinations(
    @Param('count', ParseIntPipe) count: number,
  ) {
    return this.assetFieldDefinitionsService.getGridCombinations(count);
  }
}