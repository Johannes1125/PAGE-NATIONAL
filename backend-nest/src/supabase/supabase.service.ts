import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = 
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || 
      this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Supabase credentials are not defined in environment variables.');
    } else {
      this.supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
  }

  async upload(file: Express.Multer.File, bucket: string = 'governance', folder: string = 'cbl'): Promise<string | null> {
    try {
      if (!this.supabaseClient) {
        throw new Error('Supabase client is not initialized.');
      }

      // Ensure bucket exists (optional, errors silently if unauthorized or already exists)
      try {
        await this.supabaseClient.storage.createBucket(bucket, { public: true });
      } catch (err: any) {
        // Silently ignore
      }

      const fileExt = file.originalname.split('.').pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = folder ? `${folder}/${uniqueName}` : uniqueName;

      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        this.logger.error(`Supabase upload failed: ${error.message}`);
        return null;
      }

      // Get public URL
      const { data: urlData } = this.supabaseClient.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return urlData?.publicUrl || null;
    } catch (e: any) {
      this.logger.error(`Supabase upload exception: ${e.message}`);
      return null;
    }
  }
}
