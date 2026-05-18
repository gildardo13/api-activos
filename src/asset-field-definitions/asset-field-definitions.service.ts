import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetFieldDefinitionDto, FieldType } from './dto/create-asset-field-definition.dto';
import { UpdateAssetFieldDefinitionDto } from './dto/update-asset-field-definition.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AssetFieldDefinitionsService {
  async create(dto: CreateAssetFieldDefinitionDto, prisma: PrismaClient) {
    const allowedFieldTypes = Object.values(FieldType);

    if (!allowedFieldTypes.includes(dto.fieldType)) {
      throw new BadRequestException(
        `Invalid field type. Allowed: ${allowedFieldTypes.join(', ')}`,
      );
    }

    const assetType = await prisma.assetType.findUnique({
      where: { id: dto.assetTypeId },
    });

    if (!assetType) {
      throw new BadRequestException('Asset type not found');
    }

    const existing = await prisma.assetFieldDefinition.findFirst({
      where: {
        assetTypeId: dto.assetTypeId,
        label: {
          equals: dto.label.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Asset field definition already exists',
      );
    }

    return prisma.assetFieldDefinition.create({
      data: {
        assetTypeId: dto.assetTypeId,
        label: dto.label.trim(),
        fieldType: dto.fieldType,
        isRequired: dto.isRequired,
      },
    });
  }

  async findAll(prisma: PrismaClient) {
    const items = await prisma.assetFieldDefinition.findMany({
      include: {
        assetType: true,
        assetDocuments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return items;
  }

  async findByAssetType(assetTypeId: string, prisma: PrismaClient) {
    const fields = await prisma.assetFieldDefinition.findMany({
      where: {
        assetTypeId,
      },
      orderBy: {
        createdAt: 'asc'
      },
    });

    return fields.map((field) => ({
      id: field.id,
      label: field.label,
      field_type: field.fieldType,
      required: field.isRequired,
      options: null,
      placeholder: null,
    }));
  }

  async findOne(id: string, prisma: PrismaClient) {
    const item = await prisma.assetFieldDefinition.findUnique({
      where: { id },
      include: {
        assetType: true,
        assetDocuments: true,
      },
    });

    if (!item) {
      throw new NotFoundException(
        'Asset field definition not found',
      );
    }

    return item;
  }

  async update(
    id: string,
    dto: UpdateAssetFieldDefinitionDto,
    prisma: PrismaClient,
  ) {
    const existing = await prisma.assetFieldDefinition.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        'Asset field definition not found',
      );
    }

    if (dto.label || dto.assetTypeId) {
      const duplicate = await prisma.assetFieldDefinition.findFirst({
        where: {
          id: { not: id },
          assetTypeId: dto.assetTypeId ?? existing.assetTypeId,
          label: {
            equals: (dto.label ?? existing.label).trim(),
            mode: 'insensitive',
          },
        },
      });

      if (duplicate) {
        throw new BadRequestException(
          'Asset field definition already exists',
        );
      }
    }

    return prisma.assetFieldDefinition.update({
      where: { id },
      data: {
        ...dto,
        label: dto.label?.trim(),
      },
      include: {
        assetType: true,
        assetDocuments: true,
      },
    });
  }

  async remove(id: string, prisma: PrismaClient) {
    const existing = await prisma.assetFieldDefinition.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        'Asset field definition not found',
      );
    }

    await prisma.assetFieldDefinition.delete({
      where: { id },
    });

    return {
      message: 'Asset field definition deleted successfully',
    };
  }
}