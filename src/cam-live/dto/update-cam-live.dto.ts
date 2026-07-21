import { PartialType } from '@nestjs/swagger';
import { CreateCamLiveDto } from './create-cam-live.dto';

export class UpdateCamLiveDto extends PartialType(CreateCamLiveDto) {}
