"""Queries and Handlers exports"""
from app.modules.document.application.queries.get_document_by_id_query import (
    GetDocumentByIdQuery,
)
from app.modules.document.application.queries.get_document_by_id_handler import (
    GetDocumentByIdHandler,
)
from app.modules.document.application.queries.search_documents_query import (
    SearchDocumentsQuery,
)
from app.modules.document.application.queries.search_documents_handler import (
    SearchDocumentsHandler,
)
from app.modules.document.application.queries.get_documents_by_owner_query import (
    GetDocumentsByOwnerQuery,
)
from app.modules.document.application.queries.get_documents_by_owner_handler import (
    GetDocumentsByOwnerHandler,
)

__all__ = [
    "GetDocumentByIdQuery",
    "GetDocumentByIdHandler",
    "SearchDocumentsQuery",
    "SearchDocumentsHandler",
    "GetDocumentsByOwnerQuery",
    "GetDocumentsByOwnerHandler",
]
