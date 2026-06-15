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

import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { QueryAssetsDto } from './dto/query-asset.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) { }

  @Post('/create-asset')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Patch('/update-attributes-data')
  @HttpCode(HttpStatus.OK)
  updateAttributesAsset(
    @Param('id') id: string,
    @Body() updateAssetDto: any,
  ) {
    return this.assetsService.updateAttributesAsset(id, updateAssetDto);
  }

  /*
  @Post('/create-file_fields-asset')
  @HttpCode(HttpStatus.CREATED)
  createNewAsset(@Body() createNewAssetDto: CreateAssetDto) {
    return this.assetsService.createNewAsset(createNewAssetDto);
  }
  */
  @Get("/find-all")
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: QueryAssetsDto) {
    return this.assetsService.findAll(query);
  }

  @Get('/find-all-no-query')
  @HttpCode(HttpStatus.OK)
  findAllNoQuery() {
    return this.assetsService.findAllNoQuery();
  }
  
  @Get('/getOneAsset/:id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    console.log(id);
    return this.assetsService.findOne(id);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }


  @Patch('/change-status/:id')
  @HttpCode(HttpStatus.OK)
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE',
  ) {
    return this.assetsService.changeStatus(id, status);
  }
}