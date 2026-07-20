import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateAssetTelemetryLogDto } from './dto/create-asset-telemetry-log.dto';
import { UpdateAssetTelemetryLogDto } from './dto/update-asset-telemetry-log.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssetType } from 'src/asset-types/entities/asset-type.entity';
import { QueryAssetTelemetryLogDto } from './dto/query-asset-telemetry-log.dto';
import { isPointInPolygon, calculateTripName } from './helper/helper';

@Injectable()
export class AssetTelemetryLogsService {
  private readonly logger = new Logger(AssetTelemetryLogsService.name);

  constructor(private prisma: PrismaService) { }

  // 1. REGISTRAR TELEMETRÍA
  async create(dto: CreateAssetTelemetryLogDto) {
    // MODIFICACIÓN: Si el motor está apagado (ignition === 0), forzamos la velocidad a '0'
    // para evitar que la deriva de la señal GPS registre velocidades falsas con el tractor quieto.
    if (dto.metadata?.ignition === 0) {
      dto.speed = '0';
    }

    // 1. Verificar si el asset existe
    const assetExist = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!assetExist) {
      throw new BadRequestException('Asset not found');
    }

    if (parseFloat(dto.latitud) === 0 || parseFloat(dto.longitud) === 0) {
      throw new BadRequestException('La latitud o longitud no pueden ser 0.');
    }

    // Obtener la última telemetría registrada para este activo
    const lasTelemetry = await this.prisma.assetTelemetryLog.findFirst({
      where: {
        assetId: dto.assetId,
      },
      orderBy: [
        { recordedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });


    // 2. Validar que las coordenadas no sean idénticas a las últimas registradas,
    // a menos que haya algún cambio de estado relevante (ignición, velocidad, o E/S).
    if (lasTelemetry) {
      const isLocationIdentical = lasTelemetry.latitud === dto.latitud && lasTelemetry.longitud === dto.longitud;
      
      const lastMetadata = (lasTelemetry.metadata as Record<string, any>) || {};
      const lastVoltage = lastMetadata.externalVoltage !== undefined && lastMetadata.externalVoltage !== null ? Number(lastMetadata.externalVoltage) : 0;
      const wasOnExternalPower = lastVoltage > 5;
      const inputMetadata = dto.metadata || {};
      const isExternalPowerLost = (inputMetadata.externalVoltage === 0 || inputMetadata.externalVoltage === null || inputMetadata.externalVoltage === undefined) && wasOnExternalPower;

      const resolvedDin1 = inputMetadata.din1 !== undefined && inputMetadata.din1 !== null ? inputMetadata.din1 : 0;
      const resolvedDin2 = inputMetadata.din2 !== undefined && inputMetadata.din2 !== null ? inputMetadata.din2 : 0;
      const resolvedDout1 = inputMetadata.dout1 !== undefined && inputMetadata.dout1 !== null ? inputMetadata.dout1 : 0;
      const resolvedAin1 = inputMetadata.ain1 !== undefined && inputMetadata.ain1 !== null ? inputMetadata.ain1 : 0;

      const hasStateChanged = 
        lastMetadata.ignition !== inputMetadata.ignition ||
        lastMetadata.din1 !== resolvedDin1 ||
        lastMetadata.din2 !== resolvedDin2 ||
        lastMetadata.ain1 !== resolvedAin1 ||
        lastMetadata.dout1 !== resolvedDout1 ||
        isExternalPowerLost;

      if (isLocationIdentical && !hasStateChanged) {
        throw new BadRequestException('Las coordenadas y estados son idénticas a la última telemetría registrada.');
      }

      //.APAGADO.
      const isStillOff = inputMetadata.ignition === 0 && lastMetadata.ignition === 0 && lastVoltage <= 5 && (inputMetadata.externalVoltage === 0 || inputMetadata.externalVoltage === null || inputMetadata.externalVoltage === undefined);
      if (isStillOff && !hasStateChanged) {
        throw new BadRequestException('El vehículo ya estaba apagado. Telemetría omitida.');
      }
    }

    // 3. Ejecutar la creación y la actualización en una transacción simultánea
    const [telemetry, updateAsset] = await this.prisma.$transaction(async (tx) => {
      const inputMetadata = dto.metadata || {};
      const finalExternalVoltage = inputMetadata.externalVoltage !== undefined && inputMetadata.externalVoltage !== null ? inputMetadata.externalVoltage : null;
      const finalBatteryVoltage = inputMetadata.batteryVoltage !== undefined && inputMetadata.batteryVoltage !== null ? inputMetadata.batteryVoltage : null;
      const currentIgnition = inputMetadata.ignition !== undefined && inputMetadata.ignition !== null ? inputMetadata.ignition : null;

      const tripName = dto.tripName ?? (await calculateTripName(tx, dto.assetId, currentIgnition, lasTelemetry));

      const newTelemetry = await tx.assetTelemetryLog.create({
        data: {
          assetId: dto.assetId,
          latitud: dto.latitud,
          longitud: dto.longitud,
          speed: dto.speed,
          tripName: tripName,
          isActive: dto.isActive,
          metadata: {
            din1: inputMetadata.din1 !== undefined && inputMetadata.din1 !== null ? inputMetadata.din1 : 0,
            din2: inputMetadata.din2 !== undefined && inputMetadata.din2 !== null ? inputMetadata.din2 : 0,
            dout1: inputMetadata.dout1 !== undefined && inputMetadata.dout1 !== null ? inputMetadata.dout1 : 0,
            ain1: inputMetadata.ain1 !== undefined && inputMetadata.ain1 !== null ? inputMetadata.ain1 : 0,
            ignition: currentIgnition,
            externalVoltage: finalExternalVoltage,
            batteryVoltage: finalBatteryVoltage,
          },
          recordedAt: dto.recordedAt ?? new Date(),
        },
      });

      // Actualizar el puntero de la última ubicación en el Asset
      const updated = await tx.asset.update({
        where: { id: dto.assetId },
        data: {
          lastLocation: newTelemetry.id, // Asignamos el ID real recién creado
        },
      });

      return [newTelemetry, updated];
    });

    return telemetry;
  }

  // 2. PRUEBA DE POSTMAN 
  async findAllHistoryByAssetPrueba(assetId: string, from?: string, to?: string) {
    const assetExist = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!assetExist) {
      throw new BadRequestException('Asset not found');
    }

    const where: any = {
      assetId,
      isActive: true,
    };

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    return this.prisma.assetTelemetryLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
  // 2. OBTENER HISTORIAL (Por Asset)
  async findAllHistoryByAsset(assetId: string, from?: string, to?: string) {
    const assetExist = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!assetExist) {
      throw new BadRequestException('Asset not found');
    }

    const where: any = {
      assetId,
      isActive: true,
    };

    if (from || to) {
      where.recordedAt = {};
      if (from) {
        where.recordedAt.gte = new Date(from);
      }
      if (to) {
        where.recordedAt.lte = new Date(to);
      }
    }

    return this.prisma.assetTelemetryLog.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
    });
  }

  // 2.1 OBTENER HISTORIAL INACTIVO (Por Asset)
  async findAllInactiveHistoryByAsset(assetId: string, from?: string, to?: string) {
    const assetExist = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!assetExist) {
      throw new BadRequestException('Asset not found');
    }

    const where: any = {
      assetId,
      isActive: false,
    };

    if (from || to) {
      where.recordedAt = {};
      if (from) {
        where.recordedAt.gte = new Date(from);
      }
      if (to) {
        where.recordedAt.lte = new Date(to);
      }
    }

    return this.prisma.assetTelemetryLog.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
    });
  }

  // 3. OBTENER ÚLTIMA UBICACIÓN (De un asset específico)
  async findLatestByAsset(assetId: string) {
    const latest = await this.prisma.assetTelemetryLog.findFirst({
      where: { assetId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!latest) {
      throw new BadRequestException(
        'No telemetry logs found for this asset',
      );
    }

    return this.adjustTelemetryOfflineStatus(latest);
  }

  // 4. OBTENER LAS ÚLTIMAS UBICACIONES DE TODOS LOS ASSETS (Optimizado sin N+1)
  async findAllLatest(search?: string) {
    const whereAndClause: any[] = [
      { lastLocation: { not: null } },
      { lastLocation: { not: "" } },

      // Regla 1 CORREGIDA: Permite nulos y estados diferentes a PENDING
      {
        OR: [
          { statusApproval: { not: 'PENDING' } },
          { statusApproval: null }
        ]
      },

      // Regla 2: (Se mantiene igual por ahora)
      {
        assetAssignments: {
          none: {
            statusApproval: {
              in: ['PENDING']
            }
          }
        }
      }
    ];

    if (search) {
      whereAndClause.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    // 1. Obtenemos los assets aplicando las reglas de exclusión desde la BD
    const listAsset = await this.prisma.asset.findMany({
      where: {
        AND: whereAndClause
      },
      include: {
        assetType: true
      }
    });

    // 2. Extraemos los IDs asegurándonos que no pasen vacíos o nulos
    const telemetryIds = listAsset
      .map((item) => item.lastLocation)
      .filter((id): id is string => typeof id === "string" && id.trim() !== "");

    // Si ningún asset tiene telemetría válida o todos fueron excluidos, evitamos la consulta
    if (telemetryIds.length === 0) {
      return [];
    }

    // 3. Traemos todas las telemetrías en una sola consulta
    const telemetries = await this.prisma.assetTelemetryLog.findMany({
      where: {
        id: { in: telemetryIds },
      },
    });

    // 4. Retornamos la combinación de telemetría y su correspondiente Asset limpio
    return listAsset.map((asset) => {
      const telemetry = telemetries.find((t) => t.id === asset.lastLocation);
      return {
        ...this.adjustTelemetryOfflineStatus(telemetry),
        assetId: asset
      };
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
      lastLocations: this.adjustTelemetryArray(lastLocations),
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

  async findOneUniqueByAssetId(assetId: string) {
    const telemetriaCompleta = await this.prisma.assetTelemetryLog.findMany({
      where: {
        assetId: assetId
      },
    });
    const unique = telemetriaCompleta.length === 1;
    if (unique === false) {
      return false;
    } else {
      return telemetriaCompleta;
    }
  }

  async findAllQuery(query: QueryAssetTelemetryLogDto) {
    const where: any = {};

    if (query.assetId) {
      where.assetId = query.assetId;
    }

    if (query.isActive !== undefined) {
      if (query.isActive === 'true') {
        where.isActive = true;
      } else if (query.isActive === 'false') {
        where.isActive = false;
      }
    }

    if (query.searchName) {
      where.asset = {
        name: {
          contains: query.searchName,
          mode: 'insensitive',
        },
      };
    }

    if (query.searchJibbyId) {
      where.asset = {
        ...where.asset,
        assetType: {
          categoryId: {
            path: ['id'],
            equals: query.searchJibbyId,
          },
        },
      };
    }

    return this.prisma.assetTelemetryLog.findMany({
      where,
      include: {
        asset: {
          include: {
            assetType: true,
          },
        },
      },
      orderBy: {
        recordedAt: 'desc',
      },
    });
  }


  async veriGlobal() {
    const listAsset = await this.prisma.asset.findMany({
      where: {
        AND: [
          { lastLocation: { not: null } },
          { lastLocation: { not: "" } }
        ]
      },
      include: {
        assetGeofences: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    const telemetryIds = listAsset
      .map((item) => item.lastLocation)
      .filter((id): id is string => typeof id === "string" && id.trim() !== "");

    if (telemetryIds.length === 0) {
      return [];
    }

    const telemetries = await this.prisma.assetTelemetryLog.findMany({
      where: {
        id: { in: telemetryIds },
      },
    });

    const telemetryMap = new Map(telemetries.map(t => [t.id, t]));

    const listExcesLimit: Array<{
      idAsset: string;
      idTelemtria: any;
      excesLimit: boolean;
      idGeocercas: any[];
    }> = [];

    for (const asset of listAsset) {
      const telemetry = telemetryMap.get(asset.lastLocation!);

      if (!telemetry || asset.assetGeofences.length === 0) continue;

      const lat = parseFloat(telemetry.latitud);
      const lng = parseFloat(telemetry.longitud);
      const geocercasExcedidas: any[] = [];

      for (const geofence of asset.assetGeofences) {
        const coordinatesDto = (geofence.coordinates as any[]) || [];
        const polygon = coordinatesDto.map((coord: { lat: string; lng: string }) => ({
          lat: parseFloat(coord.lat),
          lng: parseFloat(coord.lng)
        }));

        if (polygon.length < 3) continue;

        const estaDentro = isPointInPolygon(lat, lng, polygon);

        if (!estaDentro) {
          geocercasExcedidas.push(geofence);
        }
      }
      if (geocercasExcedidas.length > 0) {
        listExcesLimit.push({
          idAsset: asset.id,
          idTelemtria: telemetry,
          excesLimit: true,
          idGeocercas: geocercasExcedidas
        });
      }
    }

    return listExcesLimit;
  }


  async deleteAssetById(assetId: string) {
    return this.prisma.assetTelemetryLog.deleteMany({
      where: {
        assetId: assetId
      }
    });
  }

  // OBTENER VIAJES AGRUPADOS POR tripName (Para el tab de historial por viaje)
  async findTripsByAsset(assetId: string) {
    const assetExist = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!assetExist) {
      throw new BadRequestException('Asset not found');
    }

    // Traemos todos los logs activos con tripName asignado, ordenados por fecha
    const logs = await this.prisma.assetTelemetryLog.findMany({
      where: {
        assetId,
        isActive: true,
        tripName: { not: null },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Agrupamos por tripName
    const tripsMap = new Map<string, {
      tripName: string;
      points: any[];
      startTime: Date;
      endTime: Date;
    }>();

    for (const log of logs) {
      const name = log.tripName!;
      if (!tripsMap.has(name)) {
        tripsMap.set(name, {
          tripName: name,
          points: [],
          startTime: log.createdAt,
          endTime: log.createdAt,
        });
      }
      const trip = tripsMap.get(name)!;
      trip.points.push({
        id: log.id,
        latitud: log.latitud,
        longitud: log.longitud,
        speed: log.speed,
        recordedAt: log.recordedAt,
        createdAt: log.createdAt,
        metadata: log.metadata,
      });
      if (log.createdAt > trip.endTime) {
        trip.endTime = log.createdAt;
      }
    }

    // Convertimos el mapa a array y añadimos el conteo
    const trips = Array.from(tripsMap.values()).map(trip => ({
      tripName: trip.tripName,
      count: trip.points.length,
      startTime: trip.startTime,
      endTime: trip.endTime,
      points: trip.points,
    }));

    return trips;
  }

  private adjustTelemetryOfflineStatus(telemetry: any) {
    if (!telemetry) return telemetry;

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const dateToCheck = telemetry.recordedAt || telemetry.createdAt;

    if (dateToCheck && new Date(dateToCheck) < tenMinutesAgo) {
      return {
        ...telemetry,
        ignition: null,
      };
    }

    return telemetry;
  }

  private adjustTelemetryArray(telemetries: any[]) {
    return telemetries.map((t) => this.adjustTelemetryOfflineStatus(t));
  }
}