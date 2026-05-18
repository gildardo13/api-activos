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

export class AssetType  {
     @IsOptional()
      @IsString()
      categoryId?: string;
    
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
