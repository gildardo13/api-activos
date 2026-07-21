import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  DATE = 'DATE',
  LOCATION = 'LOCATION',
  CURRENCY = 'CURRENCY',
  GALLERY = 'GALLERY',
  FILE = 'FILE',
}

export class CreateAssetFieldDefinitionDto {
  @IsString()
  assetTypeId: string;

  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsArray()
  @IsOptional()
  options?: string[];

  @IsEnum(FieldType)
  fieldType: FieldType;

  @IsBoolean()
  isRequired: boolean;


  @IsNumber()
  @IsOptional()
  position?: number;


  @IsObject()
  @IsOptional()
  metadata?: any;
}