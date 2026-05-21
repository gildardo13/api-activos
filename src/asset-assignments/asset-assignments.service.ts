import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetAssignmentDto } from './dto/create-asset-assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset-assignment.dto';
import { PrismaClient } from '@prisma/client/extension';

@Injectable()
export class AssetAssignmentsService {
  async create(dto: CreateAssetAssignmentDto,
    prisma: PrismaClient,) {
    const asset = await prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // 2. validar asignación activa única
    const activeAssignment = await prisma.assetAssignment.findFirst({
      where: {
        assetId: dto.assetId,
        returnedAt: null,
      },
    });

    if (activeAssignment) {
      throw new BadRequestException(
        'Asset already has an active assignment',
      );
    }


    // 3. crear asignación
    return prisma.assetAssignment.create({
      data: {
        assetId: dto.assetId,
        assignmentType: dto.assignmentType,
        projectId: dto.projectId,
        staffId: dto.staffId,
        areaId: dto.areaId,
        assignedAt: dto.assignedAt ? new Date(dto.assignedAt) : new Date(),
        returnedAt: dto.returnedAt ? new Date(dto.assignedAt) : new Date(),
      },
    });
  }

  findAll(prisma: PrismaClient) {
    return prisma.assetAssignment.findMany({
      include: {
        asset: true,
        project: true,
        rhStaff: true,
        rhArea: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, prisma: PrismaClient) {
    const assignment = await prisma.assetAssignment.findUnique({
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
    dto: UpdateAssetAssignmentDto,
    prisma: PrismaClient,) {
    const existing = await prisma.assetAssignment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Assignment not found');
    }

    return prisma.assetAssignment.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string, prisma: PrismaClient) {
    const existing = await prisma.assetAssignment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Assignment not found');
    }

    await prisma.assetAssignment.delete({
      where: { id },
    });

    return {
      message: 'Assignment deleted successfully',
    };
  }

  // 4. return asset (cerrar asignación)
  async returnAsset(id: string, prisma: PrismaClient) {
    const assignment = await prisma.assetAssignment.findUnique({
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

    return prisma.assetAssignment.update({
      where: { id },
      data: {
        returnedAt: new Date(),
      },
    });
  }
}
