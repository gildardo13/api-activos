import { Body, Controller, Get, HttpCode, HttpStatus, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CamLiveService } from './cam-live.service';
import { CreateCamLiveDto } from './dto/create-cam-live.dto';
import { bodySaveMedia, RequestFlespiStreamDto, RequestStreamBatchDto } from './dto/request-flespi-stream.dto';
import { RequestPlaybackDto, QueryTimelineDto } from './dto/request-playback.dto';

@ApiTags('cam-live')
@Controller('cam-live')
export class CamLiveController {
  constructor(private readonly camLiveService: CamLiveService) { }

  @Get('/getCameras/HickConnect')
  @ApiOperation({ summary: 'Get all HikConnect cameras' })
  findAll() {
    return this.camLiveService.getCamAllHick();
  }

  @Post('/solicitarCam')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request camera stream' })
  create(@Body() createCamLiveDto: CreateCamLiveDto) {
    return this.camLiveService.solicitar(createCamLiveDto);
  }


  
  // ─────────────────────────────────────────────────────────────────────────────
  // Flespi endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('/flespi/devices')
  @ApiOperation({
    summary: 'List Flespi devices',
    description: 'Queries the Flespi Telematics Hub via stream service and returns the registered devices.',
  })
  @ApiResponse({ status: 200, description: 'List of devices retrieved successfully.' })
  async getDevices() {
    return this.camLiveService.getFlespiDevices();
  }

  @Get('/flespi/devices-available')
  @ApiOperation({
    summary: 'List available Flespi devices',
    description: 'Queries the Flespi Telematics Hub and filters out devices already assigned to a GpsDevice.',
  })
  @ApiResponse({ status: 200, description: 'List of available devices retrieved successfully.' })
  async getAvailableDevices(@Query('currentDeviceCam') currentDeviceCam?: string) {
    return this.camLiveService.getAvailableFlespiDevices(currentDeviceCam);
  }

  @Post('/flespi/streams/request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Request live stream from a Streamax device',
    description: 'Sends the start_videostream command via Flespi and returns the HLS stream URL.',
  })
  @ApiBody({ type: RequestFlespiStreamDto })
  @ApiResponse({ status: 201, description: 'Stream successfully started.' })
  async requestStream(@Body() dto: RequestFlespiStreamDto) {
    return this.camLiveService.requestFlespiLiveStream(dto);
  }


  @Post('/flespi/streams/request-video')
  @HttpCode(HttpStatus.CREATED)
  async requestStreamRequestVideo(@Body() dto: bodySaveMedia) {
    return this.camLiveService.requestFlespiLiveStreamSaveVideo(dto);
  }

  


  @Get('/flespi/devices/:deviceId/media')
  async getMedia(
    @Param('deviceId') deviceId: string,
    @Query() query: { type?: string; channel?: string; from?: string; to?: string }
  ) {
    return this.camLiveService.getFlespiDeviceMedia(deviceId, query);
  }


}
