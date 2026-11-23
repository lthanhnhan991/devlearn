import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { env } from '../config/env';

const hasCredentials = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

if (hasCredentials) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadResult {
  secure_url: string;
  public_id: string;
  duration?: number;
}

export async function uploadToCloudinary(
  filePath: string,
  folder: string,
  resourceType: 'video' | 'raw' | 'image' = 'raw',
): Promise<UploadResult> {
  if (!hasCredentials) {
    // Fallback khi chạy dev không có Cloudinary credentials
    const simulatedId = `local_${Date.now()}`;
    return {
      secure_url: `https://res.cloudinary.com/demo/${resourceType}/upload/v1/${folder}/${simulatedId}`,
      public_id: `${folder}/${simulatedId}`,
      duration: resourceType === 'video' ? 300 : undefined,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Upload to Cloudinary failed'));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration ? Math.round(result.duration) : undefined,
          });
        }
      },
    );

    fs.createReadStream(filePath).pipe(uploadStream);
  });
}

export async function destroyFromCloudinary(
  publicId: string,
  resourceType: 'video' | 'raw' | 'image' = 'raw',
): Promise<void> {
  if (!hasCredentials || !publicId || publicId.startsWith('local_')) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    // Best-effort: chỉ log cảnh báo, không làm gián đoạn luồng chính
    console.warn(`[Cloudinary] Không thể xóa file ${publicId}:`, error);
  }
}
