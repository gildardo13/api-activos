import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

import * as fs from 'fs-extra';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'auto' },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          },
        );

        // Enviar el buffer directamente a Cloudinary
        Readable.from(file.buffer).pipe(stream);
      });
    } catch (error) {
      console.log(error);
      throw new Error(`Cloudinary upload error: ${error.message}`);
    }
  }

  async validateAndUpload(
    file: Express.Multer.File,
    folderPath: string,
  ): Promise<string> {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        'Only .jpg, .jpeg, .png and .pdf files are allowed!',
      );
    }

    const secure_url = await this.uploadFile(file, folderPath);

    return secure_url;
  }

  async validateFileImg(file: Express.Multer.File) {
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (fileExtension || allowedExtensions.includes(fileExtension)) {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException(
          `Invalid file type. Only images are allowed. Received: ${file.mimetype}`,
        );
      }
      return true;
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'auto' },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            },
          );
          Readable.from(file.buffer).pipe(stream); // Enviar el buffer directamente a Cloudinary
        });
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.log(error);
      throw new Error(`Cloudinary upload error: ${error.message}`);
    }
  }
}
