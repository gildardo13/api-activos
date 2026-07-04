import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApprovalFlowBodyService } from './approval-flow-body.service';
import { CreateApprovalFlowBodyDto, StatusApproval } from './dto/create-approval-flow-body.dto';
import { UpdateApprovalFlowBodyDto } from './dto/update-approval-flow-body.dto';

@Controller('approval-flow-body')
export class ApprovalFlowBodyController {
  constructor(private readonly approvalFlowBodyService: ApprovalFlowBodyService) {}

  @Post('/createApprovalLocal')
  create(@Body() createApprovalFlowBodyDto: CreateApprovalFlowBodyDto) {
    return this.approvalFlowBodyService.create(createApprovalFlowBodyDto);
  }

  @Get('/getApprovalAllLocal')
  findAll() {
    return this.approvalFlowBodyService.findAll();
  }

  @Get('/getOneApprovalLocal/:id')
  findOne(@Param('id') id: string) {
    return this.approvalFlowBodyService.findOne(id);
  }

  @Get('/getOneApprovalLocalReferenceId/:idReference/:idRequest')
  findOneReferenceId(
    @Param('idReference') idReference: string,
    @Param('idRequest') idRequest: string,
  ) {
    return this.approvalFlowBodyService.findOneReferenceId(idReference, idRequest);
  }


  @Patch('/updateOneApprovalLocal/:id')
  update(@Param('id') id: string, @Body() updateApprovalFlowBodyDto: UpdateApprovalFlowBodyDto) {
    return this.approvalFlowBodyService.update(id, updateApprovalFlowBodyDto);
  }

  @Delete('/deleteOneApprovalLocal/:id')
  remove(@Param('id') id: string) {
    return this.approvalFlowBodyService.remove(id);
  }

  @Patch('/assigmentRequest/:id')
  setRequest(@Param('id') id: string, @Body() body:{ request:string}){
    return this.approvalFlowBodyService.assigmentRequest(id, body)
  }

  @Patch('/updateApprovalByReference/:idReference/:idRequest')
  updateByReference(
    @Param('idReference') idReference: string,
    @Param('idRequest') idRequest: string,
    @Body() body: { statusApproval: StatusApproval; commentsApproval: string }
  ) {
    return this.approvalFlowBodyService.updateByReference(
      idReference,
      idRequest,
      body.statusApproval,
      body.commentsApproval
    );
  }
}
