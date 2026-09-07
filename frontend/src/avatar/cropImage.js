import { loadImage } from './imageValidation';
export async function createAvatarPreview(sourceUrl, zoom = 1) {
  const image = await loadImage(sourceUrl); const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512; const context = canvas.getContext('2d', { willReadFrequently: true }); context.fillStyle = '#dcecf4'; context.fillRect(0, 0, 512, 512);
  const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / zoom; const sourceX = (image.naturalWidth - cropSize) / 2; const sourceY = (image.naturalHeight - cropSize) / 2; context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, 512, 512);
  const pixels = context.getImageData(0, 0, 512, 512); for (let index = 0; index < pixels.data.length; index += 4) { pixels.data[index] = Math.round(pixels.data[index] / 32) * 32; pixels.data[index + 1] = Math.round(pixels.data[index + 1] / 32) * 32; pixels.data[index + 2] = Math.round(pixels.data[index + 2] / 32) * 32; } context.putImageData(pixels, 0, 0); return canvas.toDataURL('image/jpeg', 0.86);
}

export async function generateAvatar(file, sourceUrl, zoom) {
  const api = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  if (api && file) {
    try { const form = new FormData(); form.append('image', file); const response = await fetch(`${api}/api/avatar/generate`, { method: 'POST', body: form }); if (response.ok) return (await response.json()).image_url; } catch { /* The app stays usable without a local API. */ }
  }
  return createAvatarPreview(sourceUrl, zoom);
}
