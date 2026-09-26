/** Long side of the image sent to the read route: enough to read a menu, small enough to upload fast. */
export const PHOTO_MAX_SIDE = 1280;
const JPEG_QUALITY = 0.8;

/** Size that fits in `max` on the long side, same ratio, never enlarged. */
export function fitWithin(width: number, height: number, max: number) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** Phone photo -> JPEG, ~1280px long side. Falls back to the original file if the browser can't decode it. */
export async function downscale(file: Blob, max = PHOTO_MAX_SIDE): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = fitWithin(bitmap.width, bitmap.height, max);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    return blob ?? file;
  } catch {
    return file;
  }
}
