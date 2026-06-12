import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApprovalFlowsService } from './approval-flows.service';
import { CreateSolicitudDto } from './dto/create-approval-flow.dto';
import { UpdateApprovalFlowDto } from './dto/update-approval-flow.dto';
import { resolveModuleAction } from './helper/helper';
import { QueryAssignmentPending } from './dto/query-approval-flow.dto';

@Controller('approval-flows')
export class ApprovalFlowsController {
  private readonly moduleId = process.env.MODULE_ID;
  constructor(private readonly approvalFlowsService: ApprovalFlowsService) { }

  @Get('/getWorkflow')
  getWorkflow() {
    return this.approvalFlowsService.getWorkflow(this.moduleId);
  }

 
  @Post('/createSolicitud')
  createSolicitud(@Body() request: CreateSolicitudDto) {
    const resolvedRequest = resolveModuleAction(request);
    return this.approvalFlowsService.createSolicitud(resolvedRequest, this.moduleId);
  }

   @Get('/getOneListSolicitud')
  getWorkflowStrict(@Query() query:QueryAssignmentPending) {
    return this.approvalFlowsService.getWorkflowStrict(query);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.approvalFlowsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateApprovalFlowDto: UpdateApprovalFlowDto) {
    return this.approvalFlowsService.update(+id, updateApprovalFlowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.approvalFlowsService.remove(+id);
  }

}
