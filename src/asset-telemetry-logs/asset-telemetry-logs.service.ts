import { Injectable } from '@nestjs/common';
import { CreateAssetTelemetryLogDto } from './dto/create-asset-telemetry-log.dto';
import { UpdateAssetTelemetryLogDto } from './dto/update-asset-telemetry-log.dto';
import { PrismaClient } from '@prisma/client/extension';

@Injectable()
export class AssetTelemetryLogsService {
  create(dto: CreateAssetTelemetryLogDto,
    prisma: PrismaClient) {
    return prisma.assetTelemetryLog.create({
      data: {
        assetId: dto.assetId,
        latitud: dto.latitud,
        longitud: dto.longitud,
        speed: dto.speed,
        recordedAt: dto.recordedAt ?? new Date(),
      },
    });
  }

  findAll(prisma: PrismaClient) {
    return prisma.assetTelemetryLog.findMany({
      orderBy: {
        recordedAt: 'desc',
      },
    });
  }

  // 2. HISTORIAL (por asset)
  findAllHistoryByAsset(
    assetId: string,
    prisma: PrismaClient,
  ) {
    return prisma.assetTelemetryLog.findMany({
      where: { assetId },
      orderBy: {
        recordedAt: 'desc',
      },
    });
  }

  // 3. ÚLTIMA UBICACIÓN
  async findLatest(
    assetId: string,
    prisma: PrismaClient,
  ) {
    return prisma.assetTelemetryLog.findFirst({
      where: { assetId },
      orderBy: {
        recordedAt: 'desc',
      },
    });
  }

  findOne(assetId: string,
    prisma: PrismaClient,) {
    return prisma.assetTelemetryLog.findFirst({
      where: { assetId },
      orderBy: {
        recordedAt: 'desc',
      },
    });
  }

  update(id: string,
    dto: UpdateAssetTelemetryLogDto,
    prisma: PrismaClient,) {
    return prisma.assetTelemetryLog.update({
      where: { id },
      data: {
        latitud: dto.latitud,
        longitud: dto.longitud,
        speed: dto.speed,
      },
    });
  }

  async remove(id: string, prisma: PrismaClient) {
    return prisma.assetTelemetryLog.delete({
      where: { id },
    });
  }
}
