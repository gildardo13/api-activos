import {
  IsBoolean,
  IsEnum,
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

  @IsEnum(FieldType)
  fieldType: FieldType;

  @IsBoolean()
  isRequired: boolean;
}