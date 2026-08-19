import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, PrismaClient } from '@prisma/client';
import { CreateAssetDto, StatusApproval, StatusAsset } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryAssetsDto } from './dto/query-asset.dto';
import { formatToISODate } from 'src/common/helper';
import { ApprovalFlowsService } from 'src/approval-flows/approval-flows.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import * as XLSX from 'xlsx';
import * as AdmZip from 'adm-zip';
import { createExtractorFromData } from 'node-unrar-js';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';



@Injectable()
export class AssetsService {
  private readonly moduleId = process.env.MODULE_ID;
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ApprovalFlowsService))
    private readonly approvalFlowsService: ApprovalFlowsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }
  async create(dto: CreateAssetDto) {
    // 1. Validar que el assetType exista
    const assetType = await this.prisma.assetType.findUnique({
      where: { id: dto.assetTypeId },
      include: { assetFieldDefinitions: true },
    });

    if (!assetType) {
      throw new BadRequestException('Asset type does not exist');
    }
    if (assetType.status !== "ACTIVE") {
      throw new BadRequestException('Asset Desactivado');
    }

    // Validar campos dinámicos requeridos
    const inputAttributes = (dto.attributesData as any[]) || [];
    for (const fieldDef of assetType.assetFieldDefinitions) {
      if (fieldDef.isRequired) {
        const attributeVal = inputAttributes.find((a) => a.idField === fieldDef.id);
        if (!attributeVal || attributeVal.value === undefined || attributeVal.value === null || String(attributeVal.value).trim() === '') {
          throw new BadRequestException(`El campo "${fieldDef.label}" es obligatorio`);
        }
      }
    }

    // 2. Validar código único
    const existing = await this.prisma.asset.findFirst({
      where: { code: dto.code },
    });
    const existingName = await this.prisma.asset.findFirst({
      where: { name: dto.name },
    });
    if (existing) {
      throw new BadRequestException('Asset code already exists');
    }
    if (existingName) {
      throw new BadRequestException('Asset name already exists');
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
        mainPhotograph: dto.mainPhotograph,
        metadata: dto.metadata,
        attributesData: dto.attributesData as Prisma.InputJsonValue,
        gpsDeviceId: dto.gpsDeviceId || null,
      },
      include: {
        assetType: true,
        gpsDevice: true,
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
        gpsDevice: true,
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
      clasificationType,
      groupId,
      assetTypeId,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // ── Filtro por grupo ──────────────────────────────
    if (groupId) {
      where.groups = {
        some: {
          id: groupId,
        },
      };
    }

    // ── Filtro por tipo de activo ─────────────────────
    if (assetTypeId) {
      where.assetTypeId = assetTypeId;
    }

    // ── Filtro por estado ─────────────────────────────
    if (status) {
      where.status = status;
    }

    // ── Filtro por tipo de clasificación ──────────────
    if (clasificationType) {
      where.assetType = {
        ...where.assetType,
        clasificationType,
      };
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
          gpsDevice: true,
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
        gpsDevice: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { data, meta: { total: data.length } };
  }

  async findAllIsLimit() {
    const data = await this.prisma.asset.findMany({
      where: {
        assetGeofences: {
          some: {
            isLimitMovible: true,
          },
        },
      },
      include: {
        assetType: true,
        assetTelemetryLogs: true,
        assetDocuments: true,
        assetGeofences: {
          where: {
            isLimitMovible: true,
          },
        },
        assetAssignments: true,
        gpsDevice: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { data, meta: { total: data.length } };
  }

  async findAllMovable() {
    const data = await this.prisma.asset.findMany({
      where: {
        assetType: {
          clasificationType: 'MOVABLE',
        },
      },
      include: {
        assetType: true,
        assetTelemetryLogs: true,
        assetDocuments: true,
        assetGeofences: true,
        assetAssignments: true,
        gpsDevice: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { data, meta: { total: data.length } };
  }

  async findWithoutLocationInactiveTelemetry(search?: string) {
    const whereClause: any = {
      OR: [
        { lastLocation: null },
        { lastLocation: '' },
      ],
      assetTelemetryLogs: {
        some: {
          isActive: false,
        },
      },
    };

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ]
        }
      ];
    }

    const data = await this.prisma.asset.findMany({
      where: whereClause,
      include: {
        assetType: true,
        assetTelemetryLogs: {
          where: {
            isActive: false,
          },
        },
        assetDocuments: true,
        assetGeofences: true,
        assetAssignments: true,
        gpsDevice: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { data, meta: { total: data.length } };
  }

  async findAllNoQuerynotAssigment() {
    const data = await this.prisma.asset.findMany({
      where: {
        status: 'ACTIVE',
        assetAssignments: {
          none: {
            returnedAt: null,
          },
        },
      },
      include: {
        assetType: true,
        assetTelemetryLogs: true,
        assetDocuments: true,
        assetGeofences: true,
        assetAssignments: true,
        gpsDevice: true,
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
        gpsDevice: true,
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
          statusApproval: dto.statusApproval,
          commentsApproval: dto.commentsApproval,
          mainPhotograph: dto.mainPhotograph,
          gpsDeviceId: dto.gpsDeviceId !== undefined ? (dto.gpsDeviceId || null) : existing.gpsDeviceId,

        },
        include: {
          assetType: true,
          gpsDevice: true,
        },
      });
    }


    const attributes = dto.attributesData as any[];
    const updatedAttributes = [];

    // 4. Procesar atributos dinámicos uno a uno
    for (const attribute of attributes) {
      if (!attribute.value
      ) {
        const fieldDef = await this.prisma.assetFieldDefinition.findUnique({
          where: { id: attribute.idField },
        });
        if (fieldDef.fieldType === 'FILE') {
          const oldDocument = await this.prisma.assetDocument.findFirst({
            where: {
              assetId: id,
              fieldDefinitionId: attribute.idField,
            },
          });
          if (oldDocument) {
            await this.prisma.assetDocument.delete({
              where: { id: oldDocument.id },
            });
          }
        }
      }
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
        statusApproval: dto.statusApproval,
        mainPhotograph: dto.mainPhotograph,
        commentsApproval: dto.commentsApproval,
        gpsDeviceId: dto.gpsDeviceId !== undefined ? (dto.gpsDeviceId || null) : existing.gpsDeviceId,

      },
      include: {
        assetType: true,
        gpsDevice: true
      },
    });
  }


  async updateStatuApproval(id: string, status: string, rejectionComment?: string) {
    const existing = await this.prisma.asset.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Asset not found');
    }
    return this.prisma.asset.update({
      where: { id },
      data: {
        statusApproval: status as StatusApproval,
        commentsApproval: rejectionComment
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

    if (existing.statusApproval === "PENDING") {
      throw new NotFoundException('Activo sigue en flujo de aprobacion');


    }

    const documentIds = existing.assetDocuments.map(doc => doc.id);

    // borrar chunks
    await this.prisma.assetDocumentChunk.deleteMany({
      where: {
        assetDocumentId: {
          in: documentIds,
        },
      },
    });
    const listAssignment = await this.prisma.assetAssignment.findMany({
      where: {
        assetId: existing.id,
      },
    })
    const allReturned = listAssignment.every(
      (assignment) => assignment.statusReturned === 'RETURNED',
    );

    if (!allReturned) {
      throw new NotFoundException('Activo sigue en uso');
    } else {
      this.prisma.assetAssignment.deleteMany({
        where: {
          assetId: existing.id,
        },
      })
    }

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
    metadata?: any,
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

    const currentMetadata = asset.metadata && typeof asset.metadata === 'object' ? (asset.metadata as any) : {};
    const updatedMetadata = metadata ? {
      ...currentMetadata,
      ...metadata,
    } : asset.metadata;

    return this.prisma.asset.update({
      where: { id },
      data: {
        status,
        metadata: updatedMetadata ?? undefined,
      },
    });
  }
  async generateTemplate(assetTypeId: string): Promise<Buffer> {
    const assetType = await this.prisma.assetType.findUnique({
      where: { id: assetTypeId },
      include: { assetFieldDefinitions: true },
    });

    if (!assetType) {
      throw new NotFoundException('Asset type not found');
    }

    const headers = [
      'Código *',
      'Nombre del activo *',
      'Descripción',
    ];
    const excludedFields = ['ubicacion', 'gpsime'];
    const nonFileFields = assetType.assetFieldDefinitions.filter(
      (f) => f.fieldType !== 'FILE' && f.fieldType !== 'GALLERY' && !excludedFields.includes(f.label) // Ajusta 'f.name' a 'f.label' o 'f.fieldType' si es necesario
    );

    for (const field of nonFileFields) {
      let finalLabel = (field as any).isRequired ? `${field.label} *` : field.label;

      if (field.fieldType === 'select' || field.fieldType === 'SELECT') {
        if (field.options && Array.isArray(field.options)) {
          finalLabel += ` (${field.options.join(', ')})`;
        }
      }

      if (field.fieldType === 'date' || field.fieldType === 'DATE') {
        finalLabel += ' (DD/MM/AAAA)';
      }

      if (field.fieldType === 'CURRENCY') {
        const metadata = (field.metadata as Record<string, any>) || {};
        const currencyCode = metadata.currencyCode || 'MXN';
        finalLabel += ` (${currencyCode.toUpperCase()})`;
      }

      headers.push(finalLabel);
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const colWidths = headers.map(() => ({ wch: 25 }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  async bulkUpload(file: Express.Multer.File, assetTypeId: string): Promise<{ success: boolean; data?: Buffer; message: string; pendingFiles: boolean; assets?: any[] }> {
    const assetType = await this.prisma.assetType.findUnique({
      where: { id: assetTypeId },
      include: { assetFieldDefinitions: true },
    });

    if (!assetType) {
      throw new NotFoundException('Asset type not found');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

    if (jsonData.length <= 1) {
      throw new BadRequestException('El archivo Excel está vacío o no contiene filas de datos');
    }

    const headers = jsonData[0];
    const colMap: Record<number, string> = {};

    headers.forEach((header: string, index: number) => {
      if (!header) return;

      // 1. Quitar las opciones entre paréntesis del final (ej: " (Opcion1, Opcion2)")
      let cleanHeader = header.replace(/\s*\([^)]*\)$/, '');
      // 2. Quitar el asterisco de campo obligatorio y espacios extra
      cleanHeader = cleanHeader.replace(/\s*\*\s*$/, '').trim();

      // Pasar a minúsculas y quitar tildes
      const cleanLower = cleanHeader.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // CORRECCIÓN: Validar si incluye o coincide con el nombre de la plantilla base
      if (cleanLower === 'codigo' || cleanLower === 'code' || cleanLower.includes('codigo del activo')) {
        colMap[index] = 'code';
      } else if (cleanLower === 'nombre' || cleanLower === 'name' || cleanLower.includes('nombre del activo')) {
        colMap[index] = 'name';
      } else if (cleanLower === 'descripcion' || cleanLower === 'description') {
        colMap[index] = 'description';
      } else {
        const matchedField = assetType.assetFieldDefinitions.find(
          (f) => f.fieldType !== 'FILE' && f.label.toLowerCase().trim() === cleanHeader.toLowerCase()
        );
        if (matchedField) {
          colMap[index] = matchedField.id;
        }
      }
    });

    const requiredKeys = ['code', 'name'];
    const mappedValues = Object.values(colMap);
    for (const reqKey of requiredKeys) {
      if (!mappedValues.includes(reqKey)) {
        throw new BadRequestException(`El archivo Excel no contiene la columna requerida: ${reqKey === 'code' ? 'Código' : 'Nombre'}`);
      }
    }

    const rows = jsonData.slice(1);
    const errors: { row: number; error: string }[] = [];
    const parsedAssets: any[] = [];
    const seenCodes = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every((cell: any) => cell === null || cell === undefined || String(cell).trim() === '')) {
        continue;
      }

      // Se mantiene por retrocompatibilidad si suben una plantilla vieja con la leyenda
      if (row.some((cell: any) => typeof cell === 'string' && cell.includes('* = Campo obligatorio'))) {
        continue;
      }

      const rowNumber = i + 2;
      const assetData: any = {
        code: '',
        name: '',
        description: '',
        lastLocation: '',
        gpsDeviceImei: '',
        dynamicAttributes: {},
      };

      row.forEach((cellValue: any, colIdx: number) => {
        const key = colMap[colIdx];
        if (!key) return;

        const cleanValue = cellValue !== null && cellValue !== undefined ? String(cellValue).trim() : '';
        if (['code', 'name', 'description', 'lastLocation', 'gpsDeviceImei'].includes(key)) {
          assetData[key] = cleanValue;
        } else {
          assetData.dynamicAttributes[key] = cleanValue;
        }
      });

      if (!assetData.code) {
        errors.push({ row: rowNumber, error: 'El Código del activo es obligatorio' });
        continue;
      }
      if (!assetData.name) {
        errors.push({ row: rowNumber, error: 'El Nombre del activo es obligatorio' });
        continue;
      }

      if (seenCodes.has(assetData.code)) {
        errors.push({ row: rowNumber, error: `El Código "${assetData.code}" está duplicado en el mismo Excel` });
        continue;
      }
      box: seenCodes.add(assetData.code);

      const existingDb = await this.prisma.asset.findFirst({
        where: { code: assetData.code },
      });
      if (existingDb) {
        errors.push({ row: rowNumber, error: `El Código "${assetData.code}" ya existe en el sistema` });
        continue;
      }
      const existingName = await this.prisma.asset.findFirst({
        where: { name: assetData.name },
      });
      if (existingName) {
        errors.push({ row: rowNumber, error: `El Nombre "${assetData.name}" ya existe en el sistema` });
        continue;
      }

      let gpsDeviceId = null;
      if (assetData.gpsDeviceImei) {
        const gpsDev = await this.prisma.gpsDevice.findUnique({
          where: { imei: assetData.gpsDeviceImei },
        });
        if (!gpsDev) {
          errors.push({ row: rowNumber, error: `El dispositivo GPS con IMEI "${assetData.gpsDeviceImei}" no existe` });
          continue;
        }
        gpsDeviceId = gpsDev.id;
      }

      // Validar campos dinámicos obligatorios y sus tipos (que no sean de tipo FILE o GALLERY)
      let validationError = false;
      for (const fieldDef of assetType.assetFieldDefinitions) {
        if (fieldDef.fieldType === 'FILE' || fieldDef.fieldType === 'GALLERY') continue;

        const userVal = assetData.dynamicAttributes[fieldDef.id];
        const isEmpty = userVal === undefined || userVal === null || String(userVal).trim() === '';

        // 1. Validar requerido
        if (fieldDef.isRequired && isEmpty) {
          errors.push({
            row: rowNumber,
            error: `El campo "${fieldDef.label}" es obligatorio`,
          });
          validationError = true;
          continue;
        }

        // 2. Validar tipo de dato si no está vacío
        if (!isEmpty) {
          const strVal = String(userVal).trim();

          if (fieldDef.fieldType === 'NUMBER') {
            if (isNaN(Number(strVal))) {
              errors.push({
                row: rowNumber,
                error: `El campo "${fieldDef.label}" debe ser un número válido (recibido: "${userVal}")`,
              });
              validationError = true;
            }
          }

          if (fieldDef.fieldType === 'CURRENCY') {
            const cleanVal = strVal.replace(/[$,€,£,¥]/g, '').replace(/,/g, '').trim();
            if (isNaN(Number(cleanVal))) {
              errors.push({
                row: rowNumber,
                error: `El campo "${fieldDef.label}" debe ser un valor decimal de moneda válido (recibido: "${userVal}")`,
              });
              validationError = true;
            } else {
              const parts = cleanVal.split('.');
              const hasMoreThanTwoDecimals = parts.length > 1 && parts[1].replace(/0+$/, '').length > 2;
              if (hasMoreThanTwoDecimals) {
                errors.push({
                  row: rowNumber,
                  error: `El campo "${fieldDef.label}" no debe tener más de 2 decimales (recibido: "${userVal}")`,
                });
                validationError = true;
              } else {
                assetData.dynamicAttributes[fieldDef.id] = cleanVal;
              }
            }
          }

          if (fieldDef.fieldType === 'DATE') {
            let parsedDate = strVal;
            const dmyMatch = strVal.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
            if (dmyMatch) {
              // Convertir DD/MM/AAAA o DD-MM-AAAA a AAAA-MM-DD
              parsedDate = `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
            }

            const timestamp = Date.parse(parsedDate);
            const num = Number(strVal);
            const isExcelDate = !isNaN(num) && num > 0;

            let isRealCalendarDate = false;
            if (!isNaN(timestamp)) {
              const testDate = new Date(parsedDate);
              if (dmyMatch) {
                const day = parseInt(dmyMatch[1], 10);
                const month = parseInt(dmyMatch[2], 10) - 1; // 0-indexed en JS
                const year = parseInt(dmyMatch[3], 10);
                isRealCalendarDate = testDate.getFullYear() === year && testDate.getMonth() === month && testDate.getDate() === day;
              } else {
                const ymdMatch = strVal.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
                if (ymdMatch) {
                  const year = parseInt(ymdMatch[1], 10);
                  const month = parseInt(ymdMatch[2], 10) - 1;
                  const day = parseInt(ymdMatch[3], 10);
                  isRealCalendarDate = testDate.getFullYear() === year && testDate.getMonth() === month && testDate.getDate() === day;
                } else {
                  isRealCalendarDate = true;
                }
              }
            }

            const isMalformed = isNaN(timestamp);
            const isNonExistent = !isMalformed && !isRealCalendarDate;

            if ((isMalformed || isNonExistent) && !isExcelDate) {
              const suffix = isNonExistent ? ' (fecha inexistente)' : '';
              errors.push({
                row: rowNumber,
                error: `El campo "${fieldDef.label}" debe ser una fecha válida en formato DD/MM/AAAA o AAAA-MM-DD (recibido: "${userVal}")${suffix}`,
              });
              validationError = true;
            }
          }

          if (fieldDef.fieldType === 'SELECT') {
            const options = fieldDef.options as string[];
            if (options && options.length > 0) {
              const match = options.some(opt => opt.trim().toLowerCase() === strVal.toLowerCase());
              if (!match) {
                errors.push({
                  row: rowNumber,
                  error: `El campo "${fieldDef.label}" contiene un valor no permitido. Opciones válidas: [${options.join(', ')}] (recibido: "${userVal}")`,
                });
                validationError = true;
              }
            }
          }
        }
      }

      if (validationError) {
        continue;
      }

      parsedAssets.push({
        ...assetData,
        gpsDeviceId,
        rowNumber,
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({ success: false, errors });
    }

    const createdAssets = [];
    const pendingFileRequirements: any[] = [];

    await this.prisma.$transaction(async (tx) => {
      for (const parsedAsset of parsedAssets) {
        const attributesData = [];

        for (const fieldDef of assetType.assetFieldDefinitions) {
          if (fieldDef.fieldType === 'FILE') {
            const expectedFileName = `${fieldDef.label}`;
            attributesData.push({
              idField: fieldDef.id,
              label: fieldDef.label,
              value: '',
              pendingFileName: expectedFileName,
            });
            pendingFileRequirements.push({
              assetCode: parsedAsset.code,
              assetName: parsedAsset.name,
              fieldLabel: fieldDef.label,
              fieldId: fieldDef.id,
              fileName: expectedFileName,
            });
          } else if (fieldDef.fieldType === 'GALLERY') {
            attributesData.push({
              idField: fieldDef.id,
              label: fieldDef.label,
              value: [],
            });
            pendingFileRequirements.push({
              assetCode: parsedAsset.code,
              assetName: parsedAsset.name,
              fieldLabel: fieldDef.label,
              fieldId: fieldDef.id,
              fileName: `Carpeta: ${fieldDef.label}`,
              isGallery: true,
            });
          } else {
            let userVal = parsedAsset.dynamicAttributes[fieldDef.id] || '';
            if (fieldDef.fieldType === 'DATE' && userVal) {
              userVal = formatToISODate(userVal);
            }
            attributesData.push({
              idField: fieldDef.id,
              label: fieldDef.label,
              value: userVal,
            });
          }
        }

        const newAsset = await tx.asset.create({
          data: {
            assetTypeId,
            code: parsedAsset.code,
            name: parsedAsset.name,
            description: parsedAsset.description || null,
            status: StatusAsset.ACTIVE,
            lastLocation: parsedAsset.lastLocation || null,
            attributesData: attributesData as Prisma.InputJsonValue,
            mainPhotograph: parsedAsset.mainPhotograph,
            metadata: parsedAsset.metadata,
            gpsDeviceId: parsedAsset.gpsDeviceId,
          },
        });
        createdAssets.push(newAsset);
      }
    });

    if (pendingFileRequirements.length > 0) {
      const instrHeaders = [
        'CÓDIGO DEL ACTIVO',
        'NOMBRE DEL ACTIVO',
        'CAMPO (ARCHIVO)',
        'NOMBRE DEL ARCHIVO REQUERIDO',
        'NOMBRE DE SUBCARPETA',
        'RUTA REQUERIDA EN DOCUMENTOS',
      ];

      const instrRows: any[] = [];
      let lastAssetCode = '';

      for (const req of pendingFileRequirements) {
        if (lastAssetCode && req.assetCode !== lastAssetCode) {
          instrRows.push(['', '', '', '', '', '']);
        }
        lastAssetCode = req.assetCode;

        if (req.isGallery) {
          const normalizedLabel = req.fieldLabel.replace(/\s+/g, '-');
          instrRows.push([
            req.assetCode,
            req.assetName,
            req.fieldLabel,
            'Cualquier imagen (.jpg, .jpeg, .png, .webp)',
            `gallery/COD-${req.assetCode}/${normalizedLabel}`,
            `archivos_activos/gallery/COD-${req.assetCode}/${normalizedLabel}/[fotos]`,
          ]);
        } else {
          instrRows.push([
            req.assetCode,
            req.assetName,
            req.fieldLabel,
            `${req.fileName}.[ext]`,
            `documents/COD-${req.assetCode}`,
            `archivos_activos/documents/COD-${req.assetCode}/${req.fileName}.[ext]`,
          ]);
        }
      }

      const instrWb = XLSX.utils.book_new();
      const instrWs = XLSX.utils.aoa_to_sheet([instrHeaders, ...instrRows]);

      const instrWidths = instrHeaders.map(() => ({ wch: 30 }));
      instrWs['!cols'] = instrWidths;

      XLSX.utils.book_append_sheet(instrWb, instrWs, 'Instrucciones_Archivos');
      const instrBuffer = XLSX.write(instrWb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

      return {
        success: true,
        data: instrBuffer,
        message: `Se crearon ${createdAssets.length} activos. Se requieren archivos.`,
        pendingFiles: true,
        assets: createdAssets.map((a) => ({ id: a.id, code: a.code, name: a.name })),
      };
    }

    return {
      success: true,
      message: `Se cargaron ${createdAssets.length} activos exitosamente`,
      pendingFiles: false,
      assets: createdAssets.map((a) => ({ id: a.id, code: a.code, name: a.name })),
    };
  }
  async bulkUploadFiles(): Promise<{ success: boolean; uploadedCount: number; uploadedFiles: any[]; unmatchedFiles: string[]; assets?: any[] }> {
    const uploadedFiles = [];
    const unmatchedFiles = [];
    let uploadedCount = 0;

    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };

    const getMimeType = (filename: string) => {
      const ext = filename.split('.').pop()?.toLowerCase() || '';
      return mimeTypes[ext] || 'application/octet-stream';
    };

    const docsDir = path.join(os.homedir(), 'Documents', 'archivos_activos');

    if (!fs.existsSync(docsDir)) {
      throw new BadRequestException(
        `No se encontró la carpeta 'archivos_activos' en tu carpeta de Documentos. Asegúrate de crearla en: ${docsDir}`
      );
    }

    const allAssets = await this.prisma.asset.findMany({
      where: {
        attributesData: {
          not: Prisma.JsonNull,
        },
      },
      include: {
        assetType: {
          include: {
            assetFieldDefinitions: true,
          },
        },
      },
    });

    const validationErrors: string[] = [];
    const filesToUpload: Array<{
      asset: any;
      attribute: any;
      attrIndex: number;
      localPath: string;
      fileName: string;
      isGallery: boolean;
      maxLength?: number;
    }> = [];

    // 2. Validar cada activo y sus requerimientos de archivos
    for (const asset of allAssets) {
      const attributes = asset.attributesData as any[];
      if (!Array.isArray(attributes)) continue;

      const fieldDefs = asset.assetType.assetFieldDefinitions;
      const documentsFolder = path.join(docsDir, 'documents', `COD-${asset.code}`);
      const galleryBaseFolder = path.join(docsDir, 'gallery', `COD-${asset.code}`);

      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];

        // Buscar si es un campo de tipo FILE o GALLERY
        const fieldDef = fieldDefs.find(f => f.id === attr.idField);
        if (!fieldDef) continue;

        if (fieldDef.fieldType === 'FILE') {
          const isRequired = fieldDef.isRequired;
          const hasValue = attr.value && String(attr.value).trim() !== '';

          // El nombre esperado es el label del atributo (o pendingFileName si existe)
          const expectedFileName = attr.pendingFileName || attr.label || fieldDef.label;

          let matchedFilePath: string | null = null;
          if (fs.existsSync(documentsFolder)) {
            const files = fs.readdirSync(documentsFolder);
            const expectedClean = expectedFileName.toLowerCase().trim();

            for (const file of files) {
              const stat = fs.statSync(path.join(documentsFolder, file));
              if (stat.isDirectory()) continue;

              const fileBaseName = path.parse(file).name;
              if (fileBaseName.toLowerCase().trim() === expectedClean) {
                matchedFilePath = path.join(documentsFolder, file);
                break;
              }
            }
          }

          if (!matchedFilePath) {
            // Si el archivo obligatorio no está localmente y NO se ha subido previamente, es un error
            if (isRequired && !hasValue) {
              validationErrors.push(
                `No tienes el documento ${expectedFileName} en el activo ${asset.code} (${asset.name})`
              );
            }
          } else {
            // Encontrado localmente, lo agregamos para subir/actualizar
            filesToUpload.push({
              asset,
              attribute: attr,
              attrIndex: i,
              localPath: matchedFilePath,
              fileName: path.basename(matchedFilePath),
              isGallery: false,
            });
          }
        } else if (fieldDef.fieldType === 'GALLERY') {
          const normalizedLabel = fieldDef.label.replace(/\s+/g, '-');
          const galleryFolder = path.join(galleryBaseFolder, normalizedLabel);
          if (fs.existsSync(galleryFolder) && fs.statSync(galleryFolder).isDirectory()) {
            const files = fs.readdirSync(galleryFolder);
            const imageFiles = files.filter(file => {
              const stat = fs.statSync(path.join(galleryFolder, file));
              if (stat.isDirectory()) return false;
              const ext = file.split('.').pop()?.toLowerCase() || '';
              return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
            });

            // Leer límite de la metadata del campo (por defecto 5)
            let metadata = fieldDef.metadata as any;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                console.error("Error parsing field definition metadata:", e);
              }
            }
            let maxLength = 5;
            if (metadata && typeof metadata === 'object') {
              const limit = parseInt(metadata.lengthImg || metadata.length, 10);
              if (!isNaN(limit)) {
                maxLength = limit;
              }
            }

            // Calcular cuántos archivos se pueden agregar sin superar el límite
            const currentGalleryValue = Array.isArray(attr.value) ? attr.value : [];
            const allowedUploadsCount = maxLength - currentGalleryValue.length;

            if (allowedUploadsCount > 0) {
              const filesToPush = imageFiles.slice(0, allowedUploadsCount);
              for (const file of filesToPush) {
                filesToUpload.push({
                  asset,
                  attribute: attr,
                  attrIndex: i,
                  localPath: path.join(galleryFolder, file),
                  fileName: file,
                  isGallery: true,
                  maxLength,
                });
              }
            }
          }
        }
      }
    }

    // Si hay algún archivo obligatorio faltante, cancelamos el proceso y reportamos los errores
    if (validationErrors.length > 0) {
      throw new BadRequestException({
        success: false,
        errors: validationErrors,
      });
    }

    // 3. Subir los archivos encontrados a Cloudinary y actualizar la DB
    for (const item of filesToUpload) {
      const { asset, attribute, attrIndex, localPath, fileName, isGallery, maxLength } = item;

      // Obtener el activo más reciente para verificar límites y evitar sobreescritura
      const dbAsset = await this.prisma.asset.findUnique({ where: { id: asset.id } });
      if (!dbAsset) continue;

      const dbAttributes = dbAsset.attributesData as any[];
      const attrIndexInDb = dbAttributes.findIndex(a => a.idField === attribute.idField);
      if (attrIndexInDb === -1) {
        console.warn(`Atributo no encontrado por idField: ${attribute.idField}`);
        continue;
      }

      if (isGallery) {
        const updatedAttr = { ...dbAttributes[attrIndexInDb] };
        const currentGalleryValue = Array.isArray(updatedAttr.value) ? updatedAttr.value : [];

        const limit = maxLength ?? 5;
        if (currentGalleryValue.length >= limit) {
          console.warn(`Se omitió el archivo ${fileName} para el activo ${asset.code} porque la galería ya alcanzó el límite de ${limit} imágenes.`);
          continue;
        }
      }

      const fileBuffer = fs.readFileSync(localPath);

      const fakeFile = {
        buffer: fileBuffer,
        originalname: fileName,
        mimetype: getMimeType(fileName),
      } as Express.Multer.File;

      // Subir a Cloudinary
      const secureUrl = await this.cloudinaryService.uploadFile(fakeFile, 'assets');

      // Volver a obtener el activo más reciente para guardar el valor
      const latestAsset = await this.prisma.asset.findUnique({ where: { id: asset.id } });
      if (!latestAsset) continue;
      const latestAttributes = latestAsset.attributesData as any[];
      const targetIndex = latestAttributes.findIndex(a => a.idField === attribute.idField);
      if (targetIndex === -1) continue;

      const updatedAttr = { ...latestAttributes[targetIndex] };

      if (isGallery) {
        let currentGalleryValue = Array.isArray(updatedAttr.value) ? updatedAttr.value : [];
        const nextPosition = currentGalleryValue.length;

        currentGalleryValue.push({
          url: secureUrl,
          name: fileName,
          positionImg: nextPosition,
        });

        updatedAttr.value = currentGalleryValue;
        latestAttributes[targetIndex] = updatedAttr;

        await this.prisma.asset.update({
          where: { id: asset.id },
          data: {
            attributesData: latestAttributes as Prisma.InputJsonValue,
          },
        });
      } else {
        // Crear el registro de documento
        const doc = await this.prisma.assetDocument.create({
          data: {
            assetId: asset.id,
            fieldDefinitionId: attribute.idField,
            fileName: fileName,
            fileUrl: secureUrl,
            uploadedAt: new Date(),
          },
        });

        // Actualizar el atributo en el activo
        updatedAttr.value = doc.id;
        if (updatedAttr.pendingFileName !== undefined) {
          delete updatedAttr.pendingFileName;
        }
        latestAttributes[targetIndex] = updatedAttr;

        await this.prisma.asset.update({
          where: { id: asset.id },
          data: {
            attributesData: latestAttributes as Prisma.InputJsonValue,
          },
        });
      }

      uploadedFiles.push({
        assetCode: asset.code,
        assetName: asset.name,
        fieldLabel: attribute.label,
        fileName: fileName,
        url: secureUrl,
      });
      uploadedCount++;
    }

    const uniqueAssets = Array.from(new Map(filesToUpload.map(item => [item.asset.id, item.asset])).values());

    return {
      success: true,
      uploadedCount,
      uploadedFiles,
      unmatchedFiles,
      assets: uniqueAssets.map((a: any) => ({ id: a.id, code: a.code, name: a.name })),
    };
  }

  async generateAssetPdf(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        assetType: true,
      },
    });

    if (!asset) {
      throw new BadRequestException('Asset not found');
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          buffer,
          filename: `Ficha_${(asset.code || asset.name || 'Activo').replace(/\s+/g, '_')}.pdf`,
        });
      });

      doc.on('error', (err: any) => reject(err));

      // Header
      doc.fontSize(20).fillColor('#0f172a').text(asset.name, { align: 'left' });
      doc.fontSize(10).fillColor('#64748b').text(`Código: ${asset.code || 'S/N'}  |  Fecha: ${new Date().toLocaleDateString('es-MX')}`);
      doc.moveDown(0.5);
      doc.moveTo(36, doc.y).lineTo(559, doc.y).strokeColor('#cbd5e1').stroke();
      doc.moveDown(1);

      // Status & Location
      doc.fontSize(11).fillColor('#334155').text(`Estado: ${asset.status}`, { continued: true });
      doc.text(`   |   Ubicación: ${asset.lastLocation || 'N/A'}`);
      doc.moveDown(0.5);

      if (asset.description) {
        doc.fontSize(10).fillColor('#475569').text(`Descripción: ${asset.description}`);
        doc.moveDown(1);
      }

      // Attributes table
      doc.fontSize(12).fillColor('#0f172a').text('ESPECIFICACIONES TÉCNICAS Y ATRIBUTOS', { underline: true });
      doc.moveDown(0.8);

      let rawAttr: any = asset.attributesData;
      if (typeof rawAttr === 'string') {
        try { rawAttr = JSON.parse(rawAttr); } catch { rawAttr = []; }
      }

      if (Array.isArray(rawAttr) && rawAttr.length > 0) {
        rawAttr.forEach((item: any) => {
          const label = item.label || item.nameField || item.name || 'Campo';
          const val = String(item.valueFile?.fileName || item.value || item.val || 'N/A');
          doc.fontSize(10).fillColor('#475569').text(`${label}: `, { continued: true }).fillColor('#0f172a').text(val);
          doc.moveDown(0.2);
        });
      } else if (rawAttr && typeof rawAttr === 'object') {
        Object.entries(rawAttr).forEach(([k, v]) => {
          const val = String((v as any)?.fileName || v || 'N/A');
          doc.fontSize(10).fillColor('#475569').text(`${k}: `, { continued: true }).fillColor('#0f172a').text(val);
          doc.moveDown(0.2);
        });
      } else {
        doc.fontSize(10).fillColor('#94a3b8').text('Sin atributos adicionales registrados.');
      }

      doc.end();
    });
  }


  async getTotal(assetTypeId?: string) {
    const camposTotalizables = await this.prisma.assetFieldDefinition.findMany({
      where: {
        ...(assetTypeId && { assetTypeId }),
        metadata: {
          path: ['isCountTotal'],
          equals: true,
        },
      },
      select: {
        id: true,
        label: true,
      },
    });

    if (camposTotalizables.length === 0) {
      return {
        totalGeneral: 0,
        camposSumados: [],
        activos: [],
      };
    }

    const idFieldsParaSumar = camposTotalizables.map((campo) => campo.id);

    const assets = await this.prisma.asset.findMany({
      where: {
        ...(assetTypeId && { assetTypeId }),        
      },
      select: {
        id: true,
        code: true,
        name: true,
        attributesData: true,
      },
    });

    let totalGeneral = 0;

    const activosConTotal = assets.map((asset) => {
      let sumaActivo = 0;
      if (Array.isArray(asset.attributesData)) {
        for (const attr of asset.attributesData as Array<any>) {
          if (idFieldsParaSumar.includes(attr.idField)) {
            let valorNumerico = 0;
            if (attr.value !== undefined && attr.value !== null) {
              if (typeof attr.value === 'number') {
                valorNumerico = attr.value;
              } else {
                const cleaned = String(attr.value).replace(/[^0-9.-]/g, '');
                const parsed = parseFloat(cleaned);
                valorNumerico = isNaN(parsed) ? 0 : parsed;
              }
            }
            sumaActivo += valorNumerico;
            totalGeneral += valorNumerico;
          }
        }
      }

      return {
        id: asset.id,
        code: asset.code,
        name: asset.name,
        totalCalculado: sumaActivo,
        attributesData: asset.attributesData,
      };
    });
    return {
      totalGeneral,
      camposSumados: camposTotalizables.map((c) => c.label), 
      activos: activosConTotal,
    };
  }

}