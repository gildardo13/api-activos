import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGpsDeviceDto } from './dto/create-gps-device.dto';
import { UpdateGpsDeviceDto } from './dto/update-gps-device.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryGpsDeviceDto, SortOrder } from './dto/query-gps-device.dto';

@Injectable()
export class GpsDeviceService {

  constructor(private prisma: PrismaService) { }
  async create(createGpsDeviceDto: CreateGpsDeviceDto) {
    const existingDevice = await this.prisma.gpsDevice.findUnique({
      where: {
        imei: createGpsDeviceDto.imei,
      },
    });

    if (existingDevice) {
      throw new HttpException('El número IMEI ya existe en la base de datos.', HttpStatus.BAD_REQUEST);
    }

    return await this.prisma.gpsDevice.create({
      data: {
        imei: createGpsDeviceDto.imei,
        model: createGpsDeviceDto.model,
        phoneNumber: createGpsDeviceDto.phoneNumber,
        providerCompany: createGpsDeviceDto.providerCompany,
        isCamera:createGpsDeviceDto.isCamera,
        deviceCam:createGpsDeviceDto.deviceCam
      }
    });
  }

  async findAll() {
    return this.prisma.gpsDevice.findMany();
  }

  async getGpsDevicePaginated(query: QueryGpsDeviceDto) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      sortByDate = SortOrder.DESC,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    // ── Búsqueda exacta por los campos del DTO ────────
    if (searchTerm) {
      where.OR = [
        {
          imei: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          model: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          phoneNumber: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          providerCompany: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    // ── Ejecución en paralelo (Contador + Búsqueda) ────
    const [total, items] = await Promise.all([
      this.prisma.gpsDevice.count({
        where,
      }),

      this.prisma.gpsDevice.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: sortByDate,
        },
      }),
    ]);

    // ── Respuesta formateada con Metadata ──────────────
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




  async getNotAssetGpsDevices() {
    return await this.prisma.gpsDevice.findMany({
      where: {
        assets: {
          none: {},
        },
      },
    });
  }
  async findOne(id: string) {
    return this.prisma.gpsDevice.findUnique({
      where: {
        id: id
      }
    });
  }

  async update(id: string, updateGpsDeviceDto: UpdateGpsDeviceDto) {
    const existingDevice = this.prisma.gpsDevice.findUnique({
      where: {
        id: id,
      },
    });
    if (!existingDevice) {
      throw new HttpException('El número IMEI no existe en la base de datos.', HttpStatus.BAD_REQUEST);
    }
    return this.prisma.gpsDevice.update({
      where: {
        id: id
      },
      data: {
        imei: updateGpsDeviceDto.imei,
        model: updateGpsDeviceDto.model,
        phoneNumber: updateGpsDeviceDto.phoneNumber,
        providerCompany: updateGpsDeviceDto.providerCompany,
        isCamera: updateGpsDeviceDto.isCamera,
        deviceCam:updateGpsDeviceDto.deviceCam
      }
    })
  }

  async remove(id: string) {
    const existingDevice = await this.prisma.gpsDevice.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingDevice) {
      throw new HttpException('El dispositivo GPS no existe.', HttpStatus.NOT_FOUND);
    }

    const assetCount = await this.prisma.asset.count({
      where: {
        gpsDeviceId: id,
      },
    });

    if (assetCount > 0) {
      throw new HttpException(
        'No se puede eliminar el dispositivo GPS porque está asociado a un activo.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.gpsDevice.delete({
      where: {
        id: id,
      },
    });
  }
}
