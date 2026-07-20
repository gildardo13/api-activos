import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAssetGeofenceDto, CoordinatesDto } from './dto/create-asset-geofence.dto';
import { UpdateAssetGeofenceDto } from './dto/update-asset-geofence.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssetGeofencesService {
  constructor(private prisma: PrismaService) { }

  private validateCoordinates(coordinates: CoordinatesDto[]) {
    if (!coordinates || coordinates.length < 3) {
      throw new BadRequestException(
        'A geofence must have at least 3 coordinates',
      );
    }

    for (const point of coordinates) {
      const latNum = Number(point.lat);
      const lngNum = Number(point.lng);

      if (
        isNaN(latNum) ||
        isNaN(lngNum) ||
        latNum < -90 ||
        latNum > 90 ||
        lngNum < -180 ||
        lngNum > 180
      ) {
        throw new BadRequestException(
          `Invalid coordinate: lat=${point.lat}, lng=${point.lng}`,
        );
      }
    }
  }

  // CREATE
  async create(
    dto: CreateAssetGeofenceDto,
  ) {
    this.validateCoordinates(dto.coordinates);

    if (dto.assetId) {
      const assetExist = await this.prisma.asset.findUnique({
        where: { id: dto.assetId },
      });
      if (!assetExist) {
        throw new BadRequestException('Asset not found');
      }
      const assetGeofenceExist = await this.prisma.assetGeofence.findFirst({
        where: {
          assetId: dto.assetId,
          name: dto.name,
        },
      });
      if (assetGeofenceExist) {
        throw new BadRequestException('Asset geofence already exists for this asset');
      }
    } else {
      const assetGeofenceExist = await this.prisma.assetGeofence.findFirst({
        where: {
          name: dto.name,
          assetId: null,
        },
      });
      if (assetGeofenceExist) {
        throw new BadRequestException('Asset geofence already exists');
      }
    }

    return this.prisma.assetGeofence.create({
      data: {
        assetId: dto.assetId ? dto.assetId : undefined,
        name: dto.name,
        coordinates: dto.coordinates as any,
        location: dto.location ?? null,
        status: dto.status ?? 'ACTIVE',
        description: dto.description ?? null,
        mainPhotograph: dto.mainPhotograph ?? null,
        isLimitMovible: dto.isLimitMovible ?? false,
      },
    });
  }

  // ASSIGN GEOFENCE TO MULTIPLE ASSETS
  async assignGeofenceToAssets(dto: {
    name: string;
    description?: string;
    coordinates: CoordinatesDto[];
    location?: string;
    mainPhotograph?: string;
    isLimitMovible?: boolean;
    assetIds: string[];
  }) {
    this.validateCoordinates(dto.coordinates);
    const results = [];
    for (const assetId of dto.assetIds) {
      const existing = await this.prisma.assetGeofence.findFirst({
        where: {
          assetId,
          name: dto.name,
        },
      });
      if (existing) {
        const updated = await this.prisma.assetGeofence.update({
          where: { id: existing.id },
          data: {
            coordinates: dto.coordinates as any,
            location: dto.location,
            description: dto.description,
            mainPhotograph: dto.mainPhotograph,
            isLimitMovible: dto.isLimitMovible ?? true,
            status: 'ACTIVE',
          },
        });
        results.push(updated);
      } else {
        const created = await this.prisma.assetGeofence.create({
          data: {
            assetId,
            name: dto.name,
            coordinates: dto.coordinates as any,
            location: dto.location ?? null,
            description: dto.description ?? null,
            mainPhotograph: dto.mainPhotograph ?? null,
            isLimitMovible: dto.isLimitMovible ?? true,
            status: 'ACTIVE',
          },
        });
        results.push(created);
      }
    }
    return results;
  }

  // FIND ALL
  async findAll() {
    return this.prisma.assetGeofence.findMany({
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            code: true,

          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllGeofences(search?: string) {
    const where: any = {
      asset: {
        assetType: {
          clasificationType: 'INMOVABLE',
        },
      },
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    return this.prisma.assetGeofence.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findLimitedAreas(search?: string) {
    const where: any = {
      isLimitMovible: true,
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    return this.prisma.assetGeofence.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  // FIND ONE
  async findOne(id: string) {
    return this.prisma.assetGeofence.findUnique({
      where: { id },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  // GET GEOFENCE ID ASSET
  async getGeofenceIdAsset(assetId: string) {
    return this.prisma.assetGeofence.findMany({
      where: { assetId },
    });

    
  }

  // UPDATE
  async update(
    id: string,
    dto: UpdateAssetGeofenceDto
  ) {
    if (dto.coordinates) {
      this.validateCoordinates(dto.coordinates);
    }

    return this.prisma.assetGeofence.update({
      where: { id },
      data: {
        name: dto.name,
        coordinates: dto.coordinates ? dto.coordinates as any : undefined,
        location: dto.location,
        status: dto.status,
        description: dto.description,
        mainPhotograph: dto.mainPhotograph,
        isLimitMovible: dto.isLimitMovible !== undefined ? dto.isLimitMovible : undefined,
      },
    });
  }

  // DELETE
  async remove(id: string) {
    return this.prisma.assetGeofence.delete({
      where: { id },
    });
  }
}