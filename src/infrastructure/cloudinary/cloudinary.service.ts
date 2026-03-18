import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  type UploadApiOptions,
  type UploadApiResponse,
} from 'cloudinary';

interface CloudinaryClient {
  config(options: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
    secure: boolean;
  }): void;
  uploader: {
    upload(file: string, options: UploadApiOptions): Promise<UploadApiResponse>;
    upload_stream(
      options: UploadApiOptions,
      callback: (error?: Error, result?: UploadApiResponse) => void,
    ): { end(data: Buffer): void };
    destroy(
      publicId: string,
      options: {
        invalidate: boolean;
        resource_type: 'image' | 'video' | 'raw';
      },
    ): Promise<unknown>;
  };
}

type UploadOptions = Record<string, unknown>;

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  private readonly client = cloudinary as unknown as CloudinaryClient;

  private enabled = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const cloudName = this.configService.get<string>(
      'cloudinary.cloudName',
      '',
    );
    const apiKey = this.configService.get<string>('cloudinary.apiKey', '');
    const apiSecret = this.configService.get<string>(
      'cloudinary.apiSecret',
      '',
    );
    const secure = this.configService.get<boolean>('cloudinary.secure', true);
    const featureEnabled = this.configService.get<boolean>(
      'cloudinary.enabled',
      true,
    );

    if (!featureEnabled) {
      this.enabled = false;
      this.logger.warn('Cloudinary is disabled by CLOUDINARY_ENABLED=false');
      return;
    }

    if (!cloudName || !apiKey || !apiSecret) {
      this.enabled = false;
      this.logger.warn(
        'Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
      return;
    }

    this.client.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure,
    });

    this.enabled = true;
    this.logger.log('Cloudinary configured successfully');
  }

  async upload(
    file: Buffer | string,
    options: UploadOptions = {},
  ): Promise<UploadApiResponse> {
    this.ensureEnabled();

    const defaultFolder = this.configService.get<string | undefined>(
      'cloudinary.folder',
    );
    const uploadPreset = this.configService.get<string | undefined>(
      'cloudinary.uploadPreset',
    );

    const uploadOptions = {
      folder: defaultFolder,
      upload_preset: uploadPreset,
      resource_type: 'auto',
      ...(options as UploadOptions),
    };

    if (Buffer.isBuffer(file)) {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = this.client.uploader.upload_stream(
          uploadOptions as UploadApiOptions,
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error('Cloudinary upload failed'));
              return;
            }

            resolve(result);
          },
        );

        stream.end(file);
      });
    }

    return this.client.uploader.upload(file, uploadOptions as UploadApiOptions);
  }

  async destroy(publicId: string, invalidate = true): Promise<void> {
    this.ensureEnabled();

    await this.client.uploader.destroy(publicId, {
      invalidate,
      resource_type: 'image',
    });
  }

  private ensureEnabled(): void {
    if (!this.enabled) {
      throw new Error(
        'CloudinaryService is not configured. Check CLOUDINARY_* environment variables.',
      );
    }
  }
}
