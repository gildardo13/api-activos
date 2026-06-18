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



  async createSolicitud(request: CreateSolicitudDto, moduleId: string) {
    try {
      const res = await this.workflowApi().post<any>(`approval/request/${moduleId}`, request, {
        headers: this.buildHeaders(),
      });
      if (res.data === null || res.data === undefined || (Array.isArray(res.data) && res.data.length === 0) || (typeof res.data === "object" && !Array.isArray(res.data) && Object.keys(res.data).length === 0)
      ) {
        return [];
      }

      return res.data;

      //return [];


    } catch (err: any) {
      console.log('STATUS:', err.response?.status);
      console.log('DATA:', err.response?.data);
      console.log('URL:', err.config?.baseURL + err.config?.url);
      console.log('METHOD:', err.config?.method);

      this.logger.error(`createSolicitud error: ${err.message}`);
      throw new HttpException(
        'Error al crear solicitud',
        HttpStatus.BAD_GATEWAY,
      );
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

      if (request.moduleAction.name === 'active_assign') {
        this.assetAssignmentsService.approvalStatus(request.clientReferenceId, request.status.toUpperCase())
      }
    } catch (err: any) {
      this.logger.error(`updateStatus error: ${err.message}`);
      throw new HttpException(
        'Error al actualizar estado',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }


  async verificarAction(id: string, moduleId, data: any) {
    // const data = await this.getWorkflowByIdClientReference(id, moduleId);
    const approvedStep = data.steps.find(
      (step) => step.order === data.steps.length
    );
    const approvedComment = approvedStep?.comments ?? null;
    if (data) {
      if (data.moduleAction.key === "update") {
        const dto = { ...data.metadata.dtoAsset, statusApproval: StatusApproval.APPROVED } as UpdateAssetDto;
        await this.assetsService.update(data.clientReferenceId, dto,)
        await this.assetsService.updateStatuApproval(data.clientReferenceId, StatusApproval.APPROVED, approvedComment)
        const dtoGeocerca = data.metadata.dtoGeofence;
        if (dtoGeocerca.name) {
          if (dtoGeocerca.idExiting) {
            this.geocercaService.update(dtoGeocerca.idExiting, {
              name: dtoGeocerca.name,
              coordinates: dtoGeocerca.coordinates,
            })
          } else {
            this.geocercaService.create({
              assetId: data.clientReferenceId,
              name: dtoGeocerca.name,
              coordinates: dtoGeocerca.coordinates,
              status: dtoGeocerca.status
            })
          }

        }
      }
      else if (data.moduleAction.key === "assignment") {
        await this.assetAssignmentsService.approvalStatus(data.clientReferenceId, StatusApproval.APPROVED, approvedComment);
      }
      if (data.moduleAction.key === "changes") {
        await this.assetDocumentsService.updateStatuApproval(data.clientReferenceId, StatusApproval.APPROVED, approvedComment);
        await this.assetDocumentsService.update(data.clientReferenceId, data.metadata.dtoDocument);

      }
    }
  }

  async verificarActionReacjt(id: string, moduleId, data: any) {
    const rejectedStep = data.steps.find(
      (step) => step.status === 'rejected'
    );
    const rejectionComment = rejectedStep?.comments ?? null;
    if (data) {
      if (data.moduleAction.key === "update") {
        this.assetsService.updateStatuApproval(data.clientReferenceId, StatusApproval.REJECTED, rejectionComment);
      }
      else if (data.moduleAction.key === "assignment") {
        this.assetAssignmentsService.approvalStatus(data.clientReferenceId, StatusApproval.REJECTED, rejectionComment, true)
        const d = await this.prisma.assetTelemetryLog.deleteMany({
          where: {
            assetId: data.metadata.dto.assetId || data.clientReferenceId,
          },
        });
        await this.prisma.asset.update({
          where: { id: data.metadata.dto.assetId },
          data: {
            lastLocation: null,
          },
        });

        await this.prisma.assetTelemetryLog.findMany({
          where: {
            assetId: data.metadata.dto.assetId,
          },
        });
      }
      else if (data.moduleAction.key === "changes") {
        await this.assetDocumentsService.updateStatuApproval(data.clientReferenceId, StatusApproval.REJECTED, rejectionComment);
      }

    }
  }
}
