import { Injectable, HttpException, HttpStatus, Logger, Scope, Inject, forwardRef } from '@nestjs/common';
import { ApprovedFlowDto, CreateApprovalFlowDto, CreateSolicitudDto } from './dto/create-approval-flow.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import axios, { AxiosInstance } from 'axios';
import { QueryAssignmentPending } from './dto/query-approval-flow.dto';
import { AssetAssignmentsService } from 'src/asset-assignments/asset-assignments.service';
import { AssetsService } from 'src/assets/assets.service';
import { UpdateAssetDto } from 'src/assets/dto/update-asset.dto';
import { UpdateAssetGeofenceDto } from 'src/asset-geofences/dto/update-asset-geofence.dto';
import { AssetGeofencesService } from 'src/asset-geofences/asset-geofences.service';
import { StatusApproval } from 'src/assets/dto/create-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssetDocumentsService } from 'src/asset-documents/asset-documents.service';


@Injectable({ scope: Scope.REQUEST })
export class ApprovalFlowsService {
  private readonly moduleId = process.env.MODULE_ID;
  private readonly logger = new Logger(ApprovalFlowsService.name);

  constructor(

    private readonly prisma: PrismaService,
    @Inject(REQUEST)
    private readonly request: Request,

    @Inject(forwardRef(() => AssetAssignmentsService))
    private readonly assetAssignmentsService: AssetAssignmentsService,

    @Inject(forwardRef(() => AssetsService))
    private readonly assetsService: AssetsService,

    @Inject(forwardRef(() => AssetGeofencesService))
    private readonly geocercaService: AssetGeofencesService,

    @Inject(forwardRef(() => AssetDocumentsService))
    private readonly assetDocumentsService: AssetDocumentsService

  ) { }

  private get _token(): string {
    const cookies = this.request.headers.cookie || '';
    const appSession = cookies
      .split(';')
      .find(cookie => cookie.trim().startsWith('app_session='))
      ?.split('=')[1];
    return appSession || '';
  }

  private get _empresa(): string {
    return (this.request as any).empresa
      || process.env.DEFAULT_ORGANIZATION_ID
      || '';
  }

  private workflowApi(): AxiosInstance {
    return axios.create({
      baseURL:
        process.env.CONTROL_ACTIVOS_ENV === 'dev'
          ? process.env.WORKFLOW_BACK_DEV
          : process.env.CONTROL_ACTIVOS_ENV === 'prod'
            ? process.env.WORKFLOW_BACK_PROD
            : process.env.WORKFLOW_BACK_TEST,
      timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT || '10000', 10),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this._token) {
      headers['Authorization'] = `Bearer ${this._token}`;
    }
    headers['organizationId'] = this._empresa;
    return headers;
  }

  async getWorkflow(moduleId: string): Promise<any[]> {
    try {
      const res = await this.workflowApi().get<any>(`approval/request/${moduleId}`, {
        headers: this.buildHeaders(),
      });

      return res.data;
    } catch (err: any) {
      this.logger.error(`getWorkflow error: ${err.message}`);
      throw new HttpException(
        'Error al obtener workflows',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getWorkflowStrict(query: QueryAssignmentPending): Promise<any[]> {
    try {
      const res = await this.workflowApi().get<any>(`approval/request/pending?page=${query.page}&pageSize=${query.pageSize}`, {
        headers: this.buildHeaders(),
      });

      return res.data;
    } catch (err: any) {
      console.log('STATUS:', err.response?.status);
      console.log('DATA:', err.response?.data);
      console.log('URL:', err.config?.baseURL + err.config?.url);
      console.log('METHOD:', err.config?.method);
      this.logger.error(`getWorkflow error: ${err.message}`);
      throw new HttpException(
        'Error al obtener workflows',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getWorkflowidRequest(moduleId: string, id: string, idAction: string): Promise<any[]> {
    try {
      const query = new URLSearchParams();
      query.append("action", idAction)
      const res = await this.workflowApi().get<any>(`approval/request/${moduleId}/id/${id}?${query.toString()}`, {
        headers: this.buildHeaders(),
      });

      return res.data;
    } catch (err: any) {
      console.log('STATUS:', err.response?.status);
      console.log('DATA:', err.response?.data);
      console.log('URL:', err.config?.baseURL + err.config?.url);
      console.log('METHOD:', err.config?.method);
      this.logger.error(`getWorkflow error: ${err.message}`);
      throw new HttpException(
        'Error al obtener workflows',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }



  async createSolicitud(request: CreateSolicitudDto, moduleId: string) {
    try {
      /*const res = await this.workflowApi().post<any>(`approval/request/${moduleId}`, request, {
        headers: this.buildHeaders(),
      });
      if (res.data === null || res.data === undefined || (Array.isArray(res.data) && res.data.length === 0) || (typeof res.data === "object" && !Array.isArray(res.data) && Object.keys(res.data).length === 0)
      ) {
        return [];
      }

      return res.data;*/

      return [];


    } catch (err: any) {
      console.log('STATUS:', err.response?.status);
      console.log('DATA:', err.response?.data);
      console.log('URL:', err.config?.baseURL + err.config?.url);
      console.log('METHOD:', err.config?.method);

      this.logger.error(`createSolicitud error: ${err.message}`);
      return [];
    }
  }

  async getWorkflowByIdClientReference(
    clientReferenceId: string,
    moduleActionId: string
  ) {
    try {
      const query = new URLSearchParams();
      query.append('action', moduleActionId);
      const res = await this.workflowApi().get(
        `approval/request/${this.moduleId}/ref/${clientReferenceId}` + `?action=${moduleActionId}`,
        {
          headers: this.buildHeaders(),
        },
      );
      return res.data ?? null;
    } catch (err: any) {
      /*this.logger.error(
        `getWorkflowByIdClientReference error: ${err.message}`,
      );*/

      throw new HttpException(
        'Error al obtener workflow',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async approvedRequest(request: ApprovedFlowDto, moduleId: string) {
    const { requestId, comments } = request;
    try {
      const res = await this.workflowApi().post(
        `approval/request/${requestId}/approve`,
        { comments: comments },
        {
          headers: this.buildHeaders(),
        },
      );
      if (res.data.status === "approved") {
        this.verificarAction(res.data.clientReferenceId, res.data.moduleActionId, res.data);
      }

      this.updateStatus(res.data);
      return res.data;
    } catch (err: any) {
      this.logger.error(`approvedRequest error: ${err.message}`);
      throw new HttpException(
        'Error al aprobar solicitud',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async rejectedRequest(request: ApprovedFlowDto, moduleId: string) {
    const { requestId, comments } = request;
    try {
      const res = await this.workflowApi().post(
        `approval/request/${requestId}/reject`,
        { comments: comments },
        {
          headers: this.buildHeaders(),
        },
      );
      this.verificarActionReacjt(res.data.clientReferenceId, res.data.moduleActionId, res.data);
      return res.data;
    } catch (err: any) {
      this.logger.error(`rejectedRequest error: ${err.message}`);
      throw new HttpException(
        'Error al rechazar solicitud',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }


  async updateStatus(request: any) {
    try {

      if (request.moduleAction.key === 'ASSIGNMENT') {
        this.assetAssignmentsService.approvalStatus(request.clientReferenceId, request.status.toUpperCase())
      }

      /*if (request.moduleAction.name === 'active_assign') {
        this.assetAssignmentsService.approvalStatus(request.clientReferenceId, request.status.toUpperCase())
      }*/
    } catch (err: any) {
      this.logger.error(`updateStatus error: ${err.message}`);
      throw new HttpException(
        'Error al actualizar estado',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }


  async verificarAction(id: string, moduleId, data: any) {
    const approvedStep = data.steps.find(
      (step) => step.order === data.steps.length
    );
    const approvedComment = approvedStep?.comments ?? null;
    if (data) {
      const approvalBody = await this.prisma.approvalFlowBody.findUnique({
        where: { id: data.clientReferenceId },
      });

      if (!approvalBody) {
        this.logger.warn(`No se encontró el ApprovalFlowBody con id ${data.clientReferenceId}`);
        return;
      }

      const metadata: any = approvalBody.metadata || {};
      const realReferenceId = approvalBody.idReference;

      if (approvalBody.typeAction === "UPDATE") {
        const dto = { ...metadata.dtoAsset, statusApproval: StatusApproval.APPROVED } as UpdateAssetDto;
        await this.assetsService.update(realReferenceId, dto);
        await this.assetsService.updateStatuApproval(realReferenceId, StatusApproval.APPROVED, approvedComment);

        const dtoGeocerca = metadata.dtoGeofence;
        if (dtoGeocerca && dtoGeocerca.name) {
          if (dtoGeocerca.idExiting) {
            await this.geocercaService.update(dtoGeocerca.idExiting, {
              name: dtoGeocerca.name,
              coordinates: dtoGeocerca.coordinates,
            });
          } else {
            await this.geocercaService.create({
              assetId: realReferenceId,
              name: dtoGeocerca.name,
              coordinates: dtoGeocerca.coordinates,
              status: dtoGeocerca.status,
            });
          }
        }
      }
      else if (approvalBody.typeAction === "ASSIGNMENT") {
        await this.assetAssignmentsService.approvalStatus(realReferenceId, StatusApproval.APPROVED, approvedComment);
      }
      else if (approvalBody.typeAction === "CHANGES") {
        await this.assetDocumentsService.updateStatuApproval(realReferenceId, StatusApproval.APPROVED, approvedComment);
        await this.assetDocumentsService.update(realReferenceId, metadata.dtoDocument);
      }

      await this.prisma.approvalFlowBody.update({
        where: { id: approvalBody.id },
        data: {
          statusApproval: 'APPROVED',
          commentsApproval: approvedComment,
        },
      });
    }
  }

  async verificarActionReacjt(id: string, moduleId, data: any) {
    const rejectedStep = data.steps.find(
      (step) => step.status === 'rejected'
    );
    const rejectionComment = rejectedStep?.comments ?? null;
    if (data) {
      const approvalBody = await this.prisma.approvalFlowBody.findUnique({
        where: { id: data.clientReferenceId },
      });

      if (!approvalBody) {
        this.logger.warn(`No se encontró el ApprovalFlowBody con id ${data.clientReferenceId}`);
        return;
      }

      const metadata: any = approvalBody.metadata || {};
      const realReferenceId = approvalBody.idReference;

      if (approvalBody.typeAction === "UPDATE") {
        await this.assetsService.updateStatuApproval(realReferenceId, StatusApproval.REJECTED, rejectionComment);
      }
      else if (approvalBody.typeAction === "ASSIGNMENT") {
        await this.assetAssignmentsService.approvalStatus(realReferenceId, StatusApproval.REJECTED, rejectionComment, true);
        const assetId = metadata.dto?.assetId || realReferenceId;
        await this.prisma.assetTelemetryLog.deleteMany({
          where: {
            assetId: assetId,
          },
        });
        await this.prisma.asset.update({
          where: { id: assetId },
          data: {
            lastLocation: null,
          },
        });
      }
      else if (approvalBody.typeAction === "CHANGES") {
        await this.assetDocumentsService.updateStatuApproval(realReferenceId, StatusApproval.REJECTED, rejectionComment);
      }

      await this.prisma.approvalFlowBody.update({
        where: { id: approvalBody.id },
        data: {
          statusApproval: 'REJECTED',
          commentsApproval: rejectionComment,
        },
      });
    }
  }

  async resolveReference(clientReferenceId: string, actionKey: string): Promise<{ description: string }> {
    try {
      const key = (actionKey || '').toUpperCase();
      let description = 'N/A';

      if (!clientReferenceId) {
        return { description };
      }

      let realReferenceId = clientReferenceId;
      const approvalBody = await this.prisma.approvalFlowBody.findUnique({
        where: { id: clientReferenceId },
      });
      if (approvalBody) {
        realReferenceId = approvalBody.idReference;
      }

      const shortId = realReferenceId.slice(0, 8);

      if (key === 'ASSIGNMENT') {
        const assignment = await this.prisma.assetAssignment.findUnique({
          where: { id: realReferenceId },
          include: {
            asset: true,
            project: true,
          },
        });

        if (assignment) {
          const assetName = assignment.asset?.name || '';
          let assigneeName = '';

          if (assignment.assignmentType === 'STAFF') {
            const staff = assignment.staffId as any;
            assigneeName = staff?.name || 'Colaborador';
          } else if (assignment.assignmentType === 'AREA') {
            const area = assignment.areaId as any;
            assigneeName = area?.name || 'Área';
          } else if (assignment.assignmentType === 'PROJECT') {
            assigneeName = assignment.project?.name || 'Proyecto';
          }

          description = `${assetName}${assigneeName ? ` - Asignado: ${assigneeName}` : ''}`;
        } else {
          description = `Asignación (${shortId})`;
        }
      } else if (key === 'CHANGES') {
        const document = await this.prisma.assetDocument.findUnique({
          where: { id: realReferenceId },
          include: {
            asset: true,
            assetFieldDefinition: true,
          },
        });

        if (document) {
          const assetName = document.asset?.name || '';
          const docType = document.assetFieldDefinition?.label || 'Documento';
          const fileName = document.fileName || '';
          description = `${assetName ? `${assetName} - ` : ''}${docType}: ${fileName}`;
        } else {
          description = `Documento (${shortId})`;
        }
      } else if (key === 'UPDATE' || key === 'UPDATE_INFO' || key === 'ACTIVE_MODIFICATION') {
        const asset = await this.prisma.asset.findUnique({
          where: { id: realReferenceId },
        });

        if (asset) {
          description = `${asset.name}${asset.code ? ` == ${asset.code}` : ''}`;
        } else {
          description = `Activo (${shortId})`;
        }
      }

      return { description };
    } catch (err: any) {
      this.logger.error(`resolveReference error: ${err.message}`);
      return { description: 'N/A' };
    }
  }

  async resolveReferencesBulk(items: Array<{ id: string; key: string }>): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    if (!items || !Array.isArray(items) || items.length === 0) {
      return results;
    }

    try {
      // Obtener todos los ApprovalFlowBody correspondientes para mapear ids locales a reales si es necesario
      const inputIds = items.map(item => item.id);
      const approvalBodies = await this.prisma.approvalFlowBody.findMany({
        where: { id: { in: inputIds } },
      });

      const bodyMap = new Map(approvalBodies.map(b => [b.id, b.idReference]));

      // Separar los IDs reales por tipo de entidad para hacer consultas agrupadas (bulk)
      const assignmentIds: string[] = [];
      const documentIds: string[] = [];
      const assetIds: string[] = [];

      const resolvedIdToInputId = new Map<string, string>();

      for (const item of items) {
        const realId = bodyMap.get(item.id) || item.id;
        resolvedIdToInputId.set(realId, item.id);

        const key = (item.key || '').toUpperCase();
        if (key === 'ASSIGNMENT') {
          assignmentIds.push(realId);
        } else if (key === 'CHANGES') {
          documentIds.push(realId);
        } else if (key === 'UPDATE' || key === 'UPDATE_INFO' || key === 'ACTIVE_MODIFICATION') {
          assetIds.push(realId);
        } else {
          results[item.id] = `Referencia (${realId.slice(0, 8)})`;
        }
      }

      // 1. Consultar Asignaciones en bulk
      if (assignmentIds.length > 0) {
        const assignments = await this.prisma.assetAssignment.findMany({
          where: { id: { in: assignmentIds } },
          include: { asset: true, project: true }
        });
        for (const assignment of assignments) {
          const inputId = resolvedIdToInputId.get(assignment.id) || assignment.id;
          const assetName = assignment.asset?.name || '';
          let assigneeName = '';
          if (assignment.assignmentType === 'STAFF') {
            const staff = assignment.staffId as any;
            assigneeName = staff?.name || 'Colaborador';
          } else if (assignment.assignmentType === 'AREA') {
            const area = assignment.areaId as any;
            assigneeName = area?.name || 'Área';
          } else if (assignment.assignmentType === 'PROJECT') {
            assigneeName = assignment.project?.name || 'Proyecto';
          }
          results[inputId] = `${assetName}${assigneeName ? ` - Asignado: ${assigneeName}` : ''}`;
        }
      }

      // 2. Consultar Documentos en bulk
      if (documentIds.length > 0) {
        const documents = await this.prisma.assetDocument.findMany({
          where: { id: { in: documentIds } },
          include: { asset: true, assetFieldDefinition: true }
        });
        for (const doc of documents) {
          const inputId = resolvedIdToInputId.get(doc.id) || doc.id;
          const assetName = doc.asset?.name || '';
          const docType = doc.assetFieldDefinition?.label || 'Documento';
          const fileName = doc.fileName || '';
          results[inputId] = `${assetName ? `${assetName} - ` : ''}${docType}: ${fileName}`;
        }
      }

      // 3. Consultar Activos en bulk
      if (assetIds.length > 0) {
        const assets = await this.prisma.asset.findMany({
          where: { id: { in: assetIds } }
        });
        for (const asset of assets) {
          const inputId = resolvedIdToInputId.get(asset.id) || asset.id;
          results[inputId] = `${asset.name}${asset.code ? ` == ${asset.code}` : ''}`;
        }
      }

      // Rellenar fallbacks para los IDs que no se pudieron encontrar en la base de datos
      for (const item of items) {
        if (!results[item.id]) {
          const realId = bodyMap.get(item.id) || item.id;
          const shortId = realId.slice(0, 8);
          const key = (item.key || '').toUpperCase();
          if (key === 'ASSIGNMENT') {
            results[item.id] = `Asignación (${shortId})`;
          } else if (key === 'CHANGES') {
            results[item.id] = `Documento (${shortId})`;
          } else {
            results[item.id] = `Activo (${shortId})`;
          }
        }
      }
    } catch (err: any) {
      this.logger.error(`resolveReferencesBulk error: ${err.message}`);
    }

    return results;
  }
}
