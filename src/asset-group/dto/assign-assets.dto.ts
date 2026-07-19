import { IsArray, IsString } from 'class-validator';

export class AssignAssetsDto {
  @IsArray()
  @IsString({ each: true })
  assetIds: string[];
}
