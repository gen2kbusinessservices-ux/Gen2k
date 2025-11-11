export async function compressImage(
  file: File,
  maxWidth: number,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

export async function uploadImage(
  file: File,
  bucket: string,
  path: string
): Promise<string> {
  const { supabase } = await import('./supabase');

  const thumbnail = await compressImage(file, 800, 0.7);
  const fullSize = await compressImage(file, 2400, 0.9);

  const thumbnailPath = `${path}_thumb.jpg`;
  const fullPath = `${path}.jpg`;

  const { error: thumbError } = await supabase.storage
    .from(bucket)
    .upload(thumbnailPath, thumbnail, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (thumbError) throw thumbError;

  const { error: fullError } = await supabase.storage
    .from(bucket)
    .upload(fullPath, fullSize, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (fullError) throw fullError;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fullPath);

  const { data: { publicUrl: thumbUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(thumbnailPath);

  return JSON.stringify({ url: publicUrl, thumbnail_url: thumbUrl });
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}
