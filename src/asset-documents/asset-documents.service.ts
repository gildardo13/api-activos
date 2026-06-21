import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetDocumentDto } from './dto/create-asset-document.dto';
import { UpdateAssetDocumentDto } from './dto/update-asset-document.dto';
import { PrismaClient, StatusApproval } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryAssetDocumentsDto } from './dto/query-asset-documents.dto';

@Injectable()
export class AssetDocumentsService {
  constructor(private prisma: PrismaService) { }
  async create(dto: CreateAssetDocumentDto) {
    const fieldDefinitionId = dto.fieldDefinitionId;
    const assetId = dto.assetId;
    const fileName = dto.fileName;
    const fileUrl = dto.fileUrl;
    const uploadedAt = dto.uploadedAt;

    // 1. Validar campos requeridos de entrada
    if (!fieldDefinitionId) {
      throw new BadRequestException('fieldDefinitionId (field_definition_id) is required');
    }
    if (!assetId) {
      throw new BadRequestException('assetId (asset_id) is required');
    }
    // 2. Validar que el activo exista
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // 3. Validar que la definición de campo exista
    const fieldDefinition = await this.prisma.assetFieldDefinition.findUnique({
      where: { id: fieldDefinitionId },
    });
    if (!fieldDefinition) {
      throw new NotFoundException(
        `Field definition with ID ${fieldDefinitionId} not found`,
      );
    }

    // 4. Validar que la definición pertenezca al tipo del activo
    if (fieldDefinition.assetTypeId !== asset.assetTypeId) {
      throw new BadRequestException(
        `Field definition ${fieldDefinitionId} does not belong to the asset's type (${asset.assetTypeId})`,
      );
    }

    // 5. Validar que la definición de campo sea de tipo FILE
    if (fieldDefinition.fieldType !== 'FILE') {
      throw new BadRequestException(
        `Field definition ${fieldDefinitionId} is not of type FILE (found ${fieldDefinition.fieldType})`,
      );
    }

    // 6. Validar documentos duplicados para esta combinación de activo y definición de campo
    const existingDoc = await this.prisma.assetDocument.findFirst({
      where: {
        assetId,
        fieldDefinitionId,
      },
    });
    if (existingDoc) {
      throw new BadRequestException(
        `A document for field definition ${fieldDefinitionId} is already registered for asset ${assetId}`,
      );
    }

    // 7. Crear el documento
    return this.prisma.assetDocument.create({
      data: {
        assetId,
        fieldDefinitionId,
        fileName,
        fileUrl,
        uploadedAt: uploadedAt ? new Date(uploadedAt) : new Date(),
      },
    });
  }

  async getTotal() {
    const total = await this.prisma.assetDocument.findMany();
    return total.length;

  }

  async findAll(query: QueryAssetDocumentsDto) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      sortByDate = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    await this.prisma.assetDocument.deleteMany({
      where: {
        fileUrl: "" as any,
      },
    });
    // ── Búsqueda ──────────────────────────────────────
    if (searchTerm) {
      where.OR = [
        {
          fileName: { // OJO: Cambié 'name' por 'fileName' si es que tu modelo usa la propiedad del primer ejemplo
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        // Si buscas por propiedades del Asset relacionado, se anida así:
        {
          asset: {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          asset: {
            code: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // ── Ejecución en paralelo (Contador + Búsqueda) ────
    const [total, items] = await Promise.all([
      this.prisma.assetDocument.count({
        where,
      }),

      this.prisma.assetDocument.findMany({
        where,
        skip,
        take: limit,
        include: {
          asset: true,
          assetFieldDefinition: true,
        },
        orderBy: {
          createdAt: sortByDate, // Aquí usamos la variable dinámica de tu query
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

  async findOne(id: string) {
    const document = await this.prisma.assetDocument.findUnique({
      where: { id },
      include: {
        asset: true,
        assetFieldDefinition: true,
      },
    });

    if (!document) {
      throw new NotFoundException(`Asset document with ID ${id} not found`);
    }

    return document;
  }

  async updateStatusApproval(id: string, dto: UpdateAssetDocumentDto) {
    const existing = await this.prisma.assetDocument.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Asset document with ID ${id} not found`);
    }

    const statusApproval = dto.statusApproval ?? existing.statusApproval;
    const commentsApproval = dto.commentsApproval ?? existing.commentsApproval;
    return this.prisma.assetDocument.update({
      where: { id },
      data: {
        statusApproval,
        commentsApproval,
      },
    });
  }

  async update(id: string, dto: UpdateAssetDocumentDto) {
    const existing = await this.prisma.assetDocument.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Asset document with ID ${id} not found`);
    }

    const fieldDefinitionId = dto.fieldDefinitionId ?? existing.fieldDefinitionId;
    const assetId = dto.assetId ?? existing.assetId;
    const fileName = dto.fileName ?? existing.fileName;
    const fileUrl = dto.fileUrl ?? existing.fileUrl;
    const uploadedAt = dto.uploadedAt ?? existing.uploadedAt;

    // Si cambian la definición o el activo, hacer las validaciones correspondientes
    if (
      fieldDefinitionId !== existing.fieldDefinitionId ||
      assetId !== existing.assetId
    ) {
      const asset = await this.prisma.asset.findUnique({
        where: { id: assetId },
      });
      if (!asset) {
        throw new NotFoundException(`Asset with ID ${assetId} not found`);
      }

      const fieldDefinition = await this.prisma.assetFieldDefinition.findUnique({
        where: { id: fieldDefinitionId },
      });
      if (!fieldDefinition) {
        throw new NotFoundException(
          `Field definition with ID ${fieldDefinitionId} not found`,
        );
      }

      if (fieldDefinition.assetTypeId !== asset.assetTypeId) {
        throw new BadRequestException(
          `Field definition ${fieldDefinitionId} does not belong to the asset's type (${asset.assetTypeId})`,
        );
      }

      if (fieldDefinition.fieldType !== 'FILE') {
        throw new BadRequestException(
          `Field definition ${fieldDefinitionId} must be of type FILE`,
        );
      }

      const duplicate = await this.prisma.assetDocument.findFirst({
        where: {
          id: { not: id },
          assetId,
          fieldDefinitionId,
        },
      });
      if (duplicate) {
        throw new BadRequestException(
          `A document for field definition ${fieldDefinitionId} already exists for asset ${assetId}`,
        );
      }
    }

    return this.prisma.assetDocument.update({
      where: { id },
      data: {
        fieldDefinitionId,
        assetId,
        fileName,
        fileUrl,
        uploadedAt: uploadedAt ? new Date(uploadedAt) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.assetDocument.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Asset document with ID ${id} not found`);
    }

    await this.prisma.assetDocument.delete({
      where: { id },
    });

    return {
      message: 'Asset document deleted successfully',
    };
  }

  async validateRequiredDocuments(assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        assetType: {
          include: {
            assetFieldDefinitions: {
              where: {
                fieldType: 'FILE',
                isRequired: true,
              },
            },
          },
        },
        assetDocuments: true,
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    const requiredFieldDefinitions = asset.assetType.assetFieldDefinitions;
    const uploadedFieldDefIds = new Set(
      asset.assetDocuments.map((doc) => doc.fieldDefinitionId),
    );

    const missingFields = requiredFieldDefinitions
      .filter((def) => !uploadedFieldDefIds.has(def.id))
      .map((def) => ({
        id: def.id,
        label: def.label,
        isRequired: def.isRequired,
      }));

    return {
      valid: missingFields.length === 0,
      missingFields,
    };
  }

  async updateStatuApproval(id: string, status: string, rejectionComment?: string) {
    const existing = await this.prisma.assetDocument.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Asset Document not found');
    }

    return this.prisma.assetDocument.update({
      where: { id },
      data: {
        statusApproval: status as StatusApproval,
        commentsApproval: rejectionComment
      }
    });
  }
}
