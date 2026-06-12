import { Injectable, HttpException, HttpStatus, Logger, Scope, Inject } from '@nestjs/common';
import { CreateApprovalFlowDto, CreateSolicitudDto } from './dto/create-approval-flow.dto';
import { UpdateApprovalFlowDto } from './dto/update-approval-flow.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import axios, { AxiosInstance } from 'axios';
import { QueryAssignmentPending } from './dto/query-approval-flow.dto';

@Injectable({ scope: Scope.REQUEST })
export class ApprovalFlowsService {
  private readonly moduleId = process.env.MODULE_ID;
  private readonly logger = new Logger(ApprovalFlowsService.name);

  constructor(@Inject(REQUEST) private readonly request: Request) { }

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

  async getWorkflowStrict(query:QueryAssignmentPending): Promise<any[]> {
    try {
      const res = await this.workflowApi().get<any>(`approval/request/pending?page=${query.page}&pageSize=${query.pageSize}`, {
        headers: this.buildHeaders(),
      });

      return res.data;
    } catch (err: any) {
      //console.log('URL:', err.config?.baseURL + err.config?.url);
      //console.log('STATUS:', err.response?.status);
      //console.log('DATA:', err.response?.data);

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

      return res.data;
    } catch (err: any) {
      this.logger.error(`createSolicitud error: ${err.message}`);
      throw new HttpException(
        'Error al crear solicitud',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getWorkflowByIdClientReference(
    clientReferenceId: string,
  ) {
    try {
      const res = await this.workflowApi().get(
        `approval/request/${this.moduleId}`,
        {
          headers: this.buildHeaders(),
        },
      );

      const workflow = res.data.find(
        (item: any) => item.clientReferenceId === clientReferenceId,
      );

      return workflow ?? null;
    } catch (err: any) {
      this.logger.error(
        `getWorkflowByIdClientReference error: ${err.message}`,
      );

      throw new HttpException(
        'Error al obtener workflow',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }



  create(createApprovalFlowDto: CreateApprovalFlowDto) {
    return 'This action adds a new approvalFlow';
  }

  findAll() {
    return `This action returns all approvalFlows`;
  }

  findOne(id: number) {
    return `This action returns a #${id} approvalFlow`;
  }

  update(id: number, updateApprovalFlowDto: UpdateApprovalFlowDto) {
    return `This action updates a #${id} approvalFlow`;
  }

  remove(id: number) {
    return `This action removes a #${id} approvalFlow`;
  }
}
