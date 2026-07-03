import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetFieldDefinitionDto } from './create-asset-field-definition.dto';

export class UpdateAssetFieldDefinitionDto extends PartialType(CreateAssetFieldDefinitionDto) {}
