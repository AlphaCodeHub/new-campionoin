class ImageProcessor:
    """Provider-independent image preparation seam for a future crop/normalize pipeline."""
    async def prepare(self, image_bytes: bytes) -> bytes: return image_bytes
