import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID || 'f53cff4b45603bf96d8fa8384e36ad6f';
const R2_ENDPOINT = import.meta.env.VITE_R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || '';
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || '';

// S3 API Storage capability check (read/write/delete)
export const isR2StorageReady = Boolean(
  R2_ACCESS_KEY_ID &&
  R2_SECRET_ACCESS_KEY &&
  R2_BUCKET_NAME
);

// Cloudflare'in varsayılan *.r2.dev alan adları Türkiye'deki ISS'ler tarafından DNS seviyesinde engellidir.
// R2 genel CDN erişimi yalnızca Özel Alan Adı (Örn: cdn.makinam.com) tanımlandığında güvenle çalışır.
export const isR2Configured = Boolean(
  isR2StorageReady &&
  R2_PUBLIC_URL &&
  !R2_PUBLIC_URL.includes('.r2.dev')
);

// Lazy initialized S3 client for Cloudflare R2
let s3ClientInstance: S3Client | null = null;

function getR2Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3ClientInstance;
}

/**
 * Uploads an image file or blob to Cloudflare R2 storage.
 * @param file File or Blob to upload
 * @param customName Optional custom filename
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToR2(
  file: File | Blob,
  customName?: string
): Promise<string> {
  if (!isR2StorageReady) {
    console.warn(
      'Cloudflare R2 bilgileri henüz tanımlanmadı (.env dosyasını kontrol ediniz).'
    );
    throw new Error('R2_NOT_CONFIGURED');
  }

  const extension = file.type ? file.type.split('/')[1] || 'jpg' : 'jpg';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  const key = customName || `listings/${timestamp}_${randomStr}.${extension}`;

  const buffer = await file.arrayBuffer();
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: new Uint8Array(buffer),
    ContentType: file.type || 'image/jpeg',
  });

  await client.send(command);

  // Return formatted public image URL
  const baseUrl = R2_PUBLIC_URL.replace(/\/+$/, '');
  return `${baseUrl}/${key}`;
}

/**
 * Extracts R2 object key from an image URL or path.
 * Examples:
 * - "https://pub-d609fa2ec164418f852a2d10336b229b.r2.dev/listings/1793369527064_ibpey6v.jpeg" -> "listings/1793369527064_ibpey6v.jpeg"
 * - "https://cdn.makinam.com/listings/photo.jpg" -> "listings/photo.jpg"
 * - "listings/photo.jpg" -> "listings/photo.jpg"
 */
export function extractR2KeyFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  // Skip local base64, object URLs, and external stock placeholders
  if (url.startsWith('data:') || url.startsWith('blob:') || url.includes('unsplash.com')) {
    return null;
  }

  // Look for "listings/..." pattern
  const listingsIndex = url.indexOf('listings/');
  if (listingsIndex !== -1) {
    const rawKey = url.substring(listingsIndex);
    // Strip query parameters or hashes
    return rawKey.split('?')[0].split('#')[0];
  }

  return null;
}

/**
 * Deletes a single image from Cloudflare R2 bucket.
 * @param keyOrUrl The R2 object key or public URL
 */
export async function deleteImageFromR2(keyOrUrl: string): Promise<boolean> {
  const key = extractR2KeyFromUrl(keyOrUrl) || (keyOrUrl.startsWith('listings/') ? keyOrUrl : null);
  if (!key) {
    return false;
  }

  if (!isR2StorageReady) {
    console.warn('R2 kimlik bilgileri tanımlı değil, silme atlandı.');
    return false;
  }

  try {
    const client = getR2Client();
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await client.send(command);
    console.log(`[Cloudflare R2] Fotoğraf başarıyla silindi: ${key}`);
    return true;
  } catch (err) {
    console.warn(`[Cloudflare R2] Fotoğraf silinirken hata oluştu (${key}):`, err);
    return false;
  }
}

/**
 * Deletes multiple images from Cloudflare R2 bucket.
 * @param urls Array of image URLs or keys
 */
export async function deleteImagesFromR2(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) return;

  const deletePromises = urls
    .map((url) => deleteImageFromR2(url))
    .filter(Boolean);

  await Promise.allSettled(deletePromises);
}
