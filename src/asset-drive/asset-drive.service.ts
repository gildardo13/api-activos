import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetFolderDto, CreateAssetFileDto } from './dto/create-asset-drive.dto';

@Injectable()
export class AssetDriveService {
  constructor(private readonly prisma: PrismaService) {}

  // Get or create root folder for an asset
  async getRootFolder(assetId: string) {
    // Check if asset exists first
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    let rootFolder = await this.prisma.assetFolder.findFirst({
      where: {
        assetId,
        parentId: null,
      },
    });

    if (!rootFolder) {
      rootFolder = await this.prisma.assetFolder.create({
        data: {
          assetId,
          name: 'Raíz',
          parentId: null,
        },
      });
    }

    return rootFolder;
  }

  // Get folder metadata only (without contents)
  async getFolderMetadata(folderId: string) {
    const folder = await this.prisma.assetFolder.findUnique({
      where: { id: folderId },
      include: {
        parent: true,
        asset: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID ${folderId} not found`);
    }

    return folder;
  }

  // Get folder content by folderId with pagination & search
  async getFolderContents(folderId: string, page: number = 1, limit: number = 10, search: string = '') {
    const skip = (page - 1) * limit;

    // Build Prisma search query filter
    const searchFilter = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const totalFolders = await this.prisma.assetFolder.count({
      where: {
        parentId: folderId,
        ...searchFilter,
      },
    });

    const totalFiles = await this.prisma.assetFile.count({
      where: {
        folderId: folderId,
        ...searchFilter,
      },
    });

    const total = totalFolders + totalFiles;

    let paginatedFolders = [];
    let paginatedFiles = [];

    if (skip < totalFolders) {
      const foldersTake = Math.min(limit, totalFolders - skip);
      paginatedFolders = await this.prisma.assetFolder.findMany({
        where: {
          parentId: folderId,
          ...searchFilter,
        },
        orderBy: { name: 'asc' },
        skip,
        take: foldersTake,
      });

      const remainingLimit = limit - paginatedFolders.length;
      if (remainingLimit > 0 && totalFiles > 0) {
        paginatedFiles = await this.prisma.assetFile.findMany({
          where: {
            folderId,
            ...searchFilter,
          },
          orderBy: { name: 'asc' },
          skip: 0,
          take: remainingLimit,
        });
      }
    } else {
      const filesSkip = skip - totalFolders;
      paginatedFiles = await this.prisma.assetFile.findMany({
        where: {
          folderId,
          ...searchFilter,
        },
        orderBy: { name: 'asc' },
        skip: filesSkip,
        take: limit,
      });
    }

    return {
      subfolders: paginatedFolders,
      files: paginatedFiles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Create folder
  async createFolder(createFolderDto: CreateAssetFolderDto) {
    return this.prisma.assetFolder.create({
      data: {
        assetId: createFolderDto.assetId,
        name: createFolderDto.name,
        parentId: createFolderDto.parentId || null,
      },
    });
  }

  // Create file
  async createFile(createFileDto: CreateAssetFileDto) {
    return this.prisma.assetFile.create({
      data: {
        folderId: createFileDto.folderId,
        name: createFileDto.name,
        fileUrl: createFileDto.fileUrl,
        fileType: createFileDto.fileType || null,
        sizeBytes: createFileDto.sizeBytes || null,
      },
    });
  }

  // Rename folder
  async renameFolder(id: string, name: string) {
    return this.prisma.assetFolder.update({
      where: { id },
      data: { name },
    });
  }

  // Rename file
  async renameFile(id: string, name: string) {
    return this.prisma.assetFile.update({
      where: { id },
      data: { name },
    });
  }

  // Remove folder
  async removeFolder(id: string) {
    return this.prisma.assetFolder.delete({
      where: { id },
    });
  }

  // Remove file
  async removeFile(id: string) {
    return this.prisma.assetFile.delete({
      where: { id },
    });
  }
}
