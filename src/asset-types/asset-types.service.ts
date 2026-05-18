import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { UpdateAssetTypeDto } from './dto/update-asset-type.dto';
import { PrismaClient, Status } from '@prisma/client';
import { QueryAssetTypeDto } from './dto/query-asset-type.dto';

@Injectable()
export class AssetTypesService {
  async create(createAssetTypeDto: CreateAssetTypeDto, prisma: PrismaClient) {
    const existing = await prisma.assetType.findFirst({
      where: {
        name: createAssetTypeDto.name,
      },
    });

    if (existing) {
      throw new BadRequestException('Asset type already exists');
    }

    const newAssetType = await prisma.assetType.create({
      data: createAssetTypeDto,
    });

    return newAssetType;
  }

  async findAll(
    query: QueryAssetTypeDto,
    prisma: PrismaClient,
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
      prisma.assetType.findMany({
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

      prisma.assetType.count({
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
    prisma: PrismaClient,
  ) {
    const assetType = await prisma.assetType.findUnique({
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
    prisma: PrismaClient,
  ) {
    const existing = await prisma.assetType.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        'Asset type not found',
      );
    }

    const updatedAssetType = await prisma.assetType.update({
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
    status: Status,
    prisma: PrismaClient,
  ) {
    const existing = await prisma.assetType.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Asset type not found');
    }

    return prisma.assetType.update({
      where: { id },
      data: { status },
    });
  }
}
