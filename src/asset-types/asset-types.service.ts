import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { UpdateAssetTypeDto } from './dto/update-asset-type.dto';
import {  Status } from '@prisma/client';
import { QueryAssetTypeDto } from './dto/query-asset-type.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssetTypesService {
  constructor(private prisma: PrismaService) {}
  async create(createAssetTypeDto: CreateAssetTypeDto) {
    const existing = await this.prisma.assetType.findFirst({
      where: {
        name: createAssetTypeDto.name,
      },
    });

    if (existing) {
      throw new BadRequestException('Asset type already exists');
    }

    const newAssetType = await this.prisma.assetType.create({
      data: createAssetTypeDto,
    });

    return newAssetType;
  }

  async findAll(
    query: QueryAssetTypeDto,
  ) {
    const {
      page = 1,
      limit = 10,
      status,
      searchTerm,
      sortByDate = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (searchTerm) {
      where.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.assetType.findMany({
        where,
        include: {
          jibbyCategory: true,
          assets: true,
          assetFieldDefinitions: true,
        },
        orderBy: {
          createdAt: sortByDate,
        },
        skip,
        take: limit,
      }),

      this.prisma.assetType.count({
        where,
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    id: string,
  ) {
    const assetType = await this.prisma.assetType.findUnique({
      where: {
        id,
      },
      include: {
        jibbyCategory: true,
        assets: true,
        assetFieldDefinitions: true,
      },
    });

    if (!assetType) {
      throw new NotFoundException(
        'Asset type not found',
      );
    }

    return assetType;
  }

  async update(
    id: string,
    updateAssetTypeDto: UpdateAssetTypeDto,
  ) {
    const existing = await this.prisma.assetType.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        'Asset type not found',
      );
    }

    const updatedAssetType = await this.prisma.assetType.update({
      where: {
        id,
      },
      data: updateAssetTypeDto,
      include: {
        jibbyCategory: true,
        assets: true,
        assetFieldDefinitions: true,
      },
    });

    return updatedAssetType;
  }

  async changeStatus(
    id: string,
    status: Status
  ) {
    const existing = await this.prisma.assetType.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Asset type not found');
    }

    return this.prisma.assetType.update({
      where: { id },
      data: { status },
    });
  }
}
