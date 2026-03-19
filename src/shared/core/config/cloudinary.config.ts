import { registerAs } from '@nestjs/config';

export const cloudinaryConfig = registerAs('cloudinary', () => ({
  enabled: process.env.CLOUDINARY_ENABLED !== 'false',
  cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  apiKey: process.env.CLOUDINARY_API_KEY ?? '',
  apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  secure: process.env.CLOUDINARY_SECURE !== 'false',
  folder: process.env.CLOUDINARY_FOLDER ?? undefined,
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET ?? undefined,
}));

export type CloudinaryConfig = ReturnType<typeof cloudinaryConfig>;
