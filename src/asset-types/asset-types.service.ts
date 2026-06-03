import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { UpdateAssetTypeDto } from './dto/update-asset-type.dto';
import { Prisma, Status } from '@prisma/client';
import { QueryAssetTypeDto } from './dto/query-asset-type.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssetTypesService {
  constructor(private prisma: PrismaService) { }
  async create(createAssetTypeDto: CreateAssetTypeDto) {
    const existing = await this.prisma.assetType.findFirst({
      where: {
        name: createAssetTypeDto.name,
      },
    });

    if (existing) {
      throw new BadRequestException('Asset type already exists');
    }

    // Separamos categoryId para manejar el tipado estricto de Prisma Json
    const { categoryId, ...restDto } = createAssetTypeDto;

    const newAssetType = await this.prisma.assetType.create({
      data: {
        ...restDto,
        categoryId: categoryId as unknown as Prisma.InputJsonValue,
      },
    });

    return newAssetType;
  }

  async findAll(query: QueryAssetTypeDto) {
    const {
      page = 1,
      limit = 10,
      status,
      searchTerm,
      sortByDate = 'desc',
    } = query;

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

    const shouldPaginate =
      query.page !== undefined || query.limit !== undefined;

    const prismaQuery: any = {
      where,
      include: {
        assets: true,
        assetFieldDefinitions: true,
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
      this.prisma.assetType.findMany(prismaQuery),

      this.prisma.assetType.count({
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
  async findOne(
    id: string,
  ) {
    const assetType = await this.prisma.assetType.findUnique({
      where: {
        id,
      },
      include: {
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

  async update(id: string, updateAssetTypeDto: UpdateAssetTypeDto) {
    const existing = await this.prisma.assetType.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Asset type not found');
    }

    // Separamos categoryId para evitar el choque con la firma de índice de TypeScript
    const { categoryId, ...restDto } = updateAssetTypeDto;

    const updatedAssetType = await this.prisma.assetType.update({
      where: { id },
      data: {
        ...restDto,
        ...(categoryId !== undefined && {
          categoryId: categoryId as unknown as Prisma.InputJsonValue,
        }),
      },
      include: {
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

  async deleteAssetType(id: string) {
    const existing = await this.prisma.assetType.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Asset type not found');
    }

    return this.prisma.assetType.delete({
      where: { id },
    });
  }
}
