import { PartialType } from '@nestjs/swagger';
import { CreateHikConnectDto } from './create-hik-connect.dto';

export class UpdateHikConnectDto extends PartialType(CreateHikConnectDto) {}