import { Body, Controller, Get, HttpCode, HttpStatus, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CamLiveService } from './cam-live.service';
import { CreateCamLiveDto } from './dto/create-cam-live.dto';
import { RequestFlespiStreamDto, RequestStreamBatchDto } from './dto/request-flespi-stream.dto';
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

  @Post('/flespi/streams/request-batch')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Request live stream of multiple channels at once',
    description: 'Sends the start_videostream_batch command via Flespi and returns one HLS URL per channel.',
  })
  @ApiBody({ type: RequestStreamBatchDto })
  @ApiResponse({ status: 201, description: 'Streams successfully started.' })
  async requestStreamBatch(@Body() dto: RequestStreamBatchDto) {
    return this.camLiveService.requestFlespiLiveStreamBatch(dto);
  }

  @Post('/flespi/streams/timeline')
  @ApiOperation({
    summary: 'Query device recording timeline',
    description: 'Queries the time intervals with recorded video available on the device storage.',
  })
  @ApiBody({ type: QueryTimelineDto })
  @ApiResponse({ status: 200, description: 'Available intervals retrieved successfully.' })
  async queryTimeline(@Body() dto: QueryTimelineDto) {
    return this.camLiveService.queryFlespiTimeline(dto);
  }

  @Post('/flespi/streams/playback')
  @ApiOperation({
    summary: 'Play recorded video (HLS playback)',
    description: 'Plays a recorded fragment of the MDVR as an HLS stream.',
  })
  @ApiBody({ type: RequestPlaybackDto })
  @ApiResponse({ status: 200, description: 'Playback stream requested successfully.' })
  async requestPlayback(@Body() dto: RequestPlaybackDto) {
    return this.camLiveService.requestFlespiPlayback(dto);
  }

  @Get('/flespi/devices/:deviceId/media')
  @ApiOperation({
    summary: 'List device media files',
    description: 'Returns the videos/photos already uploaded to Flespi for a specific device.',
  })
  @ApiParam({ name: 'deviceId', example: '6486786' })
  @ApiResponse({ status: 200, description: 'List of media files retrieved successfully.' })
  async getMedia(@Param('deviceId') deviceId: string) {
    return this.camLiveService.getFlespiDeviceMedia(deviceId);
  }

  @Get('/flespi/channels')
  @ApiOperation({
    summary: 'List Flespi channels',
    description: 'Queries the Flespi Telematics Hub and returns the configured channels.',
  })
  @ApiResponse({ status: 200, description: 'List of channels retrieved successfully.' })
  async getChannels() {
    return this.camLiveService.getFlespiChannels();
  }

  @Get('/flespi/devices/:deviceId/telemetry')
  @ApiOperation({
    summary: 'Get device current telemetry',
    description: 'Returns the last known telemetry reported by the tracker to Flespi.',
  })
  @ApiParam({ name: 'deviceId', example: '6486786' })
  @ApiResponse({ status: 200, description: 'Device telemetry retrieved successfully.' })
  async getDeviceTelemetry(@Param('deviceId') deviceId: string) {
    return this.camLiveService.getFlespiDeviceTelemetry(deviceId);
  }
}
