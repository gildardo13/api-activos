import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetAssignmentDto } from './dto/create-asset-assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset-assignment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryAssetsAssignmentDto } from './dto/query-asset-assignment.dto';

@Injectable()
export class AssetAssignmentsService {
  constructor(private readonly prisma: PrismaService) { }
  async create(dto: CreateAssetAssignmentDto) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // 2. validar asignación activa única
    const activeAssignment = await this.prisma.assetAssignment.findFirst({
      where: {
        assetId: dto.assetId,
        returnedAt: null,
      },
    });

    if (activeAssignment) {
      throw new BadRequestException(
        'El activo ya tiene una asignación activa.',
      );
    }


    // 3. crear asignación
    return this.prisma.assetAssignment.create({
      data: {
        assetId: dto.assetId,
        assignmentType: dto.assignmentType,
        projectId: dto.projectId,
        staffId: dto.staffId,
        areaId: dto.areaId,
        assignedAt: dto.assignedAt ? new Date(dto.assignedAt) : new Date()
      },
    });
  }

  async findAll(query: QueryAssetsAssignmentDto) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      sortByDate = 'desc',
      status,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    // ── Filtro por estado de la asignación ──────────────────
    if (status) {
      where.status = status;
    }

    // ── Búsqueda Avanzada por Relaciones ────────────────────
    if (searchTerm) {
      where.OR = [
        // Buscar en los datos del Activo vinculado
        {
          asset: {
            name: { contains: searchTerm, mode: 'insensitive' },
          },
        },
        {
          asset: {
            code: { contains: searchTerm, mode: 'insensitive' },
          },
        },
        // Buscar en el nombre del Proyecto asignado
        {
          project: {
            name: { contains: searchTerm, mode: 'insensitive' },
          },
        },
        // Buscar en el nombre del Colaborador (Staff) asignado
        {
          rhStaff: {
            name: { contains: searchTerm, mode: 'insensitive' },
          },
        },
        // Buscar en el nombre del Área asignada
        {
          rhArea: {
            name: { contains: searchTerm, mode: 'insensitive' },
          },
        },
      ];
    }

    // ── Consulta en Paralelo (Paginación y Conteo) ──────────
    const [total, items] = await Promise.all([
      this.prisma.assetAssignment.count({
        where,
      }),

      this.prisma.assetAssignment.findMany({
        where,
        skip,
        take: limit,
        include: {
          asset: true,     // Trae info básica del activo
          project: true,   // Trae info del proyecto si aplica
          rhStaff: true,   // Trae info del colaborador si aplica
          rhArea: true,    // Trae info de la empresa/área si aplica
        },
        orderBy: {
          createdAt: sortByDate, // Ordena por fecha de creación del registro
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
    const assignment = await this.prisma.assetAssignment.findUnique({
      where: { id },
      include: {
        asset: true,
        project: true,
        rhStaff: true,
        rhArea: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    return assignment;
  }

  async update(id: string,
    dto: UpdateAssetAssignmentDto) {
    const existing = await this.prisma.assetAssignment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Assignment not found');
    }

    return this.prisma.assetAssignment.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.assetAssignment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Assignment not found');
    }

    await this.prisma.assetAssignment.delete({
      where: { id },
    });

    return {
      message: 'Assignment deleted successfully',
    };
  }

  // 4. return asset (cerrar asignación)
  async returnAsset(id: string) {
    const assignment = await this.prisma.assetAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.returnedAt) {
      throw new BadRequestException(
        'Asset already returned',
      );
    }

    return this.prisma.assetAssignment.update({
      where: { id },
      data: {
        returnedAt: new Date(),
      },
    });
  }
}
