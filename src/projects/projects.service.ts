import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryProjectsDto } from './dto/query-projects.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createProjectDto: CreateProjectDto) {
    const existProjectType = await this.prisma.project.findFirst({
      where: {
        code: createProjectDto.code,
      },
    });
    if (existProjectType) {
      return `El proyecto ya existe`;
    }
    const project = await this.prisma.project.create({
      data: { ...createProjectDto, status: 'ACTIVE' },
    });
    return project;
  }

  async findAll(query: QueryProjectsDto) {
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
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.project.count({
        where,
      }),
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          updatedAt: sortByDate, // o createdAt si prefieres
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

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
    });
    if (!project) {
      throw new BadRequestException('Project not found');
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.prisma.project.update({
      where: {
        id,
      },
      data: {...updateProjectDto, status: 'ACTIVE'},
    });
    return project;
  }

  async remove(id: string) {
    const project = await this.prisma.project.delete({
      where: {
        id,
      },
    });
    return project;
  }
}
