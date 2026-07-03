import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetFieldDefinitionDto, FieldType } from './dto/create-asset-field-definition.dto';
import { UpdateAssetFieldDefinitionDto } from './dto/update-asset-field-definition.dto';

import { PrismaService } from 'src/prisma/prisma.service';
import { QueryAssetFieldDefinitionDto } from './dto/query-asset-field.dto';

@Injectable()
export class AssetFieldDefinitionsService {
  constructor(private prisma: PrismaService) { }
  async create(dto: CreateAssetFieldDefinitionDto) {
    const allowedFieldTypes = Object.values(FieldType);

    if (!allowedFieldTypes.includes(dto.fieldType)) {
      throw new BadRequestException(
        `Invalid field type. Allowed: ${allowedFieldTypes.join(', ')}`,
      );
    }

    const assetType = await this.prisma.assetType.findUnique({
      where: { id: dto.assetTypeId },
    });

    if (!assetType) {
      throw new BadRequestException('Asset type not found');
    }

    const existing = await this.prisma.assetFieldDefinition.findFirst({
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

    return this.prisma.assetFieldDefinition.create({
      data: {
        assetTypeId: dto.assetTypeId,
        label: dto.label.trim(),
        fieldType: dto.fieldType,
        placeholder: dto.placeholder,
        isRequired: dto.isRequired,
        options: dto.options,
      },
    });
  }

  async findAll(query: QueryAssetFieldDefinitionDto) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      fieldType,
      isRequired,
      sortByDate = 'desc',
    } = query;

    const where: any = {};

    if (fieldType) {
      where.fieldType = fieldType;
    }

    if (isRequired !== undefined) {
      where.isRequired = isRequired;
    }

    if (searchTerm) {
      where.OR = [
        {
          label: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          fieldType: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    const shouldPaginate =
      query.page !== undefined || query.limit !== undefined;

    const prismaQuery: any = {
      where,
      include: {
        assetType: true,
        assetDocuments: true,
      },
      orderBy: {
        createdAt: sortByDate,
      },
    };

    if (shouldPaginate) {
      prismaQuery.skip = (page - 1) * limit;
      prismaQuery.take = limit;
    }

    const [items, total] = await Promise.all([
      this.prisma.assetFieldDefinition.findMany(prismaQuery),

      this.prisma.assetFieldDefinition.count({
        where,
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page: shouldPaginate ? page : null,
        limit: shouldPaginate ? limit : total,
        totalPages: shouldPaginate
          ? Math.ceil(total / limit)
          : 1,
      },
    };
  }

  async findByAssetTypeId(assetTypeId: string) {
    const fields = await this.prisma.assetFieldDefinition.findMany({
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
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      placeholder: field.placeholder,
      options: field.options,
    }));
  }

  async findByAssetTypeIdPagination(
    assetTypeId: string,
    query: QueryAssetFieldDefinitionDto,
  ) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      sortByDate = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      assetTypeId,
    };

    // ── Búsqueda ─────────────────────────────────────
    if (searchTerm?.trim()) {
      where.OR = [
        {
          label: {
            contains: searchTerm.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    const [total, fields] = await Promise.all([
      this.prisma.assetFieldDefinition.count({
        where,
      }),

      this.prisma.assetFieldDefinition.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          createdAt: sortByDate,
        },
      }),
    ]);

    return {
      data: fields.map((field) => ({
        id: field.id,
        label: field.label,
        fieldType: field.fieldType,
        isRequired: field.isRequired,
        placeholder: field.placeholder,
        options: field.options,
      })),

      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.assetFieldDefinition.findUnique({
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
  ) {
    const existing = await this.prisma.assetFieldDefinition.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        'Asset field definition not found',
      );
    }

    if (dto.label || dto.assetTypeId) {
      const duplicate = await this.prisma.assetFieldDefinition.findFirst({
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

    return this.prisma.assetFieldDefinition.update({
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

  async remove(id: string) {
    const existing = await this.prisma.assetFieldDefinition.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        'Asset field definition not found',
      );
    }

    await this.prisma.assetFieldDefinition.delete({
      where: { id },
    });

    return {
      message: 'Asset field definition deleted successfully',
    };
  }
}