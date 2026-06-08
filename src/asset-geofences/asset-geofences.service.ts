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
    }
    const assetGeofenceExist = await this.prisma.assetGeofence.findFirst({
      where: {
        name: dto.name,
      },
    });
    if (assetGeofenceExist) {
      throw new BadRequestException('Asset geofence already exists');
    }

    return this.prisma.assetGeofence.create({
      data: {
        assetId: dto.assetId ?? null,
        name: dto.name,
        coordinates: dto.coordinates as any,
        status: dto.status ?? 'ACTIVE',
      },
    });
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

  // UPDATE
  async update(
    id: string,
    dto: UpdateAssetGeofenceDto
  ) {
    if (dto.coordinates) {
      this.validateCoordinates(dto.coordinates);
    }
    /*const assetGeofenceExist = await this.prisma.assetGeofence.findFirst({
      where: {
        name: dto.name,
      },
    });
    if (assetGeofenceExist) {
      throw new BadRequestException('Asset geofence already exists');
    }*/


    return this.prisma.assetGeofence.update({
      where: { id },
      data: {
        name: dto.name,
        coordinates: dto.coordinates ? JSON.stringify(dto.coordinates) : undefined,
        status: dto.status,
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