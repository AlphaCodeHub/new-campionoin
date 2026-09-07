from pydantic import BaseModel
class AvatarStatus(BaseModel): status: str; provider: str
class AvatarAsset(BaseModel): id: str; image_url: str; provider: str
