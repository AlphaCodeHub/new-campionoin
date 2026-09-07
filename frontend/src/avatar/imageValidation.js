const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 10 * 1024 * 1024;
const MIN_DIMENSION = 160;
const MAX_DIMENSION = 8000;
export async function inspectImage(file) {
  if (!TYPES.has(file.type)) return { error: 'Choose a JPG, PNG, or WEBP image.' };
  if (file.size > MAX_BYTES) return { error: 'Choose an image smaller than 10 MB.' };
  const url = URL.createObjectURL(file);
  try { const image = await loadImage(url); if (image.naturalWidth < MIN_DIMENSION || image.naturalHeight < MIN_DIMENSION) return { error: 'Choose an image at least 160 × 160 pixels.' }; if (image.naturalWidth > MAX_DIMENSION || image.naturalHeight > MAX_DIMENSION) return { error: 'Choose an image no larger than 8000 pixels on either side.' }; return { url, width: image.naturalWidth, height: image.naturalHeight, warning: file.type === 'image/png' ? 'Transparent areas will use a soft background in the avatar.' : '' }; } catch { URL.revokeObjectURL(url); return { error: 'We could not read that image. Please try another file.' }; }
}
export function loadImage(url) { return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = url; }); }
