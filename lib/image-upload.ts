/**
 * Client-side photo processing for admin image uploads (product photos,
 * hero slides). Runs entirely in the browser before anything touches the
 * network, so it works the same on Android, iPhone, and Windows/desktop:
 *
 * 1. Decodes whatever the device handed us — including iPhone photos saved
 *    as HEIC/HEIF, which most non-Apple browsers can't display at all.
 *    (iOS itself can decode HEIC regardless of browser, since every iOS
 *    browser runs on WebKit — so this step "just works" there.)
 * 2. Re-encodes to a normal JPEG, so every device can view it later
 *    regardless of what took the original photo.
 * 3. Downscales to a sane max dimension — phone camera photos are commonly
 *    3000-4000px wide / several MB; nothing on this site needs more than
 *    ~1600px, and every extra pixel is bandwidth someone pays for.
 * 4. Hands back an instant local preview URL alongside the processed file,
 *    so the admin sees the photo immediately instead of staring at a
 *    spinner until the upload round-trip finishes.
 */

export interface ProcessedImage {
  /** Re-encoded, resized JPEG ready to upload. */
  blob: Blob;
  /** Suggested filename (always .jpg, since we always re-encode to JPEG). */
  filename: string;
  /** Local object URL for an instant <img>/<Image> preview. Call
   * URL.revokeObjectURL(previewUrl) once it's no longer needed. */
  previewUrl: string;
  width: number;
  height: number;
}

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

/** Decodes a File into something <canvas> can draw, trying the fast/modern
 * path first and falling back to an <img> element for older browsers or
 * formats createImageBitmap chokes on. */
async function decodeToDrawable(
  file: File
): Promise<{ source: CanvasImageSource; width: number; height: number; cleanup?: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close() };
    } catch {
      // Fall through to the <img> path below.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read this image file."));
      el.src = objectUrl;
    });
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, cleanup: () => URL.revokeObjectURL(objectUrl) };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

/** Resize + re-encode an image file selected from any device into a
 * compact, universally-viewable JPEG, with an instant local preview URL. */
export async function processImageForUpload(file: File): Promise<ProcessedImage> {
  const { source, width, height, cleanup } = await decodeToDrawable(file);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const outW = Math.round(width * scale);
  const outH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can't process images.");
  ctx.drawImage(source, 0, 0, outW, outH);
  cleanup?.();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  if (!blob) throw new Error("Could not process this image.");

  return {
    blob,
    filename: `${Date.now()}.jpg`,
    previewUrl: URL.createObjectURL(blob),
    width: outW,
    height: outH,
  };
}
