import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  async create(dto: CreateAssetDto, prisma: PrismaClient) {
    // 1. validar assetType existe
    const assetType = await prisma.assetType.findUnique({
      where: { id: dto.assetTypeId },
    });

    if (!assetType) {
      throw new BadRequestException('Asset type does not exist');
    }

    // 2. validar code único
    const existing = await prisma.asset.findFirst({
      where: {
        code: dto.code,
      },
    });

    if (existing) {
      throw new BadRequestException('Asset code already exists');
    }

    // 3. crear asset
    return prisma.asset.create({
      data: {
        assetTypeId: dto.assetTypeId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        status: dto.status,
        lastLocation: dto.lastLocation,
      },
      include: {
        assetType: true,
      },
    });
  }

  async findAll(prisma: PrismaClient) {
    return prisma.asset.findMany({
      include: {
        assetType: true,
        assetTelemetryLogs: true,
        assetDocuments: true,
        assetGeofences: true,
        assetAssignments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, prisma: PrismaClient) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        assetType: true,
        assetTelemetryLogs: true,
        assetDocuments: true,
        assetGeofences: true,
        assetAssignments: true,
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async update(id: string, dto: UpdateAssetDto, prisma: PrismaClient) {
    const existing = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Asset not found');
    }

    // si cambian code, validar duplicado
    if (dto.code) {
      const duplicate = await prisma.asset.findFirst({
        where: {
          id: { not: id },
          code: dto.code,
        },
      });

      if (duplicate) {
        throw new BadRequestException('Asset code already exists');
      }
    }

    return prisma.asset.update({
      where: { id },
      data: dto,
      include: {
        assetType: true,
      },
    });
  }

  async remove(id: string, prisma: PrismaClient) {
    const existing = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Asset not found');
    }

    await prisma.asset.delete({
      where: { id },
    });

    return {
      message: 'Asset deleted successfully',
    };
  }


  async changeStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED',
    prisma: PrismaClient,
  ) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');

    return prisma.asset.update({
      where: { id },
      data: { status },
    });
  }

  async createNewAsset(dto: any, prisma: PrismaClient) {
    const { assetTypeId, data_fields, file_fields } = dto;

    // 1. validar assetType
    const assetType = await prisma.assetType.findUnique({
      where: { id: assetTypeId },
      include: { assetFieldDefinitions: true },
    });

    if (!assetType) {
      throw new BadRequestException('Asset type does not exist');
    }

    const fields = assetType.assetFieldDefinitions;

    // 2. validar required fields
    const requiredFields = fields.filter((f) => f.isRequired);

    for (const field of requiredFields) {
      if (!(field.label in data_fields)) {
        throw new BadRequestException(
          `Missing required field: ${field.label}`,
        );
      }
    }

    // 3. validar tipos
    for (const field of fields) {
      const value = data_fields[field.label];

      if (value === undefined) continue;

      switch (field.fieldType) {
        case 'NUMBER':
          if (typeof value !== 'number') {
            throw new BadRequestException(
              `${field.label} must be number`,
            );
          }
          break;

        case 'TEXT':
          if (typeof value !== 'string') {
            throw new BadRequestException(
              `${field.label} must be string`,
            );
          }
          break;

        case 'SELECT':
          if (typeof value !== 'string') {
            throw new BadRequestException(
              `${field.label} must be string`,
            );
          }
          break;

        case 'DATE':
          if (isNaN(Date.parse(value))) {
            throw new BadRequestException(
              `${field.label} must be valid date`,
            );
          }
          break;

        case 'FILE':
          if (typeof value !== 'string') {
            throw new BadRequestException(
              `${field.label} must be file path or url`,
            );
          }
          break;
      }
    }

    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.create({
        data: {
          assetTypeId,
          code: dto.code,
          name: dto.name,
          description: dto.description,
          status: dto.status,
          lastLocation: dto.lastLocation,

        },
      });

      // 5. documentos
      if (file_fields?.length) {
        await tx.assetDocument.createMany({
          data: file_fields.map((file: any) => ({
            assetId: asset.id,
            fieldDefinitionId: file.fieldDefinitionId,
            fileName: file.fileName,
            fileUrl: file.fileUrl,
          })),
        });
      }

      return asset;
    });
  }
}