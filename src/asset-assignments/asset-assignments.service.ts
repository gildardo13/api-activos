import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetAssignmentDto } from './dto/create-asset-assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset-assignment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryAssetsAssignmentDto } from './dto/query-asset-assignment.dto';
import { QueryHistoryAssignmentDto } from './dto/query-history-assignment.dto';
import { StatusApproval, StatusReturn } from '@prisma/client';
import { ApprovalFlowsService } from 'src/approval-flows/approval-flows.service';

@Injectable()
export class AssetAssignmentsService {
  private readonly moduleActionId = process.env.MODULE_ACTION_ASSIGNMENT_ID;

  constructor(
    private readonly prisma: PrismaService,

    @Inject(forwardRef(() => ApprovalFlowsService))
    private readonly approvalFlowsService: ApprovalFlowsService,
  ) { }

  async create(dto: CreateAssetAssignmentDto) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (asset.statusApproval === "PENDING") {
      throw new BadRequestException('El activo se encuentra en proceso de aprobación');
    }

    // 2. validar asignación activa única
    const activeAssignment = await this.prisma.assetAssignment.findFirst({
      where: {
        assetId: dto.assetId,
        returnedAt: null,
      },
    });

    if (activeAssignment && activeAssignment.statusApproval !== 'REJECTED') {
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
        staffId: dto.staffId ? (dto.staffId as any) : null,
        areaId: dto.areaId ? (dto.areaId as any) : null,
        assignedAt: dto.assignedAt ? new Date(dto.assignedAt) : new Date(),
        statusApproval: StatusApproval.PENDING,
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

    // ── Búsqueda por Activo y Proyecto ──────────────────────
    // Nota: staff/área ya no tienen tabla local; el filtro por nombre
    // de colaborador o área debe realizarse en el frontend.
    if (searchTerm) {
      where.OR = [
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
        {
          project: {
            name: { contains: searchTerm, mode: 'insensitive' },
          },
        },
      ];
    }

    // 1. Obtener información básica para ordenar en memoria
    const allMatching = await this.prisma.assetAssignment.findMany({
      where,
      select: {
        id: true,
        statusReturned: true,
        createdAt: true,
      },
    });

    // 2. Ordenar en memoria: PENDING (1), null / IN_USE (2), RETURNED (3)
    allMatching.sort((a, b) => {
      const getScore = (status: string | null) => {
        if (status === 'PENDING') return 1;
        if (status === 'IN_USE' || status === null) return 2;
        if (status === 'RETURNED') return 3;
        return 2;
      };
      const scoreA = getScore(a.statusReturned);
      const scoreB = getScore(b.statusReturned);

      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }

      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      return sortByDate === 'desc' ? tB - tA : tA - tB;
    });

    const total = allMatching.length;
    const pageIds = allMatching.slice(skip, skip + limit).map((x) => x.id);

    // 3. Traer los objetos completos correspondientes a la página actual
    const items = await this.prisma.assetAssignment.findMany({
      where: {
        id: { in: pageIds },
      },
      include: {
        asset: true,
        project: true,
      },
    });

    // 4. Mantener el orden calculado
    items.sort((a, b) => pageIds.indexOf(a.id) - pageIds.indexOf(b.id));

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
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    return assignment;
  }


  async findHistory(idAsset: string, query?: QueryHistoryAssignmentDto) {
    const { searchTerm, assignmentType } = query ?? {};

    const where: any = {
      assetId: idAsset,
    };

    // ── Filtro por tipo de asignación ──────────────────────────
    if (assignmentType) {
      where.assignmentType = assignmentType;
    }

    // ── Búsqueda por nombre del proyecto ─────────────────────
    // Nota: staff/área ya no tienen tabla local; búsqueda por nombre
    // de colaborador o área debe realizarse en el frontend.
    if (searchTerm) {
      where.OR = [
        {
          project: {
            name: { contains: searchTerm, mode: 'insensitive' },
          },
        },
      ];
    }

    const history = await this.prisma.assetAssignment.findMany({
      where,
      include: {
        asset: true,
        project: true,
      },
      orderBy: {

        createdAt: 'desc',
      },
    });
    if (!history || history.length === 0) {
      return [];
    }
    return history;

  }

  async update(id: string, dto: UpdateAssetAssignmentDto) {
    const existing = await this.prisma.assetAssignment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Assignment not found');
    }

    // Como desestructurar '...dto' directo puede romper los formatos de fecha o el tipado estricto de Prisma Json,
    // es más seguro mapear los campos explícitamente:
    const dataToUpdate: any = {
      ...dto,
    };
    if (dto.staffId) dataToUpdate.staffId = dto.staffId as any;
    if (dto.areaId) dataToUpdate.areaId = dto.areaId as any;

    return this.prisma.assetAssignment.update({
      where: { id },
      data: dataToUpdate,
    });
  }
  async remove(id: string) {
    const existing = await this.prisma.assetAssignment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Assignment not found');
    }
    if (existing.statusApproval === 'REJECTED') {
      await this.prisma.assetAssignment.delete({
        where: { id },
      });
      return {
        message: 'Assignment deleted successfully',
      };

    }
    if (existing.statusApproval === 'PENDING') {
      throw new BadRequestException('No se puede eliminar una asignacion si el activo no ha sido aprobado');
    }
    if (existing.statusReturned !== 'RETURNED') {
      throw new BadRequestException('No se puede eliminar una asignacion si el activo no ha sido devuelto');
    }

    await this.prisma.assetAssignment.delete({
      where: { id },
    });

    return {
      message: 'Assignment deleted successfully',
    };
  }

  async removeDefinitve(id: string) {
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
        statusReturned: 'RETURNED',
      },
    });
  }

  async findAllStatus(query: any) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const { staffId, areaId, projectId, searchTerm, sortByDate = 'desc' } = query;

    const skip = (page - 1) * limit;
    const where: any = {
      statusApproval: 'APPROVED',
    };

    if (projectId) {
      where.projectId = projectId;
    } else if (staffId && areaId) {
      // Traer asignaciones del colaborador O de su área (solo cuando staffId es null)
      where.OR = [
        {
          staffId: {
            path: ['id'],
            equals: staffId,
          },
        },
        {
          AND: [
            {
              areaId: {
                path: ['id'],
                equals: areaId,
              },
            },
            {
              staffId: { equals: null },
            },
          ],
        },
      ];
    } else if (staffId) {
      where.staffId = {
        path: ['id'],
        equals: staffId,
      };
    } else if (areaId) {
      where.areaId = {
        path: ['id'],
        equals: areaId,
      };
    }

    if (searchTerm) {
      const searchOR = [
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
        {
          project: {
            name: { contains: searchTerm, mode: 'insensitive' },
          },
        },
      ];

      // Si ya hay un OR (staff+area), combinar ambos con AND
      if (where.OR) {
        const existingOR = where.OR;
        delete where.OR;
        where.AND = [
          { OR: existingOR },
          { OR: searchOR },
        ];
      } else {
        where.OR = searchOR;
      }
    }

    // 1. Obtener información básica para ordenar en memoria
    const allMatching = await this.prisma.assetAssignment.findMany({
      where,
      select: {
        id: true,
        statusReturned: true,
        createdAt: true,
      },
    });

    // 2. Ordenar en memoria: PENDING (1), null / IN_USE (2), RETURNED (3)
    allMatching.sort((a, b) => {
      const getScore = (status: string | null) => {
        if (status === 'PENDING') return 1;
        if (status === 'IN_USE' || status === null) return 2;
        if (status === 'RETURNED') return 3;
        return 2;
      };
      const scoreA = getScore(a.statusReturned);
      const scoreB = getScore(b.statusReturned);

      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }

      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      return sortByDate === 'desc' ? tB - tA : tA - tB;
    });

    const total = allMatching.length;
    const pageIds = allMatching.slice(skip, skip + limit).map((x) => x.id);

    // 3. Traer los objetos completos correspondientes a la página actual
    const items = await this.prisma.assetAssignment.findMany({
      where: {
        id: { in: pageIds },
      },
      include: {
        asset: true,
        project: true,
      },
    });

    // 4. Mantener el orden calculado
    items.sort((a, b) => pageIds.indexOf(a.id) - pageIds.indexOf(b.id));

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

  async changeReturnStatus(id: string) {
    const assignment = await this.prisma.assetAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    let statusReturned: 'PENDING' | 'RETURNED' | 'IN_USE' = 'PENDING';
    let returnedAt: Date | null = null;

    if (!assignment.statusReturned || assignment.statusReturned === 'IN_USE') {
      statusReturned = 'PENDING';
    } else if (assignment.statusReturned === 'PENDING') {

      statusReturned = 'RETURNED';
      const asset = await this.prisma.asset.findUnique({
        where: { id: assignment.assetId },
      });
      if (asset) {
        await this.prisma.asset.update({
          where: { id: assignment.assetId },
          data: {
            lastLocation: null,
          },
        });
        await this.prisma.assetTelemetryLog.deleteMany({
          where: { assetId: assignment.assetId },
        })
        await this.prisma.assetGeofence.deleteMany({
          where: { assetId: assignment.assetId },
        })
      }
      returnedAt = new Date();
    } else {
      throw new BadRequestException('La asignación ya ha sido devuelta.');
    }

    return this.prisma.assetAssignment.update({
      where: { id },
      data: {
        statusReturned,
        returnedAt,
      },
    });
  }


  async approvalStatus(id: string, status: any, rejectionComment?: string, isreject?: boolean) {

    try {
      await this.prisma.assetAssignment.update({
        where: { id },
        data: {
          statusApproval: status as "PENDING" | "APPROVED" | "REJECTED",
          commentsApproval: rejectionComment,
          returnedAt: isreject ? new Date() : null,
          statusReturned: isreject ? StatusReturn.RETURNED : null,

        },
      });
      
      return {
        message: 'Assignment updated successfully',
      };
    } catch (err: any) {
      console.log(err);
    }
  }
}
