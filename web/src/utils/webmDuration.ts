// @ts-ignore
import ysFixWebmDuration from 'fix-webm-duration';

/**
 * Patches the EBML metadata header in a WebM recording with the actual duration in milliseconds.
 * This makes the downloaded video 100% seekable (adelantar / retrasar) in all video players,
 * fixing Chrome's default behavior of omitting WebM duration / cues.
 */
export async function fixWebmDuration(blob: Blob, durationMs: number): Promise<Blob> {
  if (durationMs <= 0) return blob;
  return new Promise((resolve) => {
    try {
      ysFixWebmDuration(blob, durationMs, (fixedBlob: Blob) => {
        resolve(fixedBlob || blob);
      });
    } catch (err) {
      console.warn('Could not fix webm duration, returning original blob', err);
      resolve(blob);
    }
  });
}
