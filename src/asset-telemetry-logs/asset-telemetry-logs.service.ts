import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAssetTelemetryLogDto } from './dto/create-asset-telemetry-log.dto';
import { UpdateAssetTelemetryLogDto } from './dto/update-asset-telemetry-log.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssetType } from 'src/asset-types/entities/asset-type.entity';

@Injectable()
export class AssetTelemetryLogsService {
  constructor(private prisma: PrismaService) { }

  // 1. REGISTRAR TELEMETRÍA
  async create(dto: CreateAssetTelemetryLogDto) {
    // 1. Verificar si el asset existe
    const assetExist = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!assetExist) {
      throw new BadRequestException('Asset not found');
    }

    // 2. Ejecutar la creación y la actualización en una transacción simultánea
    const [telemetry, updateAsset] = await this.prisma.$transaction(async (tx) => {
      // IMPORTANTE: Nota el 'await' y el uso de 'tx' en lugar de 'this.prisma'
      const newTelemetry = await tx.assetTelemetryLog.create({
        data: {
          assetId: dto.assetId,
          latitud: dto.latitud,
          longitud: dto.longitud,
          speed: dto.speed,
          recordedAt: dto.recordedAt ?? new Date(),
        },
      });

      // Ahora 'newTelemetry.id' sí existe de verdad porque la BD ya respondió
      const updated = await tx.asset.update({
        where: { id: dto.assetId },
        data: {
          lastLocation: newTelemetry.id, // <-- Asignamos el ID real
        },
      });

      return [newTelemetry, updated];
    });
    return telemetry;
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
  // 4. OBTENER LAS ÚLTIMAS UBICACIONES DE TODOS LOS ASSETS (Optimizado sin N+1)
  async findAllLatest() {
    // 1. Obtenemos los assets filtrando desde la BD que tengan un 'lastLocation' válido
    const listAsset = await this.prisma.asset.findMany({
      where: {
        AND: [
          { lastLocation: { not: null } },
          { lastLocation: { not: "" } }
        ]
      },
      include: {
        assetType: true
      }
    });

    // 2. Extraemos los IDs asegurándonos doblemente en JS que no pasen vacíos o nulos
    const telemetryIds = listAsset
      .map((item) => item.lastLocation)
      .filter((id): id is string => typeof id === "string" && id.trim() !== "");

    // Si ningún asset tiene telemetría válida, evitamos una consulta innecesaria a la BD
    if (telemetryIds.length === 0) {
      return [];
    }

    // 3. Traemos todas las telemetrías en una sola consulta
    const telemetries = await this.prisma.assetTelemetryLog.findMany({
      where: {
        id: { in: telemetryIds },
      },
    });


    return listAsset.map((asset) => {
      const telemetry = telemetries.find((t) => t.id === asset.lastLocation);
      const data = {
        ...telemetry,
        assetId: asset 
      }
      return data
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