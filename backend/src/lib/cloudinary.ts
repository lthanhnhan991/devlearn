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

export type CloudinaryResourceType = 'video' | 'raw' | 'image';

export interface UploadResult {
  secure_url: string;
  public_id: string;
  duration?: number | undefined;
}

/**
 * Xác định resource_type thực tế trên Cloudinary dựa vào URL lưu trong DB,
 * fallback về contentType nếu không nhận diện được từ URL.
 */
export function resolveCloudinaryResourceType(
  fileUrl?: string | null,
  contentType?: string | null,
): CloudinaryResourceType {
  if (fileUrl) {
    if (fileUrl.includes('/video/upload/')) return 'video';
    if (fileUrl.includes('/image/upload/')) return 'image';
    if (fileUrl.includes('/raw/upload/')) return 'raw';
  }
  return contentType === 'VIDEO' ? 'video' : 'image';
}

export async function uploadToCloudinary(
  filePath: string,
  folder: string,
  resourceType: CloudinaryResourceType = 'image',
  format?: string,
): Promise<UploadResult> {
  if (!hasCredentials) {
    // Fallback khi chạy dev không có Cloudinary credentials
    const simulatedId = `local_${Date.now()}`;
    const ext = format ? `.${format}` : resourceType === 'video' ? '.mp4' : '';
    return {
      secure_url: `https://res.cloudinary.com/demo/${resourceType}/upload/v1/${folder}/${simulatedId}${ext}`,
      public_id: `${folder}/${simulatedId}`,
      duration: resourceType === 'video' ? 300 : undefined,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: {
      folder: string;
      resource_type: CloudinaryResourceType;
      use_filename: boolean;
      unique_filename: boolean;
      format?: string;
    } = {
      folder,
      resource_type: resourceType,
      use_filename: false,
      unique_filename: true,
    };
    if (format !== undefined) {
      uploadOptions.format = format;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
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
  resourceType: CloudinaryResourceType = 'image',
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
