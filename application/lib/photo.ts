/** Long side of the image sent to the read route: enough to read a menu, small enough to upload fast. */
export const PHOTO_MAX_SIDE = 1280;
const JPEG_QUALITY = 0.8;

/** Size that fits in `max` on the long side, same ratio, never enlarged. */
export function fitWithin(width: number, height: number, max: number) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

type Decoded = { source: CanvasImageSource; width: number; height: number; close(): void };

/** An <img> loaded from the file: the last resort, slower but decodes what the browser can show. */
function loadImage(file: Blob): Promise<Decoded> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) });
    img.onerror = () => (URL.revokeObjectURL(url), reject(new Error("undecodable image")));
    img.src = url;
  });
}

const fromBitmap = (bitmap: ImageBitmap): Decoded => ({ source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() });

/**
 * Decodes with the EXIF orientation applied. Some Safari versions reject the `imageOrientation` option: then without
 * it (current browsers apply EXIF by default), then through an <img>.
 */
async function decode(file: Blob): Promise<Decoded> {
  try {
    return fromBitmap(await createImageBitmap(file, { imageOrientation: "from-image" }));
  } catch {
    try {
      return fromBitmap(await createImageBitmap(file));
    } catch {
      return loadImage(file);
    }
  }
}

/** Phone photo -> JPEG, ~1280px long side. Falls back to the original file only if the browser cannot decode it at all. */
export async function downscale(file: Blob, max = PHOTO_MAX_SIDE): Promise<Blob> {
  try {
    const image = await decode(file);
    const { width, height } = fitWithin(image.width, image.height, max);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(image.source, 0, 0, width, height);
    image.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    return blob ?? file;
  } catch {
    return file;
  }
}
