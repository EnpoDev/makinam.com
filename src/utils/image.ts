/**
 * Compresses an image file before upload.
 */
export async function compressImage(file: File, maxWidth = 1200, maxHeight = 900, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        resolve(e.target?.result as string);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image and returns a Blob for cloud storage upload (e.g. Cloudflare R2 / S3).
 */
export async function compressImageToBlob(file: File, maxWidth = 1600, maxHeight = 1200, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        resolve(file);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export const DEFAULT_MACHINE_IMAGE =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 450' width='100%25' height='100%25'%3E%3Crect width='600' height='450' fill='%23f8fafc'/%3E%3Crect x='8' y='8' width='584' height='434' rx='8' fill='none' stroke='%23e2e8f0' stroke-width='2' stroke-dasharray='6 6'/%3E%3Cg transform='translate(260, 150)' fill='none' stroke='%2394a3b8' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='4' y='14' width='72' height='52' rx='6' stroke='%23ea580c' fill='%23fff7ed' stroke-width='3'/%3E%3Ccircle cx='40' cy='40' r='16' stroke='%23ea580c' stroke-width='3'/%3E%3Cpath d='M26 14 L32 6 L48 6 L54 14' stroke='%23ea580c' stroke-width='3'/%3E%3C/g%3E%3Ctext x='300' y='265' font-family='system-ui, -apple-system, sans-serif' font-size='16' font-weight='700' fill='%23334155' text-anchor='middle'%3EMAKINAM.COM%3C/text%3E%3Ctext x='300' y='290' font-family='system-ui, -apple-system, sans-serif' font-size='13' font-weight='500' fill='%2394a3b8' text-anchor='middle'%3EFotoğraf Yükleniyor / Önizleme%3C/text%3E%3C/svg%3E";

/**
 * Fallback handler when an image fails to load (e.g. DNS ERR_NAME_NOT_RESOLVED, 404)
 */
export function handleImageFallback(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  if (e.currentTarget.src !== DEFAULT_MACHINE_IMAGE) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = DEFAULT_MACHINE_IMAGE;
  }
}
