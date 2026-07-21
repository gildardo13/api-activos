import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetGroupDto } from './dto/create-asset-group.dto';
import { UpdateAssetGroupDto } from './dto/update-asset-group.dto';
import { QueryAssetGroupDto } from './dto/query-asset-group.dto';

@Injectable()
export class AssetGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssetGroupDto: CreateAssetGroupDto) {
    const { assetIds, ...rest } = createAssetGroupDto;

    return this.prisma.assetGroup.create({
      data: {
        ...rest,
        assets: assetIds && assetIds.length > 0 ? {
          connect: assetIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        assets: true
      }
    });
  }

  async findAll(query: QueryAssetGroupDto) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      sortByDate = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (searchTerm) {
      where.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          code: {
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

    const [total, items] = await Promise.all([
      this.prisma.assetGroup.count({
        where,
      }),
      this.prisma.assetGroup.findMany({
        where,
        skip,
        take: limit,
        include: {
          assets: true,
        },
        orderBy: {
          createdAt: sortByDate,
        },
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

  async assignAssets(id: string, assetIds: string[]) {
    await this.findOne(id);

    return this.prisma.assetGroup.update({
      where: { id },
      data: {
        assets: {
          set: assetIds.map((assetId) => ({ id: assetId })),
        },
      },
      include: {
        assets: true,
      },
    });
  }

  async findAllNoQuery() {
    return this.prisma.assetGroup.findMany({
      include: {
        assets: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.assetGroup.findUnique({
      where: { id },
      include: {
        assets: true
      }
    });

    if (!group) {
      throw new NotFoundException(`AssetGroup with ID "${id}" not found`);
    }

    return group;
  }

  async update(id: string, updateAssetGroupDto: UpdateAssetGroupDto) {
    await this.findOne(id);

    const { assetIds, ...rest } = updateAssetGroupDto;

    return this.prisma.assetGroup.update({
      where: { id },
      data: {
        ...rest,
        assets: assetIds ? {
          set: assetIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        assets: true
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.assetGroup.delete({
      where: { id }
    });
  }
}
