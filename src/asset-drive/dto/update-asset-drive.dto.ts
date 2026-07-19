import { PartialType } from '@nestjs/swagger';
import { CreateAssetFileDto, CreateAssetFolderDto } from './create-asset-drive.dto';

export class UpdateAssetFolderDto extends PartialType(CreateAssetFolderDto) {}
export class UpdateAssetFileDto extends PartialType(CreateAssetFileDto){}
