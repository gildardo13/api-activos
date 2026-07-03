import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApprovalFlowsService } from './approval-flows.service';
import { ApprovedFlowDto, CreateSolicitudDto } from './dto/create-approval-flow.dto';
import { UpdateApprovalFlowDto } from './dto/update-approval-flow.dto';
import { resolveModuleAction } from './helper/helper';
import { InsertSolicitud, QueryAssignmentPending } from './dto/query-approval-flow.dto';

@Controller('approval-flows')
export class ApprovalFlowsController {
  private readonly moduleId = process.env.MODULE_ID;
  constructor(private readonly approvalFlowsService: ApprovalFlowsService) { }

  @Get('/getWorkflow')
  getWorkflow() {
    return this.approvalFlowsService.getWorkflow(this.moduleId);
  }

  @Post('/createSolicitud')
  createSolicitud(@Query() query: InsertSolicitud, @Body() request: CreateSolicitudDto) {
    const resolvedRequest = resolveModuleAction(request, query.typeModel);
    return this.approvalFlowsService.createSolicitud(resolvedRequest, this.moduleId);
  }

  @Get('/getOneListSolicitud')
  getWorkflowStrict(@Query() query: QueryAssignmentPending) {
    return this.approvalFlowsService.getWorkflowStrict(query);
  }


  @Post('/approvedFlow')
  approvedFlow(@Body() request: ApprovedFlowDto) {
    return this.approvalFlowsService.approvedRequest(request, this.moduleId);
  }

  @Post('/rejectFlow')
  rejectedFlow(@Body() request: ApprovedFlowDto) {
    return this.approvalFlowsService.rejectedRequest(request, this.moduleId);
  }

  @Get('/getWorkflowByClientRef/:clientReferenceId/:moduleActionId')
  getWorkflowByIdClientReference(
    @Param('clientReferenceId') clientReferenceId: string,
    @Param('moduleActionId') moduleActionId: string
  ) {
    return this.approvalFlowsService.getWorkflowByIdClientReference(clientReferenceId, moduleActionId);
  }

  @Post('/resolve-reference')
  resolveReference(
    @Body() body: { id?: string; clientReferenceId?: string; key?: string; moduleAction?: { key: string } }
  ) {
    const id = body.id || body.clientReferenceId;
    const key = body.key || body.moduleAction?.key;
    return this.approvalFlowsService.resolveReference(id, key);
  }
}
