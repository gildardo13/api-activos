import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

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
  @IsOptional()
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
