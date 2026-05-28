import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAssetGeofenceDto } from './dto/create-asset-geofence.dto';
import { UpdateAssetGeofenceDto } from './dto/update-asset-geofence.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssetGeofencesService {
  constructor(private prisma: PrismaService) { }

  private validateCoordinates(coordinates: string) {
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
  ) {
    this.validateCoordinates(dto.coordinates);

    const assetExist = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!assetExist) {
      throw new BadRequestException('Asset not found');
    }
    return this.prisma.assetGeofence.create({
      data: {
        assetId: dto.assetId,
        name: dto.name,
        coordinates: dto.coordinates,
        status: dto.status ?? 'ACTIVE',
      },
    });
  }

  // FIND ALL
  async findAll() {
    return this.prisma.assetGeofence.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // FIND ONE
  async findOne(id: string) {
    return this.prisma.assetGeofence.findUnique({
      where: { id },
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
        coordinates: dto.coordinates,
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