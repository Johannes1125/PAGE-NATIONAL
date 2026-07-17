import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    let cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME')?.trim();
    let apiKey = this.configService.get<string>('CLOUDINARY_API_KEY')?.trim();
    let apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET')?.trim();

    try {
      const envFilePath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envFilePath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envFilePath));
        if (envConfig.CLOUDINARY_CLOUD_NAME) cloudName = envConfig.CLOUDINARY_CLOUD_NAME.trim();
        if (envConfig.CLOUDINARY_API_KEY) apiKey = envConfig.CLOUDINARY_API_KEY.trim();
        if (envConfig.CLOUDINARY_API_SECRET) apiSecret = envConfig.CLOUDINARY_API_SECRET.trim();
      }
    } catch (err) {
      this.logger.warn('Failed to parse local .env file directly: ' + err.message);
    }

    if (process.env.CLOUDINARY_URL) {
      delete process.env.CLOUDINARY_URL;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
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

  async uploadWithPublicId(
    file: Express.Multer.File,
    folder: string = 'page_portal',
  ): Promise<{ imageUrl: string; imagePublicId: string } | null> {
    try {
      return new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              this.logger.error('Cloudinary upload failed: ' + JSON.stringify(error));
              return resolve(null);
            }
            if (result && result.secure_url) {
              resolve({
                imageUrl: result.secure_url,
                imagePublicId: result.public_id,
              });
            } else {
              resolve(null);
            }
          },
        );
        uploadStream.end(file.buffer);
      });
    } catch (e: any) {
      this.logger.error('Cloudinary upload exception: ' + e.message);
      return null;
    }
  }

  async delete(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (e: any) {
      this.logger.error('Cloudinary delete exception: ' + e.message);
      return false;
    }
  }
}

