import base64
import io
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from providers.base import CartoonProvider

class LocalCartoonProvider(CartoonProvider):
    async def generate_avatar(self, image_bytes: bytes):
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image.thumbnail((512, 512))
        side = min(image.size)
        left, top = (image.width - side) // 2, (image.height - side) // 2
        image = image.crop((left, top, left + side, top + side)).resize((512, 512))
        image = ImageEnhance.Color(image).enhance(1.2)
        image = ImageEnhance.Contrast(image).enhance(1.12)
        image = ImageOps.posterize(image, 5).filter(ImageFilter.SMOOTH_MORE)
        output = io.BytesIO(); image.save(output, 'JPEG', quality=86)
        return {"image_url": "data:image/jpeg;base64," + base64.b64encode(output.getvalue()).decode(), "provider": "local-cartoon"}
    async def get_status(self): return {"status": "ready", "provider": "local-cartoon"}
    async def cancel_job(self, job_id: str): return {"cancelled": True}
