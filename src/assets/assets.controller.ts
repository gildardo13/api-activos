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
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

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

  @Get('/without-location-inactive-telemetry')
  @HttpCode(HttpStatus.OK)
  findWithoutLocationInactiveTelemetry(@Query('search') search?: string) {
    return this.assetsService.findWithoutLocationInactiveTelemetry(search);
  }

  @Get('/find-all-no-query-notAssigment')
  @HttpCode(HttpStatus.OK)
  findAllNoQuerynotAssigment() {
    return this.assetsService.findAllNoQuerynotAssigment();
  }
  
  @Get('/getOneAsset/:id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Get('/getOneAssetById/:id')
  @HttpCode(HttpStatus.OK)
  getOneAssetById(@Param('id') id: string) {
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

  @Get('/bulk-template/:assetTypeId')
  async downloadTemplate(
    @Param('assetTypeId') assetTypeId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.assetsService.generateTemplate(assetTypeId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="plantilla_activos.xlsx"`,
      'Content-Length': buffer.length,
    });
    return res.end(buffer);
  }

  @Post('/bulk-upload')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body('assetTypeId') assetTypeId: string,
    @Res() res: Response,
  ) {
    if (!file) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No se cargó ningún archivo Excel',
      });
    }

    const result = await this.assetsService.bulkUpload(file, assetTypeId);

    if (result.pendingFiles && result.data) {
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="instrucciones_archivos.xlsx"`,
        'Content-Length': result.data.length,
      });
      return res.end(result.data);
    }

    return res.status(HttpStatus.OK).json(result);
  }

  @Post('/bulk-upload-files')
  @HttpCode(HttpStatus.OK)
  async bulkUploadFiles() {
    return this.assetsService.bulkUploadFiles();
  }
}