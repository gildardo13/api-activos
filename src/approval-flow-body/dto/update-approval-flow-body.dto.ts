import { PartialType } from '@nestjs/swagger';
import { CreateApprovalFlowBodyDto } from './create-approval-flow-body.dto';

export class UpdateApprovalFlowBodyDto extends PartialType(CreateApprovalFlowBodyDto) {}
