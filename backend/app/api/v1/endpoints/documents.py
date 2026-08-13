from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.document import DocumentRead, DocumentVerifyRequest, HRDocumentType
from app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/employee/{employee_id}", response_model=list[DocumentRead])
async def list_employee_documents(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await DocumentService(db).list_for_employee(employee_id, current_user)
    await db.commit()
    return result


@router.post("/employee/{employee_id}", response_model=DocumentRead, status_code=201)
async def upload_document(
    employee_id: UUID,
    document_type: HRDocumentType = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await DocumentService(db).upload(employee_id, document_type, file, current_user)
    await db.commit()
    return result


@router.patch("/{document_id}/verify", response_model=DocumentRead)
async def verify_document(
    document_id: UUID,
    payload: DocumentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await DocumentService(db).verify(document_id, payload.status, payload.notes, current_user)
    await db.commit()
    return result


@router.get("/{document_id}/download")
async def download_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    document = await DocumentService(db).get_for_download(document_id, current_user)
    await db.commit()
    return FileResponse(
        path=document.file_path,
        filename=document.file_name,
        media_type=document.mime_type,
    )
