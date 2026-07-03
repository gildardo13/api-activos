import { StatusApproval } from "@prisma/client";

export class AssetDocument {
  id: string;
  fieldDefinitionId: string;
  assetId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  statusApproval?: StatusApproval;
  commentsApproval?: string;
}
