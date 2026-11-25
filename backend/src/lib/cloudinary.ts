import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { env } from '../config/env';

const cloudName = env.CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;

const hasCredentials = Boolean(cloudName && apiKey && apiSecret);

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export interface UploadResult {
  secure_url: string;
  public_id: string;
  duration?: number | undefined;
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
  if (!hasCredentials) {
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    if (result && result.result !== 'ok') {
      console.warn(
        `[Cloudinary] destroy non-ok response: publicId="${publicId}", resourceType="${resourceType}", result=`,
        result,
      );
    }
  } catch (error) {
    console.error(
      `[Cloudinary] destroy failed: publicId="${publicId}", resourceType="${resourceType}", error=`,
      error,
    );
  }
}
