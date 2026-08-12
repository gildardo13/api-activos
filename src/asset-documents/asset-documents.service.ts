import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
  Scope,
  Inject,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateAssetDocumentDto } from './dto/create-asset-document.dto';
import { UpdateAssetDocumentDto } from './dto/update-asset-document.dto';
import { StatusApproval } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryAssetDocumentsDto } from './dto/query-asset-documents.dto';
import axios, { AxiosInstance } from 'axios';

@Injectable({ scope: Scope.REQUEST })
export class AssetDocumentsService {
  private readonly logger = new Logger(AssetDocumentsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) { }

  private get _token(): string {
    return (this.request as any).accessToken
      || process.env.SYSTEM_ACCESS_TOKEN
      || '';
  }

  private get _empresa(): string {
    return (this.request as any).empresa
      || process.env.DEFAULT_ORGANIZATION_ID
      || '';
  }

  private servicesJibbyApi(): AxiosInstance {
    const urlApiJibby = process.env.CONTROL_ACTIVOS_ENV === 'prod' ? process.env.NEXT_PUBLIC_IA_SERVICES_JIBBY_PROD :
      (process.env.CONTROL_ACTIVOS_ENV === 'test' ? process.env.NEXT_PUBLIC_IA_SERVICES_JIBBY_TEST : process.env.NEXT_PUBLIC_IA_SERVICES_JIBBY_DEV);

    return axios.create({
      baseURL: (urlApiJibby || 'http://localhost:2110').replace(/\/$/, ''),
      timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT || '10000', 10),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Helpers de headers (cookie de sesión + empresa)
  // ───────────────────────────────────────────────────────────────────────────
  private buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this._token) headers['Cookie'] = `app_session=${this._token}`;
    headers['empresa'] = this._empresa;
    headers['x-tenant-id'] = this._empresa;
    headers['tenantId'] = this._empresa;
    return { ...headers, ...extra };
  }

  private getFileNameWithExtension(fileName: string, fileUrl: string, contentType: string = ''): string {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.pdf') || lowerName.endsWith('.txt')) {
      return fileName;
    }

    if (contentType.includes('application/pdf')) {
      return `${fileName}.pdf`;
    }
    if (contentType.includes('text/plain')) {
      return `${fileName}.txt`;
    }

    const fileExt = fileUrl.split('.').pop()?.split(/[?#]/)[0]?.toLowerCase();
    if (fileExt === 'pdf' || fileExt === 'txt') {
      return `${fileName}.${fileExt}`;
    }

    // Default fallback
    return `${fileName}.pdf`;
  }

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
          asset: {
            include: {
              assetAssignments: true,
            }
          },
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

  async analyze(documentId: string, query: string) {
    const document = await this.prisma.assetDocument.findUnique({
      where: { id: documentId },
      include: {
        asset: true,
        assetFieldDefinition: true,
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Use documentId as systemkey to aislar el contexto RAG a este documento
    const headers = this.buildHeaders({ systemkey: documentId });
    const api = this.servicesJibbyApi();

    // 1. Verificar si el documento ya existe en el servicio de IA
    let aiDocId: string | null = null;
    try {
      const listRes = await api.get<any[]>('/documents', { headers });
      const existing = listRes.data.find((d: any) => d.storageUrl === document.fileUrl);
      if (existing) {
        aiDocId = existing.id;
      }
    } catch (err) {
      this.logger.error(`Error listing documents from AI service: ${err.message}`);
    }

    // 2. Si no existe, subirlo
    if (!aiDocId) {
      this.logger.log(`Document ${document.fileName} not found in AI service. Uploading...`);
      try {
        const fileResponse = await axios.get(document.fileUrl, { responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(fileResponse.data);

        // Opción segura para Node.js + Axios
        const formData = new FormData();
        const uploadFileName = this.getFileNameWithExtension(
          document.fileName,
          document.fileUrl,
          fileResponse.headers['content-type'] as string,
        );
        // Pasamos el buffer directamente y configuramos el nombre de archivo de forma explícita
        formData.append('file', new Blob([fileBuffer], { type: fileResponse.headers['content-type'] }), uploadFileName);

        const uploadRes = await api.post<any>('/documents/upload', formData, {
          headers: {
            ...headers,
           
            
            // Es vital forzar el Content-Type multipart para que el servidor entienda el archivo
            'Content-Type': 'multipart/form-data'
          }
        });

        aiDocId = uploadRes.data.document.id;
        this.logger.log(`Document uploaded successfully. ID: ${aiDocId}. Waiting for vectorization...`);

        // Polling hasta que la vectorización termine (chunksCount > 0)
        let attempts = 0;
        const maxAttempts = 15;
        while (attempts < maxAttempts) {
          const checkRes = await api.get<any>(`/documents/${aiDocId}`, { headers });
          if (checkRes.data?.chunksCount > 0) {
            this.logger.log(`Vectorization completed with ${checkRes.data.chunksCount} chunks.`);
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
      } catch (uploadErr: any) {
        // Extraemos el error REAL que nos devuelve el servicio de IA
        const externalError = uploadErr.response?.data?.message || uploadErr.response?.data || uploadErr.message;

        this.logger.error(`Failed to upload/vectorize document to AI service:`, externalError);

        throw new BadRequestException(
          `No se pudo procesar el documento en el servicio de IA: ${JSON.stringify(externalError)}`
        );
      }
    }

    // 3. Ejecutar query RAG
    try {
      this.logger.log(`Querying RAG: "${query}" for document: ${aiDocId}`);

      // Asegúrate de que el payload ({ query, limit }) coincide con lo que espera tu API de Jibby
      const ragRes = await api.post<any>('/query/rag', { query, limit: 5 }, { headers });

      return ragRes.data;
    } catch (ragErr: any) {
      // Extraemos el error detallado de la respuesta de Jibby
      const externalError = ragErr.response?.data?.message || ragErr.response?.data || ragErr.message;

      this.logger.error(`RAG query failed:`, externalError);

      throw new BadRequestException(
        `Error al consultar el servicio de IA: ${typeof externalError === 'string' ? externalError : JSON.stringify(externalError)}`
      );
    }
  }

  async analyzeTemp(documentId: string, query: string) {
    const document = await this.prisma.assetDocument.findUnique({
      where: { id: documentId },
      include: {
        asset: true,
        assetFieldDefinition: true,
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const headers = this.buildHeaders({ systemkey: documentId });
    const api = this.servicesJibbyApi();

    let aiDocId: string | null = null;
    try {
      const listRes = await api.get<any[]>('/documents', { headers });
      const existing = listRes.data.find((d: any) => d.storageUrl === document.fileUrl);
      if (existing) {
        aiDocId = existing.id;
      }
    } catch (err) {
      this.logger.error(`Error listing documents from AI service: ${err.message}`);
    }

    // Si ya existe en la base de datos de IA, consumir el flujo RAG estándar (sin persistir nuevas copias)
    if (aiDocId) {
      this.logger.log(`Document already exists in AI service (ID: ${aiDocId}). Using standard RAG query...`);
      try {
        const ragRes = await api.post<any>('/query/rag', { query, limit: 5 }, { headers });
        return ragRes.data;
      } catch (ragErr: any) {
        const externalError = ragErr.response?.data?.message || ragErr.response?.data || ragErr.message;
        this.logger.error(`RAG query failed:`, externalError);
        throw new BadRequestException(
          `Error al consultar el servicio de IA: ${typeof externalError === 'string' ? externalError : JSON.stringify(externalError)}`
        );
      }
    }

    // Si NO existe en la base de datos de IA, realizar todo el procesamiento de manera temporal en el servicio de IA
    this.logger.log(`Document not found in AI service. Querying temporal RAG on AI service...`);
    try {
      this.logger.log(
        `Descargando documento para RAG temporal desde: ${document.fileUrl}`
      );
      const fileResponse = await axios.get(document.fileUrl, { responseType: 'arraybuffer' });
      const fileBuffer = Buffer.from(fileResponse.data);

      const formData = new FormData();
      const uploadFileName = this.getFileNameWithExtension(
        document.fileName,
        document.fileUrl,
        fileResponse.headers['content-type'] as string,
      );
      formData.append(
        'file',
        new Blob([fileBuffer], { type: fileResponse.headers['content-type'] }),
        uploadFileName,
      );
      formData.append('query', query);

      const tempRagRes = await api.post<any>('/query/rag-temp', formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      return tempRagRes.data;
    } catch (err: any) {
      const externalError = err.response?.data?.message || err.response?.data || err.message;
      this.logger.error(`Failed to execute temporal RAG query on AI service:`, externalError);
      throw new BadRequestException(
        `No se pudo procesar la consulta RAG temporal en el servicio de IA: ${JSON.stringify(externalError)}`
      );
    }
  }

}
