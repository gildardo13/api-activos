import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryJibbyDto } from './dto/create-category-jibby.dto';
import { UpdateCategoryJibbyDto } from './dto/update-category-jibby.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryCategoryJibbyDto } from './dto/query-category-jibby.dto';

@Injectable()
export class CategoryJibbyService {
  constructor(private prisma: PrismaService) { }

  async create(createCategoryJibbyDto: CreateCategoryJibbyDto) {
    const existing = await this.prisma.jibbyCategory.findFirst({
      where: {
        name: createCategoryJibbyDto.name,
      }
    })
    if (existing) {
      throw new BadRequestException('Asset type already exists');
    }
    const newCategory = await this.prisma.jibbyCategory.create({
      data: {
        name: createCategoryJibbyDto.name,
      }
    })

    return newCategory;
  }
  

  async findAll(query: QueryCategoryJibbyDto) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      sortByDate = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // ── Búsqueda ─────────────────────────────────────
    if (searchTerm?.trim()) {
      where.OR = [
        {
          name: {
            contains: searchTerm.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.jibbyCategory.count({
        where,
      }),

      this.prisma.jibbyCategory.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          name: sortByDate,
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
  async findAllNotPagination() {
    const categories = await this.prisma.jibbyCategory.findMany();
    return categories;
  }

  async findOne(id: string) {
    const category = await this.prisma.jibbyCategory.findUnique({
      where: {
        id,
      }
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryJibbyDto: UpdateCategoryJibbyDto) {
    const existing = await this.prisma.jibbyCategory.findUnique({
      where: {
        id,
      }
    })
    if (!existing) {
      throw new BadRequestException('Category not found');
    }
    const updated = await this.prisma.jibbyCategory.update({
      where: {
        id,
      },
      data: updateCategoryJibbyDto,
    })
    return updated;
  }

  async remove(id: string) {
    const existing = await this.prisma.jibbyCategory.findUnique({
      where: {
        id,
      }
    })
    if (!existing) {
      throw new BadRequestException('Category not found');
    }
    const deleted = await this.prisma.jibbyCategory.delete({
      where: {
        id,
      }
    })
    return deleted;
  }
}
