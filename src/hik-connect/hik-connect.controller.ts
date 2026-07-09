import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HikConnectService } from './hik-connect.service';
import { CreateHikConnectDto, DtoBodyCamHik } from './dto/create-hik-connect.dto';
import { UpdateHikConnectDto } from './dto/update-hik-connect.dto';

@Controller('api/hik-connect')
export class HikConnectController {
  constructor(private readonly hikConnectService: HikConnectService) { }

  @Get('/getToken')
  findAll() {
    return this.hikConnectService.getToken();
  }



  @Get('/getListCamera')
  findAllCamera() {
    return this.hikConnectService.getListCamHik();
  }

  @Post('/getOneCamera')
  findAllCameraOne(
    @Body() body: DtoBodyCamHik,
  ) {
    return this.hikConnectService.getOneCamHik(body);
  }




}