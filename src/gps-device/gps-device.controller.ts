import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { GpsDeviceService } from './gps-device.service';
import { CreateGpsDeviceDto } from './dto/create-gps-device.dto';
import { UpdateGpsDeviceDto } from './dto/update-gps-device.dto';
import { QueryGpsDeviceDto } from './dto/query-gps-device.dto';

@Controller('gps-device')
export class GpsDeviceController {
  constructor(private readonly gpsDeviceService: GpsDeviceService) { }

  @Post('/create-gpsDevice')
  create(@Body() createGpsDeviceDto: CreateGpsDeviceDto) {
    return this.gpsDeviceService.create(createGpsDeviceDto);
  }

  @Get('/getAllGpsDevices')
  findAll() {
    return this.gpsDeviceService.findAll();
  }

  @Get('/getGpsDevicePaginated')
  getGpsDevicePaginated(@Query() query: QueryGpsDeviceDto) {
    return this.gpsDeviceService.getGpsDevicePaginated(query);
  }

  @Get('/getNotAssetGpsDevices')
  getNotAssetGpsDevices() {
    return this.gpsDeviceService.getNotAssetGpsDevices();
  }

  @Get('/getGpsDeviceById/:id')
  findOne(@Param('id') id: string) {
    return this.gpsDeviceService.findOne(id);
  }

  @Put('/update-gpsDevice/:id')
  update(@Param('id') id: string, @Body() updateGpsDeviceDto: UpdateGpsDeviceDto) {
    return this.gpsDeviceService.update(id, updateGpsDeviceDto);
  }

  @Delete('/delete-gpsDevice/:id')
  remove(@Param('id') id: string) {
    return this.gpsDeviceService.remove(id);
  }
}
