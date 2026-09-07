from fastapi import APIRouter, HTTPException, UploadFile
from models.avatar import AvatarStatus
from providers.local_cartoon import LocalCartoonProvider

router = APIRouter()
provider = LocalCartoonProvider()
@router.get("/status", response_model=AvatarStatus)
async def status(): return AvatarStatus(**await provider.get_status())
@router.post("/generate")
async def generate_avatar(image: UploadFile):
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}: raise HTTPException(415, "Use a JPG, PNG, or WEBP image.")
    payload = await image.read()
    if len(payload) > 10 * 1024 * 1024: raise HTTPException(413, "Use an image smaller than 10 MB.")
    try: return await provider.generate_avatar(payload)
    except Exception as error: raise HTTPException(422, "The image could not be processed.") from error
