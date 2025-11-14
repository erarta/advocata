"""Commands and Handlers exports"""
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

__all__ = [
    "UploadDocumentCommand",
    "UploadDocumentHandler",
    "UpdateDocumentMetadataCommand",
    "UpdateDocumentMetadataHandler",
    "DeleteDocumentCommand",
    "DeleteDocumentHandler",
]
