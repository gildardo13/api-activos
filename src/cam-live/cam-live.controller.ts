import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CamLiveService } from './cam-live.service';
import { CreateCamLiveDto } from './dto/create-cam-live.dto';
@Controller('cam-live')
export class CamLiveController {
  constructor(private readonly camLiveService: CamLiveService) { }


  @Get('/getCameras/HickConnect')
  findAll() {
    return this.camLiveService.getCamAllHick();
  }

  @Post('/solicitarCam')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCamLiveDto:CreateCamLiveDto) {
    return this.camLiveService.solicitar(createCamLiveDto);
  }



}
