from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from models.document import DocumentAnalysisResponse
from services.document_service import document_service

router = APIRouter(prefix="/api/documents", tags=["Document Analysis"])

@router.post("/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document(
    file: UploadFile = File(...),
    user_id: str = Form("anonymous"),
    document_type: str = Form("visa")
):
    """
    Upload and analyze PDF document.
    Extracts text, uploads to Firebase Storage, and provides AI-powered analysis
    with summary, key points, dates, and simplified explanation.
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read file content
        file_content = await file.read()
        
        # Analyze document
        analysis = await document_service.analyze_document(
            file_content=file_content,
            filename=file.filename,
            user_id=user_id,
            document_type=document_type
        )
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
