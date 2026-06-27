from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.openai_service import openai_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        history = [{"role": m.role, "content": m.content} for m in request.history] if request.history else []
        response = await openai_service.get_chat_response(request.message, history)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
