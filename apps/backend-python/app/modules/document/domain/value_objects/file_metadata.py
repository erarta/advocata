"""
File Metadata Value Object

Метаданные файла документа (размер, тип, расширение).
"""
from typing import Optional
import mimetypes

from app.shared.domain.value_object import ValueObject
from app.shared.domain.result import Result


class FileMetadata(ValueObject):
    """
    Value Object для метаданных файла.

    Инкапсулирует информацию о физическом файле документа:
    размер, MIME-тип, расширение, оригинальное имя.
    """

    # Разрешенные MIME типы для юридических документов
    ALLOWED_MIME_TYPES = {
        # PDF
        "application/pdf",
        # Microsoft Word
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        # Microsoft Excel
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        # Images (для сканов)
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/tiff",
        "image/bmp",
        # Text
        "text/plain",
        # RTF
        "application/rtf",
        "text/rtf",
    }

    # Максимальный размер файла (100 MB)
    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB в байтах

    # Минимальный размер файла (1 KB)
    MIN_FILE_SIZE = 1024  # 1 KB

    def __init__(
        self,
        file_size: int,
        mime_type: str,
        original_filename: str,
        file_extension: Optional[str] = None,
    ):
        """
        Создает экземпляр метаданных файла.

        Args:
            file_size: Размер файла в байтах
            mime_type: MIME-тип файла
            original_filename: Оригинальное имя файла
            file_extension: Расширение файла (опционально, извлекается автоматически)
        """
        self._file_size = file_size
        self._mime_type = mime_type
        self._original_filename = original_filename
        self._file_extension = file_extension or self._extract_extension(original_filename)

    @classmethod
    def create(
        cls,
        file_size: int,
        mime_type: str,
        original_filename: str,
        file_extension: Optional[str] = None,
    ) -> Result["FileMetadata"]:
        """
        Создает экземпляр метаданных файла с валидацией.

        Args:
            file_size: Размер файла в байтах
            mime_type: MIME-тип файла
            original_filename: Оригинальное имя файла
            file_extension: Расширение файла (опционально)

        Returns:
            Result с FileMetadata или ошибкой
        """
        # Валидация размера файла
        if file_size < cls.MIN_FILE_SIZE:
            return Result.fail(
                f"File size is too small: {file_size} bytes. "
                f"Minimum size: {cls.MIN_FILE_SIZE} bytes (1 KB)"
            )

        if file_size > cls.MAX_FILE_SIZE:
            max_mb = cls.MAX_FILE_SIZE / (1024 * 1024)
            current_mb = file_size / (1024 * 1024)
            return Result.fail(
                f"File size exceeds limit: {current_mb:.2f} MB. "
                f"Maximum allowed: {max_mb:.0f} MB"
            )

        # Валидация MIME типа
        if mime_type not in cls.ALLOWED_MIME_TYPES:
            return Result.fail(
                f"File type not allowed: {mime_type}. "
                f"Allowed types: PDF, DOCX, DOC, XLSX, XLS, JPG, PNG, TIFF, TXT, RTF"
            )

        # Валидация имени файла
        if not original_filename or len(original_filename.strip()) == 0:
            return Result.fail("Original filename cannot be empty")

        if len(original_filename) > 255:
            return Result.fail(
                f"Filename too long: {len(original_filename)} characters. "
                "Maximum: 255 characters"
            )

        return Result.ok(
            cls(
                file_size=file_size,
                mime_type=mime_type,
                original_filename=original_filename,
                file_extension=file_extension,
            )
        )

    @staticmethod
    def _extract_extension(filename: str) -> str:
        """
        Извлекает расширение файла из имени.

        Args:
            filename: Имя файла

        Returns:
            Расширение файла (например, '.pdf', '.docx')
        """
        if "." in filename:
            return filename.rsplit(".", 1)[-1].lower()
        return ""

    @property
    def file_size(self) -> int:
        """Возвращает размер файла в байтах"""
        return self._file_size

    @property
    def mime_type(self) -> str:
        """Возвращает MIME-тип файла"""
        return self._mime_type

    @property
    def original_filename(self) -> str:
        """Возвращает оригинальное имя файла"""
        return self._original_filename

    @property
    def file_extension(self) -> str:
        """Возвращает расширение файла"""
        return self._file_extension

    @property
    def file_size_mb(self) -> float:
        """Возвращает размер файла в мегабайтах"""
        return round(self._file_size / (1024 * 1024), 2)

    @property
    def file_size_kb(self) -> float:
        """Возвращает размер файла в килобайтах"""
        return round(self._file_size / 1024, 2)

    @property
    def file_size_human(self) -> str:
        """Возвращает размер файла в человекочитаемом формате"""
        if self._file_size < 1024:
            return f"{self._file_size} B"
        elif self._file_size < 1024 * 1024:
            return f"{self.file_size_kb} KB"
        else:
            return f"{self.file_size_mb} MB"

    @property
    def is_pdf(self) -> bool:
        """Проверяет, является ли файл PDF"""
        return self._mime_type == "application/pdf"

    @property
    def is_word_document(self) -> bool:
        """Проверяет, является ли файл документом Word"""
        return self._mime_type in {
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }

    @property
    def is_excel_document(self) -> bool:
        """Проверяет, является ли файл документом Excel"""
        return self._mime_type in {
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }

    @property
    def is_image(self) -> bool:
        """Проверяет, является ли файл изображением"""
        return self._mime_type.startswith("image/")

    @property
    def is_text(self) -> bool:
        """Проверяет, является ли файл текстовым документом"""
        return self._mime_type in {"text/plain", "application/rtf", "text/rtf"}

    @property
    def needs_ocr(self) -> bool:
        """
        Проверяет, требуется ли OCR для извлечения текста.

        OCR требуется для изображений (сканов документов).
        """
        return self.is_image

    @property
    def can_extract_text(self) -> bool:
        """Проверяет, можно ли извлечь текст из файла"""
        return self.is_pdf or self.is_word_document or self.is_text or self.is_image

    def _get_equality_components(self) -> tuple:
        """Возвращает компоненты для сравнения"""
        return (
            self._file_size,
            self._mime_type,
            self._original_filename,
            self._file_extension,
        )

    def __str__(self) -> str:
        """Строковое представление"""
        return f"{self._original_filename} ({self.file_size_human})"

    def __repr__(self) -> str:
        """Представление для отладки"""
        return (
            f"FileMetadata(filename={self._original_filename}, "
            f"size={self.file_size_human}, type={self._mime_type})"
        )
