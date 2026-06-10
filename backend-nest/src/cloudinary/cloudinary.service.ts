import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async upload(file: Express.Multer.File, folder: string = 'page_portal'): Promise<string | null> {
    try {
      return new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder,
            resource_type: 'auto', // Support PDF, DOCX, Images automatically
          },
          (error, result) => {
            if (error) {
              this.logger.error('Cloudinary upload failed: ' + JSON.stringify(error));
              return resolve(null);
            }
            resolve(result?.secure_url || null);
          }
        );
        uploadStream.end(file.buffer);
      });
    } catch (e: any) {
      this.logger.error('Cloudinary upload exception: ' + e.message);
      return null;
    }
  }
}
