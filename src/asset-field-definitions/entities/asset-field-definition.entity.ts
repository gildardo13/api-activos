import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum  FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  DATE = 'DATE',
  FILE = 'FILE',
}

export class AssetFieldDefinition {
  id: string;
  
  @IsOptional()
  @IsString()
  assetTypeId?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsArray()
  @IsOptional()
  options?: string[];

  @IsOptional()
  @IsEnum(FieldType)
  fieldType?: FieldType;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}