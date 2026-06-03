import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';

import { AssetAssignmentsService } from './asset-assignments.service';
import { CreateAssetAssignmentDto } from './dto/create-asset-assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset-assignment.dto';
import { QueryAssetsAssignmentDto } from './dto/query-asset-assignment.dto';
import { QueryHistoryAssignmentDto } from './dto/query-history-assignment.dto';

@Controller('asset-assignments')
export class AssetAssignmentsController {
  constructor(
    private readonly assetAssignmentsService: AssetAssignmentsService,
  ) { }

  @Post('/create-assignment')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAssetAssignmentDto: CreateAssetAssignmentDto,
  ) {
    return this.assetAssignmentsService.create(
      createAssetAssignmentDto
    );
  }

  @Get('/find-all')
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() query: QueryAssetsAssignmentDto
  ) {
    return this.assetAssignmentsService.findAll(query);
  }

  @Get('/find-all-status')
  @HttpCode(HttpStatus.OK)
  findAllStatus(
    @Query() query: any
  ) {
    return this.assetAssignmentsService.findAllStatus(query);
  }

  @Get('/findOne/:id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.assetAssignmentsService.findOne(id);
  }

  @Get('/history/:id')
  @HttpCode(HttpStatus.OK)
  findHistory(
    @Param('id') idAsset: string,
    @Query() query: QueryHistoryAssignmentDto,
  ) {
    return this.assetAssignmentsService.findHistory(idAsset, query);

  }

  @Patch('/update-assignment/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetAssignmentDto: UpdateAssetAssignmentDto,
  ) {
    return this.assetAssignmentsService.update(
      id,
      updateAssetAssignmentDto
    );
  }

  @Delete('/delete-assignment/:id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.assetAssignmentsService.remove(id);
  }

  @Patch('/change-return-status/:id')
  @HttpCode(HttpStatus.OK)
  changeReturnStatus(@Param('id') id: string) {
    return this.assetAssignmentsService.changeReturnStatus(id);
  }
}