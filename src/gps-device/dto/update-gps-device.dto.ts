import { PartialType } from '@nestjs/swagger';
import { CreateGpsDeviceDto } from './create-gps-device.dto';

export class UpdateGpsDeviceDto extends PartialType(CreateGpsDeviceDto) {}
