import { PartialType } from '@nestjs/swagger';
import { CreateInfoExternalDto } from './create-info-external.dto';

export class UpdateInfoExternalDto extends PartialType(CreateInfoExternalDto) {}
