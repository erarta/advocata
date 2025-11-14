"""
Document Validation Service

Доменный сервис для валидации документов.
"""
from typing import List
import re

from app.shared.domain.result import Result
from app.modules.document.domain.value_objects.file_metadata import FileMetadata


class DocumentValidationService:
    """
    Доменный сервис для валидации документов.

    Содержит сложную бизнес-логику валидации, которая не относится
    к конкретной сущности.

    Business Rules:
    1. Проверка расширения файла
    2. Проверка на запрещенные символы в имени
    3. Проверка на потенциально опасные файлы
    4. Проверка на дубликаты
    """

    # Запрещенные расширения файлов (исполняемые файлы, скрипты)
    FORBIDDEN_EXTENSIONS = {
        "exe",
        "bat",
        "cmd",
        "sh",
        "ps1",
        "vbs",
        "js",
        "jar",
        "app",
        "dmg",
        "deb",
        "rpm",
        "msi",
        "apk",
        "com",
        "dll",
        "so",
        "dylib",
    }

    # Запрещенные символы в имени файла
    FORBIDDEN_FILENAME_CHARS = r'[<>:"/\\|?*\x00-\x1f]'

    # Максимальная длина имени файла
    MAX_FILENAME_LENGTH = 255

    @classmethod
    def validate_file_metadata(cls, file_metadata: FileMetadata) -> Result[None]:
        """
        Валидирует метаданные файла.

        Args:
            file_metadata: Метаданные файла для проверки

        Returns:
            Result с успехом или ошибкой
        """
        # Проверка расширения
        extension_result = cls.validate_file_extension(file_metadata.file_extension)
        if not extension_result.is_success:
            return extension_result

        # Проверка имени файла
        filename_result = cls.validate_filename(file_metadata.original_filename)
        if not filename_result.is_success:
            return filename_result

        return Result.ok()

    @classmethod
    def validate_file_extension(cls, extension: str) -> Result[None]:
        """
        Проверяет, что расширение файла разрешено.

        Args:
            extension: Расширение файла (например, 'pdf', 'docx')

        Returns:
            Result с успехом или ошибкой
        """
        if not extension:
            return Result.fail("File extension is missing")

        extension_lower = extension.lower().lstrip(".")

        if extension_lower in cls.FORBIDDEN_EXTENSIONS:
            return Result.fail(
                f"File extension '.{extension_lower}' is not allowed for security reasons"
            )

        return Result.ok()

    @classmethod
    def validate_filename(cls, filename: str) -> Result[None]:
        """
        Проверяет имя файла на допустимость.

        Args:
            filename: Имя файла

        Returns:
            Result с успехом или ошибкой
        """
        if not filename or len(filename.strip()) == 0:
            return Result.fail("Filename cannot be empty")

        if len(filename) > cls.MAX_FILENAME_LENGTH:
            return Result.fail(
                f"Filename too long: {len(filename)} characters. "
                f"Maximum: {cls.MAX_FILENAME_LENGTH} characters"
            )

        # Проверка на запрещенные символы
        if re.search(cls.FORBIDDEN_FILENAME_CHARS, filename):
            return Result.fail(
                "Filename contains forbidden characters. "
                "Only alphanumeric characters, spaces, dots, hyphens and underscores are allowed"
            )

        # Проверка на попытку path traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            return Result.fail(
                "Filename cannot contain path separators or parent directory references"
            )

        return Result.ok()

    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        """
        Очищает имя файла от запрещенных символов.

        Args:
            filename: Исходное имя файла

        Returns:
            Очищенное имя файла
        """
        # Удаляем запрещенные символы
        sanitized = re.sub(cls.FORBIDDEN_FILENAME_CHARS, "", filename)

        # Удаляем path traversal
        sanitized = sanitized.replace("..", "").replace("/", "").replace("\\", "")

        # Ограничиваем длину
        if len(sanitized) > cls.MAX_FILENAME_LENGTH:
            # Сохраняем расширение
            if "." in sanitized:
                name, ext = sanitized.rsplit(".", 1)
                max_name_length = cls.MAX_FILENAME_LENGTH - len(ext) - 1
                sanitized = f"{name[:max_name_length]}.{ext}"
            else:
                sanitized = sanitized[: cls.MAX_FILENAME_LENGTH]

        return sanitized.strip()

    @classmethod
    def validate_tags(cls, tags: List[str]) -> Result[None]:
        """
        Валидирует теги документа.

        Args:
            tags: Список тегов

        Returns:
            Result с успехом или ошибкой
        """
        if len(tags) > 20:
            return Result.fail(
                f"Too many tags: {len(tags)}. Maximum: 20 tags"
            )

        # Проверка каждого тега
        for tag in tags:
            if not tag or len(tag.strip()) == 0:
                return Result.fail("Tag cannot be empty")

            if len(tag) > 50:
                return Result.fail(
                    f"Tag too long: '{tag}' ({len(tag)} characters). "
                    "Maximum: 50 characters per tag"
                )

            # Проверка на запрещенные символы в тегах
            if not re.match(r'^[a-zA-Zа-яА-ЯёЁ0-9\s\-_]+$', tag):
                return Result.fail(
                    f"Tag '{tag}' contains forbidden characters. "
                    "Only letters, numbers, spaces, hyphens and underscores are allowed"
                )

        # Проверка на дубликаты
        if len(tags) != len(set(tags)):
            return Result.fail("Tags must be unique")

        return Result.ok()

    @classmethod
    def is_potentially_dangerous(cls, file_metadata: FileMetadata) -> bool:
        """
        Проверяет, является ли файл потенциально опасным.

        Args:
            file_metadata: Метаданные файла

        Returns:
            True, если файл потенциально опасен
        """
        # Проверка расширения
        extension = file_metadata.file_extension.lower().lstrip(".")
        if extension in cls.FORBIDDEN_EXTENSIONS:
            return True

        # Проверка на подозрительные MIME типы
        dangerous_mime_prefixes = [
            "application/x-",  # Исполняемые файлы
            "application/octet-stream",  # Неизвестные бинарные файлы
        ]

        for prefix in dangerous_mime_prefixes:
            if file_metadata.mime_type.startswith(prefix):
                return True

        return False

    @classmethod
    def calculate_storage_path(
        cls,
        owner_id: str,
        document_id: str,
        original_filename: str,
    ) -> str:
        """
        Вычисляет путь для хранения документа в S3.

        Структура: documents/{owner_id}/{YYYY}/{MM}/{document_id}/{sanitized_filename}

        Args:
            owner_id: ID владельца документа
            document_id: ID документа
            original_filename: Оригинальное имя файла

        Returns:
            Путь для хранения в S3
        """
        from datetime import datetime

        # Очищаем имя файла
        sanitized_filename = cls.sanitize_filename(original_filename)

        # Получаем текущую дату для структурирования папок
        now = datetime.utcnow()
        year = now.strftime("%Y")
        month = now.strftime("%m")

        # Формируем путь
        storage_path = (
            f"documents/{owner_id}/{year}/{month}/{document_id}/{sanitized_filename}"
        )

        return storage_path
