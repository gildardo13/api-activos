import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  DATE = 'DATE',
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
}