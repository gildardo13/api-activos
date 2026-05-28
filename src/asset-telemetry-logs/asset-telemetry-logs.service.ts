import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAssetTelemetryLogDto } from './dto/create-asset-telemetry-log.dto';
import { UpdateAssetTelemetryLogDto } from './dto/update-asset-telemetry-log.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssetTelemetryLogsService {
  constructor(private prisma: PrismaService) { }

  // 1. REGISTRAR TELEMETRÍA
  async create(dto: CreateAssetTelemetryLogDto) {
    const assetExist = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!assetExist) {
      throw new BadRequestException('Asset not found');
    }

    return this.prisma.assetTelemetryLog.create({
      data: {
        assetId: dto.assetId,
        latitud: dto.latitud,
        longitud: dto.longitud,
        speed: dto.speed,
        recordedAt: dto.recordedAt ?? new Date(),
      },
    });
  }

  // 2. OBTENER HISTORIAL (Por Asset)
  async findAllHistoryByAsset(assetId: string) {
    const assetExist = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!assetExist) {
      throw new BadRequestException('Asset not found');
    }

    return this.prisma.assetTelemetryLog.findMany({
      where: { assetId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  // 3. OBTENER ÚLTIMA UBICACIÓN (De un asset específico)
  async findLatestByAsset(assetId: string) {
    const latest = await this.prisma.assetTelemetryLog.findFirst({
      where: { assetId },
      orderBy: { recordedAt: 'desc' },
    });

    if (!latest) {
      throw new BadRequestException('No telemetry logs found for this asset');
    }

    return latest;
  }

  // 4. OBTENER LAS ÚLTIMAS UBICACIONES DE TODOS LOS ASSETS (Optimizado sin N+1)
  async findAllLatest() {
    // Usamos groupBy para traer la fecha más reciente de cada asset en UNA sola consulta
    const grouped = await this.prisma.assetTelemetryLog.groupBy({
      by: ['assetId'],
      _max: {
        recordedAt: true,
      },
    });

    if (grouped.length === 0) return [];

    // Construimos los filtros para traer los registros exactos en UNA segunda consulta
    const filters = grouped.map((item) => ({
      assetId: item.assetId,
      recordedAt: item._max.recordedAt!,
    }));

    return this.prisma.assetTelemetryLog.findMany({
      where: {
        OR: filters,
      },
      orderBy: {
        recordedAt: 'desc',
      },
    });
  }
  // OBTENER TODO (Logs históricos + Últimas ubicaciones agrupadas)
  async findAll() {
    // 1. Obtener todos los logs ordenados por fecha de forma descendente
    const logs = await this.prisma.assetTelemetryLog.findMany({
      orderBy: {
        recordedAt: 'desc',
      },
    });

    // 2. Obtener las últimas ubicaciones de cada asset de forma eficiente
    const grouped = await this.prisma.assetTelemetryLog.groupBy({
      by: ['assetId'],
      _max: {
        recordedAt: true,
      },
    });

    let lastLocations = [];

    if (grouped.length > 0) {
      const filters = grouped.map((item) => ({
        assetId: item.assetId,
        recordedAt: item._max.recordedAt!,
      }));

      lastLocations = await this.prisma.assetTelemetryLog.findMany({
        where: {
          OR: filters,
        },
        orderBy: {
          recordedAt: 'desc',
        },
      });
    }

    // Retorna exactamente la estructura que esperabas en tu controlador
    return {
      logs,
      lastLocations,
    };
  }

  // Obtiene un único log de telemetría por su ID de registro
  async findOne(id: string) {
    const log = await this.prisma.assetTelemetryLog.findUnique({
      where: { id },
    });

    if (!log) {
      throw new BadRequestException('Telemetry log not found');
    }

    return log;
  }

  // MÉTODOS ADICIONALES (Opcionales, mantenidos por si los necesitas)
  async update(id: string, dto: UpdateAssetTelemetryLogDto) {
    const logExist = await this.prisma.assetTelemetryLog.findUnique({ where: { id } });
    if (!logExist) throw new BadRequestException('Log not found');

    return this.prisma.assetTelemetryLog.update({
      where: { id },
      data: {
        latitud: dto.latitud,
        longitud: dto.longitud,
        speed: dto.speed,
      },
    });
  }

  async remove(id: string) {
    const logExist = await this.prisma.assetTelemetryLog.findUnique({ where: { id } });
    if (!logExist) throw new BadRequestException('Log not found');

    return this.prisma.assetTelemetryLog.delete({ where: { id } });
  }
}