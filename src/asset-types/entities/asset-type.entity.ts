import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ClasificationType } from '../dto/create-asset-type.dto';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class CategoryJibby {
  id: string;
  name: string;
}

export class AssetType {
  id: string;

  @IsEnum(ClasificationType)
  clasificationType?: ClasificationType;

  @IsString()
  categoryId?: CategoryJibby;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
