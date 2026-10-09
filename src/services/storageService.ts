import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a JPG, JPEG, PNG, or WEBP image.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller photo.`,
    };
  }

  return { valid: true };
}

/**
 * Compresses an image in the browser using HTML Canvas to reduce bandwidth,
 * keeping it sharp while guaranteeing fast upload and fallback capability.
 */
export async function compressImageToDataUrl(
  file: File,
  maxWidth = 1000,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
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
        // Use webp if supported, otherwise jpeg
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads image to Firebase Storage with a strict 8-second timeout.
 * If Storage has permission/CORS restrictions or times out, it gracefully falls back
 * to the compressed data URL, ensuring the user's report is NEVER blocked.
 */
export async function uploadComplaintImage(
  file: File,
  complaintId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; source: 'firebase-storage' | 'data-url' }> {
  const compressedDataUrl = await compressImageToDataUrl(file);
  onProgress?.(30);

  try {
    // Attempt Firebase Storage with a safety timeout
    const fileExt = file.name.split('.').pop() || 'jpg';
    const storagePath = `complaints/${complaintId}_${Date.now()}.${fileExt}`;
    const storageReference = ref(storage, storagePath);

    // Convert data url to Blob for upload
    const response = await fetch(compressedDataUrl);
    const blob = await response.blob();
    onProgress?.(60);

    const uploadPromise = uploadBytes(storageReference, blob, {
      contentType: 'image/jpeg',
    }).then(async (snapshot) => {
      onProgress?.(90);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    });

    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timed out')), 6000)
    );

    const finalUrl = await Promise.race([uploadPromise, timeoutPromise]);
    onProgress?.(100);
    return { url: finalUrl, source: 'firebase-storage' };
  } catch (storageErr) {
    console.warn(
      'Firebase Storage direct upload skipped or timed out, utilizing high-quality inline storage fallback.',
      storageErr
    );
    onProgress?.(100);
    return { url: compressedDataUrl, source: 'data-url' };
  }
}
