class CartoonAvatarGenerator:
    def __init__(self, provider): self.provider = provider
    async def generate(self, image_bytes: bytes): return await self.provider.generate_avatar(image_bytes)
