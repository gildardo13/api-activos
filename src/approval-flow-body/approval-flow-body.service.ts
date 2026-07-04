import { Injectable } from '@nestjs/common';
import { CreateApprovalFlowBodyDto, StatusApproval } from './dto/create-approval-flow-body.dto';
import { UpdateApprovalFlowBodyDto } from './dto/update-approval-flow-body.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ApprovalFlowBodyService {

  constructor(
    private prisma: PrismaService,
  ) { }
  create(createApprovalFlowBodyDto: CreateApprovalFlowBodyDto) {
    return this.prisma.approvalFlowBody.create({
      data: {
        idReference: createApprovalFlowBodyDto.idReference || '',
        idRequest: createApprovalFlowBodyDto.idRequest,
        metadata: createApprovalFlowBodyDto.metadata,
        typeAction: createApprovalFlowBodyDto.typeAction || '',
        statusApproval: createApprovalFlowBodyDto.statusApproval,
        commentsApproval: createApprovalFlowBodyDto.commentsApproval,
      },
    });
  }

  findAll() {
    return this.prisma.approvalFlowBody.findMany();
  }

  findOne(id: string) {
    return this.prisma.approvalFlowBody.findUnique({
      where: { id },
    });
  }

  findOneReferenceId(idReference: string, idRequest: string) {
    return this.prisma.approvalFlowBody.findFirst({
      where: {
        idReference,
        idRequest,
      },
    });
  }



  update(id: string, updateApprovalFlowBodyDto: UpdateApprovalFlowBodyDto) {
    return this.prisma.approvalFlowBody.update({
      where: { id },
      data: {
        idReference: updateApprovalFlowBodyDto.idReference,
        idRequest: updateApprovalFlowBodyDto.idRequest,
        metadata: updateApprovalFlowBodyDto.metadata,
        typeAction: updateApprovalFlowBodyDto.typeAction,
        statusApproval: updateApprovalFlowBodyDto.statusApproval,
        commentsApproval: updateApprovalFlowBodyDto.commentsApproval,
      },
    });
  }

  remove(id: string) {
    return this.prisma.approvalFlowBody.delete({
      where: { id },
    });
  }

  assigmentRequest(id: string, body: { request: string }) {
    return this.prisma.approvalFlowBody.update({
      where: { id },
      data: {
        idRequest: body.request,
      },
    });
  }

  updateByReference(idReference: string, idRequest: string, statusApproval: StatusApproval, commentsApproval: string) {
    return this.prisma.approvalFlowBody.updateMany({
      where: {
        idReference,
        idRequest,
      },
      data: {
        statusApproval,
        commentsApproval,
      },
    });
  }
}
