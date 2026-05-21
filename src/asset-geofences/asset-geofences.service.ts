import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAssetGeofenceDto } from './dto/create-asset-geofence.dto';
import { UpdateAssetGeofenceDto } from './dto/update-asset-geofence.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AssetGeofencesService {

  private validateCoordinates(coordinates: string) {
    /**
     * Espera formato simple tipo:
     * "lat,lng;lat,lng;lat,lng"
     */

    const points = coordinates.split(';');

    if (points.length < 3) {
      throw new BadRequestException(
        'A geofence must have at least 3 coordinates',
      );
    }

    for (const point of points) {
      const [lat, lng] = point.split(',');

      const latNum = Number(lat);
      const lngNum = Number(lng);

      if (
        isNaN(latNum) ||
        isNaN(lngNum) ||
        latNum < -90 ||
        latNum > 90 ||
        lngNum < -180 ||
        lngNum > 180
      ) {
        throw new BadRequestException(
          `Invalid coordinate: ${point}`,
        );
      }
    }
  }

  // CREATE
  async create(
    dto: CreateAssetGeofenceDto,
    prisma: PrismaClient,
  ) {
    this.validateCoordinates(dto.coordinates);

    const assetExist = await prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!assetExist) {
      throw new BadRequestException('Asset not found');
    }
    return prisma.assetGeofence.create({
      data: {
        assetId: dto.assetId,
        name: dto.name,
        coordinates: dto.coordinates,
        status: dto.status ?? 'ACTIVE',
      },
    });
  }

  // FIND ALL
  async findAll(prisma: PrismaClient) {
    return prisma.assetGeofence.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // FIND ONE
  async findOne(id: string, prisma: PrismaClient) {
    return prisma.assetGeofence.findUnique({
      where: { id },
    });
  }

  // UPDATE
  async update(
    id: string,
    dto: UpdateAssetGeofenceDto,
    prisma: PrismaClient,
  ) {
    if (dto.coordinates) {
      this.validateCoordinates(dto.coordinates);
    }

    return prisma.assetGeofence.update({
      where: { id },
      data: {
        name: dto.name,
        coordinates: dto.coordinates,
        status: dto.status,
      },
    });
  }

  // DELETE
  async remove(id: string, prisma: PrismaClient) {
    return prisma.assetGeofence.delete({
      where: { id },
    });
  }
}