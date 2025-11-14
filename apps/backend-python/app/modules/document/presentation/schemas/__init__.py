"""Presentation Schemas exports"""
from app.modules.document.presentation.schemas.requests import (
    UploadDocumentRequest,
    UpdateDocumentMetadataRequest,
)
from app.modules.document.presentation.schemas.responses import (
    DocumentResponse,
    DocumentListItemResponse,
    DocumentSearchResponse,
)

__all__ = [
    "UploadDocumentRequest",
    "UpdateDocumentMetadataRequest",
    "DocumentResponse",
    "DocumentListItemResponse",
    "DocumentSearchResponse",
]
