import { Controller, Post, Req, BadRequestException, UploadedFile, UseInterceptors, NotImplementedException } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as multer from 'multer';
import { Request } from 'express';
import { UploadFileToCloudinaryDto } from './dto/upload-file.dto';

@ApiTags('Upload document - Cloudinary')
@Controller('upload')
export class CloudinaryController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Post('/file')
    @ApiOperation({ summary: 'Upload a file to Cloudinary' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({type: UploadFileToCloudinaryDto})
    @UseInterceptors(
        FileInterceptor('file', {
            storage: multer.memoryStorage(),
        }),
    )
    async uploadFile(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
        try {
            if (!file) {
                throw new BadRequestException('No se subió ningún archivo');
            }

            const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
            const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

            // Validar extensión
            if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
                throw new BadRequestException('Only .jpg, .jpeg, .png, and .pdf files are allowed!');
            }

            // Validar tipo MIME
            if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
                throw new BadRequestException(`Invalid file type: ${file.mimetype}`);
            }

            // Subir archivo a Cloudinary
            const secure_url = await this.cloudinaryService.uploadFile(file, req.body.toFolderName);

            return secure_url;

        } catch (error) {
            throw new NotImplementedException(error)
        }
    }
}
