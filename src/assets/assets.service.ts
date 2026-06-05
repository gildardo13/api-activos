import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, PrismaClient } from '@prisma/client';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryAssetsDto } from './dto/query-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) { }
  async create(dto: CreateAssetDto) {
    // 1. Validar que el assetType exista
    const assetType = await this.prisma.assetType.findUnique({
      where: { id: dto.assetTypeId },
    });

    if (!assetType) {
      throw new BadRequestException('Asset type does not exist');
    }
    if (assetType.status !== "ACTIVE") {
      throw new BadRequestException('Asset Desactivado');
    }

    // 2. Validar código único
    const existing = await this.prisma.asset.findFirst({
      where: { code: dto.code },
    });

    if (existing) {
      throw new BadRequestException('Asset code already exists');
    }

    // 3. Crear el asset inicialmente
    const d = await this.prisma.asset.create({
      data: {
        assetTypeId: dto.assetTypeId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        status: dto.status,
        lastLocation: dto.lastLocation,
        attributesData: dto.attributesData as Prisma.InputJsonValue,
      },
      include: {
        assetType: true,
      },
    });

    // Si no vienen atributos, terminamos temprano y retornamos el asset
    if (!dto.attributesData || !Array.isArray(dto.attributesData)) {
      return d;
    }

    const attributes = dto.attributesData as any[];
    const updatedAttributes = [];

    // 4. Procesar atributos uno a uno (for...of sí soporta async/await)
    for (const attribute of attributes) {
      const fieldDef = await this.prisma.assetFieldDefinition.findUnique({
        where: { id: attribute.idField },
      });

      if (!fieldDef) {
        return;
      }

      // Clonamos el atributo para no mutar el objeto original
      const currentAttribute = { ...attribute };

      // Si es un archivo, creamos su documento y guardamos su ID correspondiente
      if (fieldDef.fieldType === 'FILE') {
        const document = await this.prisma.assetDocument.create({
          data: {
            assetId: d.id,
            fieldDefinitionId: attribute.idField,
            fileName: attribute.label,
            fileUrl: attribute.value,
            uploadedAt: new Date(),
          },
        });

        // Reemplazamos el valor temporal por el ID del documento real
        currentAttribute.value = document.id;
      }

      updatedAttributes.push(currentAttribute);
    }

    // 5. Actualizar el asset con el JSON final mapeado (usamos update con await)
    const finalAsset = await this.prisma.asset.update({
      where: { id: d.id },
      data: {
        attributesData: updatedAttributes as Prisma.InputJsonValue,
      },
      include: {
        assetType: true,
      },
    });

    return finalAsset;
  }

  async updateAttributesAsset(id: string, updateAssetDto: any) {
    return this.prisma.asset.update({
      where: { id },
      data: {
        attributesData: updateAssetDto,
      },
    });
  }

  async findAll(query: QueryAssetsDto) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      sortByDate = 'desc',
      status,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // ── Filtro por estado ─────────────────────────────
    if (status) {
      where.status = status;
    }

    // ── Búsqueda ──────────────────────────────────────
    if (searchTerm) {
      where.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },

        {
          code: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },

        {
          lastLocation: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },

        {
          assetType: {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.asset.count({
        where,
      }),

      this.prisma.asset.findMany({
        where,

        skip,
        take: limit,

        include: {
          assetType: true,
          assetTelemetryLogs: true,
          assetDocuments: true,
          assetGeofences: true,
          assetAssignments: true,
        },

        orderBy: {
          updatedAt: sortByDate,
        },
      }),
    ]);
    const itemsNew = await Promise.all(
      items.map(async (asset) => {

        const attributesData = await Promise.all(
          (asset.attributesData as any[])?.map(async (attr) => {

            const field = await this.prisma.assetFieldDefinition.findUnique({
              where: {
                id: attr.idField,
              },
            });

            // Si es FILE
            if (field?.fieldType === 'FILE' && attr.value) {

              const document = asset.assetDocuments.find(
                (doc) => doc.id === attr.value,
              );

              return {
                ...attr,
                valueFile: document
                  ? {
                    id: document.id,
                    fileName: document.fileName,
                    fileUrl: document.fileUrl,
                  }
                  : null,
              };
            }

            return attr;
          }),
        );

        return {
          ...asset,
          attributesData,
        };
      }),
    );

    return {
      data: itemsNew,

      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllNoQuery() {
    const data = await this.prisma.asset.findMany({
      include: {
        assetType: true,
        assetTelemetryLogs: true,
        assetDocuments: true,
        assetGeofences: true,
        assetAssignments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { data, meta: { total: data.length } };
  } 

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        assetType: true,
        assetTelemetryLogs: true,
        assetDocuments: true,
        assetGeofences: true,
        assetAssignments: true,
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async update(id: string, dto: UpdateAssetDto) {
    // 1. Validar que el activo exista
    const existing = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Asset not found');
    }

    // 2. Si cambian el código, validar que no esté duplicado
    if (dto.code && dto.code !== existing.code) {
      const duplicate = await this.prisma.asset.findFirst({
        where: {
          id: { not: id },
          code: dto.code,
        },
      });

      if (duplicate) {
        throw new BadRequestException('Asset code already exists');
      }
    }

    // 3. Si no se envían atributos dinámicos, hacemos un update directo de los datos básicos
    if (!dto.attributesData || !Array.isArray(dto.attributesData)) {
      return this.prisma.asset.update({
        where: { id },
        data: {
          name: dto.name,
          code: dto.code,
          description: dto.description,
          status: dto.status,
          lastLocation: dto.lastLocation,
        },
        include: {
          assetType: true,
        },
      });
    }

    const attributes = dto.attributesData as any[];
    const updatedAttributes = [];

    // 4. Procesar atributos dinámicos uno a uno
    for (const attribute of attributes) {
      const fieldDef = await this.prisma.assetFieldDefinition.findUnique({
        where: { id: attribute.idField },
      });

      // Si no existe la definición del campo, la saltamos silenciosamente
      if (!fieldDef) {
        return;
      }

      const currentAttribute = { ...attribute };

      // Si es un archivo y trae una URL nueva (detectada porque empieza con http)
      if (fieldDef.fieldType === 'FILE' && attribute.value) {
        const isNewUrl = typeof attribute.value === 'string' && attribute.value.startsWith('http');

        if (isNewUrl) {
          // Buscamos si ya existía un documento para este campo en este activo
          const oldDocument = await this.prisma.assetDocument.findFirst({
            where: {
              assetId: id,
              fieldDefinitionId: attribute.idField,
            },
          });

          if (oldDocument) {
            // ¡SOLUCIÓN! En lugar de crear uno nuevo y dejar el viejo colgado, REEMPLAZAMOS los datos del viejo
            const updatedDoc = await this.prisma.assetDocument.update({
              where: { id: oldDocument.id },
              data: {
                fileName: attribute.label,
                fileUrl: attribute.value,
                uploadedAt: new Date(),
              },
            });
            // El valor en el JSON seguirá siendo el ID del documento original
            currentAttribute.value = updatedDoc.id;
          } else {
            // Si por alguna razón el activo no tenía archivo antes, entonces sí lo creamos por primera vez
            const newDoc = await this.prisma.assetDocument.create({
              data: {
                assetId: id,
                fieldDefinitionId: attribute.idField,
                fileName: attribute.label,
                fileUrl: attribute.value,
                uploadedAt: new Date(),
              },
            });
            currentAttribute.value = newDoc.id;
          }
        }
      }

      updatedAttributes.push(currentAttribute);
    }

    // 5. Guardar el activo con su JSON final limpio
    return this.prisma.asset.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        status: dto.status,
        lastLocation: dto.lastLocation,
        attributesData: updatedAttributes as Prisma.InputJsonValue,
      },
      include: {
        assetType: true,
      },
    });
  }

  async remove(id: string) {

    const existing = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        assetDocuments: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Asset not found');
    }

    const geofences = await this.prisma.assetGeofence.deleteMany({
      where: {
        assetId: id,
      },
    });

    const documentIds = existing.assetDocuments.map(doc => doc.id);

    // borrar chunks
    await this.prisma.assetDocumentChunk.deleteMany({
      where: {
        assetDocumentId: {
          in: documentIds,
        },
      },
    });

    await this.prisma.assetDocument.deleteMany({
      where: {
        assetId: id,
      },
    });

    // borrar asset
    await this.prisma.asset.delete({
      where: { id },
    });

    return {
      message: 'Asset deleted successfully',
    };
  }


  async changeStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE',
  ) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');

    const activeAssignment = await this.prisma.assetAssignment.findFirst({
      where: {
        assetId: id,
        returnedAt: null, // Si está en null, significa que no lo han devuelto
      },
    });

    if (activeAssignment) {
      throw new BadRequestException(
        'No se puede cambiar el estado del activo porque tiene una asignación activa vigente sin devolver.',
      );
    }

    return this.prisma.asset.update({
      where: { id },
      data: { status },
    });
  }

  /*async createNewAsset(dto: CreateAssetDto) {
    const { assetTypeId } = dto;

    // 1. validar assetType
    const assetType = await this.prisma.assetType.findUnique({
      where: { id: assetTypeId },
      include: { assetFieldDefinitions: true },
    });

    if (!assetType) {
      throw new BadRequestException('Asset type does not exist');
    }

    const fields = assetType.assetFieldDefinitions;

    // 2. validar required fields
    const requiredFields = fields.filter((f) => f.isRequired);

    for (const field of requiredFields) {
      if (!(field.label in data_fields)) {
        throw new BadRequestException(
          `Missing required field: ${field.label}`,
        );
      }
    }

    // 3. validar tipos
    for (const field of fields) {
      const value = data_fields[field.label];

      if (value === undefined) continue;

      switch (field.fieldType) {
        case 'NUMBER':
          if (typeof value !== 'number') {
            throw new BadRequestException(
              `${field.label} must be number`,
            );
          }
          break;

        case 'TEXT':
          if (typeof value !== 'string') {
            throw new BadRequestException(
              `${field.label} must be string`,
            );
          }
          break;

        case 'SELECT':
          if (typeof value !== 'string') {
            throw new BadRequestException(
              `${field.label} must be string`,
            );
          }
          break;

        case 'DATE':
          if (isNaN(Date.parse(value))) {
            throw new BadRequestException(
              `${field.label} must be valid date`,
            );
          }
          break;

        case 'FILE':
          if (typeof value !== 'string') {
            throw new BadRequestException(
              `${field.label} must be file path or url`,
            );
          }
          break;
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.create({
        data: {
          assetTypeId,
          code: dto.code,
          name: dto.name,
          description: dto.description,
          status: dto.status,
          lastLocation: dto.lastLocation,

        },
      });

      // 5. documentos
      if (file_fields?.length) {
        await tx.assetDocument.createMany({
          data: file_fields.map((file: any) => ({
            assetId: asset.id,
            fieldDefinitionId: file.fieldDefinitionId,
            fileName: file.fileName,
            fileUrl: file.fileUrl,
          })),
        });
      }

      return asset;
    });
  }*/
}