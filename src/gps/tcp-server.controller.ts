

import { Body, Controller, Post } from '@nestjs/common';
import { GpsService } from './tcp-server.service';
import { GpsBody } from './dto/type';

@Controller('gps')
export class GpsController {
    constructor(private readonly gpsService: GpsService) { }

    @Post('/telemetry')
    receiveTelemetry(@Body() body: GpsBody) {
        return this.gpsService.receiveTelemetry(body);
    }
}