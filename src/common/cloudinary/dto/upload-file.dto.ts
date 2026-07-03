import { ApiProperty } from "@nestjs/swagger";

export class UploadFileToCloudinaryDto {
    @ApiProperty({ name: 'toFolderName', type: 'string', example: 'upload/file', required: true })
    toFolderName: string;

    @ApiProperty({
        name: 'file',
        description: 'Image file (.png, .jpg, .jpeg, .pdf)',
        type: 'string',
        format: 'binary',
        required: true
    })
    file: string;
}