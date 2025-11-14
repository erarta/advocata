"""
Document Router

FastAPI роутер для работы с документами.
"""
from typing import Annotated, List, Optional
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
    Form,
    Query,
    HTTPException,
    status,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import io

from app.core.infrastructure.database import get_db
from app.modules.identity.application.dtos.user_dto import UserDTO
from app.modules.identity.presentation.dependencies import get_current_user
from app.modules.document.presentation.schemas.requests import (
    UploadDocumentRequest,
    UpdateDocumentMetadataRequest,
)
from app.modules.document.presentation.schemas.responses import (
    DocumentResponse,
    DocumentSearchResponse,
)
from app.modules.document.application.commands.upload_document_command import (
    UploadDocumentCommand,
)
from app.modules.document.application.commands.upload_document_handler import (
    UploadDocumentHandler,
)
from app.modules.document.application.commands.update_document_metadata_command import (
    UpdateDocumentMetadataCommand,
)
from app.modules.document.application.commands.update_document_metadata_handler import (
    UpdateDocumentMetadataHandler,
)
from app.modules.document.application.commands.delete_document_command import (
    DeleteDocumentCommand,
)
from app.modules.document.application.commands.delete_document_handler import (
    DeleteDocumentHandler,
)
from app.modules.document.application.queries.get_document_by_id_query import (
    GetDocumentByIdQuery,
)
from app.modules.document.application.queries.get_document_by_id_handler import (
    GetDocumentByIdHandler,
)
from app.modules.document.application.queries.get_documents_by_owner_query import (
    GetDocumentsByOwnerQuery,
)
from app.modules.document.application.queries.get_documents_by_owner_handler import (
    GetDocumentsByOwnerHandler,
)
from app.modules.document.application.queries.search_documents_query import (
    SearchDocumentsQuery,
)
from app.modules.document.application.queries.search_documents_handler import (
    SearchDocumentsHandler,
)
from app.modules.document.infrastructure.persistence.repositories.document_repository_impl import (
    DocumentRepositoryImpl,
)
from app.modules.document.infrastructure.storage.storage_service import StorageService


router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    document_type: Annotated[str, Form(...)],
    category: Annotated[str, Form(...)],
    title: Annotated[str, Form(...)],
    file: Annotated[UploadFile, File(...)],
    description: Annotated[Optional[str], Form(None)] = None,
    consultation_id: Annotated[Optional[str], Form(None)] = None,
    tags: Annotated[Optional[List[str]], Form(None)] = None,
    current_user: Annotated[UserDTO, Depends(get_current_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
) -> DocumentResponse:
    """
    Загрузить новый документ.

    **Требуется аутентификация.**

    Поддерживаемые форматы:
    - PDF (.pdf)
    - Word (.doc, .docx)
    - Excel (.xls, .xlsx)
    - Изображения (.jpg, .png, .tiff) - с автоматическим OCR
    - Текст (.txt, .rtf)

    Размер файла: от 1 KB до 100 MB.

    Args:
        document_type: Тип документа (contract, court_decision, etc.)
        category: Категория документа (auto_accidents, criminal, etc.)
        title: Название документа
        file: Файл для загрузки
        description: Описание документа (опционально)
        consultation_id: ID консультации (опционально)
        tags: Теги для поиска (опционально)
        current_user: Текущий пользователь
        db: Сессия БД

    Returns:
        DocumentResponse с информацией о загруженном документе

    Raises:
        400: Невалидные параметры или файл
        413: Файл слишком большой
        415: Неподдерживаемый формат файла
    """
    # Читаем содержимое файла
    file_content = await file.read()
    file_size = len(file_content)

    # Определяем MIME-тип
    mime_type = file.content_type or "application/octet-stream"

    # Создаем команду
    command = UploadDocumentCommand(
        owner_id=current_user.id,
        document_type=document_type,
        category=category,
        file_content=file_content,
        file_size=file_size,
        mime_type=mime_type,
        original_filename=file.filename,
        title=title,
        description=description,
        consultation_id=consultation_id,
        tags=tags,
    )

    # Создаем handler
    document_repository = DocumentRepositoryImpl(db)
    storage_service = StorageService()
    handler = UploadDocumentHandler(document_repository, storage_service)

    # Выполняем команду
    result = await handler.handle(command)

    if not result.is_success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return DocumentResponse.from_dto(result.value)


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: Annotated[UserDTO, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DocumentResponse:
    """
    Получить документ по ID.

    **Требуется аутентификация.**

    Возвращает полную информацию о документе, включая извлеченный текст
    (если документ был обработан).

    Args:
        document_id: ID документа
        current_user: Текущий пользователь
        db: Сессия БД

    Returns:
        DocumentResponse с полной информацией о документе

    Raises:
        404: Документ не найден
        403: Нет доступа к документу
    """
    query = GetDocumentByIdQuery(
        document_id=document_id,
        owner_id=current_user.id,
    )

    document_repository = DocumentRepositoryImpl(db)
    handler = GetDocumentByIdHandler(document_repository)

    result = await handler.handle(query)

    if not result.is_success:
        if "not found" in result.error.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.error,
            )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=result.error,
        )

    return DocumentResponse.from_dto(result.value)


@router.get("", response_model=DocumentSearchResponse)
async def get_documents(
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
    current_user: Annotated[UserDTO, Depends(get_current_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
) -> DocumentSearchResponse:
    """
    Получить все документы текущего пользователя.

    **Требуется аутентификация.**

    Возвращает список всех документов пользователя с пагинацией,
    отсортированных по дате создания (от новых к старым).

    Args:
        limit: Количество результатов (1-100)
        offset: Смещение для пагинации
        current_user: Текущий пользователь
        db: Сессия БД

    Returns:
        DocumentSearchResponse со списком документов и пагинацией
    """
    query = GetDocumentsByOwnerQuery(
        owner_id=current_user.id,
        limit=limit,
        offset=offset,
    )

    document_repository = DocumentRepositoryImpl(db)
    handler = GetDocumentsByOwnerHandler(document_repository)

    result = await handler.handle(query)

    if not result.is_success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return DocumentSearchResponse.from_dto(result.value)


@router.get("/search", response_model=DocumentSearchResponse)
async def search_documents(
    document_types: Annotated[Optional[List[str]], Query(None)] = None,
    categories: Annotated[Optional[List[str]], Query(None)] = None,
    statuses: Annotated[Optional[List[str]], Query(None)] = None,
    q: Annotated[Optional[str], Query(None, max_length=200)] = None,
    tags: Annotated[Optional[List[str]], Query(None)] = None,
    consultation_id: Annotated[Optional[str], Query(None)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
    current_user: Annotated[UserDTO, Depends(get_current_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
) -> DocumentSearchResponse:
    """
    Поиск документов с фильтрами.

    **Требуется аутентификация.**

    Поддерживает множественные фильтры:
    - По типам документов (OR логика)
    - По категориям (OR логика)
    - По статусам обработки (OR логика)
    - По тегам (OR логика)
    - По консультации
    - Текстовый поиск по названию, описанию и извлеченному тексту

    Args:
        document_types: Типы документов для фильтрации
        categories: Категории для фильтрации
        statuses: Статусы для фильтрации
        q: Текстовый запрос для поиска
        tags: Теги для фильтрации
        consultation_id: ID консультации
        limit: Количество результатов (1-100)
        offset: Смещение для пагинации
        current_user: Текущий пользователь
        db: Сессия БД

    Returns:
        DocumentSearchResponse с результатами поиска
    """
    query = SearchDocumentsQuery(
        owner_id=current_user.id,
        document_types=document_types,
        categories=categories,
        statuses=statuses,
        query=q,
        tags=tags,
        consultation_id=consultation_id,
        limit=limit,
        offset=offset,
    )

    document_repository = DocumentRepositoryImpl(db)
    handler = SearchDocumentsHandler(document_repository)

    result = await handler.handle(query)

    if not result.is_success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return DocumentSearchResponse.from_dto(result.value)


@router.patch("/{document_id}", response_model=DocumentResponse)
async def update_document_metadata(
    document_id: str,
    request: UpdateDocumentMetadataRequest,
    current_user: Annotated[UserDTO, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DocumentResponse:
    """
    Обновить метаданные документа.

    **Требуется аутентификация.**

    Позволяет обновить название, описание и теги документа.
    Сам файл обновить нельзя.

    Args:
        document_id: ID документа
        request: Данные для обновления
        current_user: Текущий пользователь
        db: Сессия БД

    Returns:
        DocumentResponse с обновленными данными

    Raises:
        404: Документ не найден
        403: Нет доступа к документу
        400: Невалидные данные
    """
    command = UpdateDocumentMetadataCommand(
        document_id=document_id,
        owner_id=current_user.id,
        title=request.title,
        description=request.description,
        tags=request.tags,
    )

    document_repository = DocumentRepositoryImpl(db)
    handler = UpdateDocumentMetadataHandler(document_repository)

    result = await handler.handle(command)

    if not result.is_success:
        if "not found" in result.error.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.error,
            )
        elif "access denied" in result.error.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=result.error,
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return DocumentResponse.from_dto(result.value)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_user: Annotated[UserDTO, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """
    Удалить документ.

    **Требуется аутентификация.**

    Помечает документ на удаление (soft delete).
    Физическое удаление файла из S3 происходит асинхронно.

    Args:
        document_id: ID документа
        current_user: Текущий пользователь
        db: Сессия БД

    Raises:
        404: Документ не найден
        403: Нет доступа к документу
        400: Документ нельзя удалить (например, в процессе обработки)
    """
    command = DeleteDocumentCommand(
        document_id=document_id,
        owner_id=current_user.id,
    )

    document_repository = DocumentRepositoryImpl(db)
    handler = DeleteDocumentHandler(document_repository)

    result = await handler.handle(command)

    if not result.is_success:
        if "not found" in result.error.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.error,
            )
        elif "access denied" in result.error.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=result.error,
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )


@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    current_user: Annotated[UserDTO, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> StreamingResponse:
    """
    Скачать файл документа.

    **Требуется аутентификация.**

    Возвращает файл документа для скачивания.

    Args:
        document_id: ID документа
        current_user: Текущий пользователь
        db: Сессия БД

    Returns:
        StreamingResponse с файлом

    Raises:
        404: Документ или файл не найден
        403: Нет доступа к документу
    """
    # Получаем документ
    query = GetDocumentByIdQuery(
        document_id=document_id,
        owner_id=current_user.id,
    )

    document_repository = DocumentRepositoryImpl(db)
    handler = GetDocumentByIdHandler(document_repository)

    result = await handler.handle(query)

    if not result.is_success:
        if "not found" in result.error.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.error,
            )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=result.error,
        )

    document_dto = result.value

    # Скачиваем файл из S3
    storage_service = StorageService()
    download_result = await storage_service.download_file(document_dto.storage_path)

    if not download_result.is_success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File not found in storage: {download_result.error}",
        )

    file_content = download_result.value

    # Возвращаем файл
    return StreamingResponse(
        io.BytesIO(file_content),
        media_type=document_dto.mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{document_dto.original_filename}"'
        },
    )
