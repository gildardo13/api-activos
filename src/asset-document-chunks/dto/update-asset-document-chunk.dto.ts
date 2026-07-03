import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetDocumentChunkDto } from './create-asset-document-chunk.dto';

export class UpdateAssetDocumentChunkDto extends PartialType(CreateAssetDocumentChunkDto) {}
