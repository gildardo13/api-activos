import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetAssignmentDto } from './create-asset-assignment.dto';

export class UpdateAssetAssignmentDto extends PartialType(CreateAssetAssignmentDto) {}
