import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AssetDriveService } from './asset-drive.service';
import { CreateAssetFolderDto, CreateAssetFileDto } from './dto/create-asset-drive.dto';
import { QueryFolderContentsDto } from './dto/query-asset-drive.dto';

@Controller('asset-drive')
export class AssetDriveController {
  constructor(private readonly assetDriveService: AssetDriveService) {}

  @Get('root/:assetId')
  getRootFolder(@Param('assetId') assetId: string) {
    return this.assetDriveService.getRootFolder(assetId);
  }

  @Get('folders/:id')
  getFolderMetadata(@Param('id') id: string) {
    return this.assetDriveService.getFolderMetadata(id);
  }

  @Get('folders/:id/contents')
  getFolderContents(
    @Param('id') id: string,
    @Query() query: QueryFolderContentsDto,
  ) {
    return this.assetDriveService.getFolderContents(
      id,
      query.page,
      query.limit,
      query.search,
    );
  }

  @Post('folders')
  createFolder(@Body() createFolderDto: CreateAssetFolderDto) {
    return this.assetDriveService.createFolder(createFolderDto);
  }

  @Post('files')
  createFile(@Body() createFileDto: CreateAssetFileDto) {
    return this.assetDriveService.createFile(createFileDto);
  }

  @Patch('folders/:id')
  renameFolder(@Param('id') id: string, @Body('name') name: string) {
    return this.assetDriveService.renameFolder(id, name);
  }

  @Patch('files/:id')
  renameFile(@Param('id') id: string, @Body('name') name: string) {
    return this.assetDriveService.renameFile(id, name);
  }

  @Delete('folders/:id')
  removeFolder(@Param('id') id: string) {
    return this.assetDriveService.removeFolder(id);
  }

  @Delete('files/:id')
  removeFile(@Param('id') id: string) {
    return this.assetDriveService.removeFile(id);
  }
}
