import { Injectable } from '@nestjs/common';
import { CreateAssetAssignmentDto } from './dto/create-asset-assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset-assignment.dto';

@Injectable()
export class AssetAssignmentsService {
  create(createAssetAssignmentDto: CreateAssetAssignmentDto) {
    return 'This action adds a new assetAssignment';
  }

  findAll() {
    return `This action returns all assetAssignments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assetAssignment`;
  }

  update(id: number, updateAssetAssignmentDto: UpdateAssetAssignmentDto) {
    return `This action updates a #${id} assetAssignment`;
  }

  remove(id: number) {
    return `This action removes a #${id} assetAssignment`;
  }
}
