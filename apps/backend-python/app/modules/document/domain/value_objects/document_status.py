"""
Document Status Value Object

Статус обработки документа в системе.
"""
from enum import Enum
from typing import Optional

from app.shared.domain.value_object import ValueObject
from app.shared.domain.result import Result


class DocumentStatusEnum(str, Enum):
    """Перечисление статусов документа"""

    UPLOADED = "uploaded"  # Загружен, ожидает обработки
    PROCESSING = "processing"  # В процессе обработки (OCR, извлечение текста)
    PROCESSED = "processed"  # Успешно обработан
    FAILED = "failed"  # Ошибка при обработке
    ARCHIVED = "archived"  # Архивирован
    DELETED = "deleted"  # Помечен на удаление


class DocumentStatus(ValueObject):
    """
    Value Object для статуса документа.

    Инкапсулирует жизненный цикл документа от загрузки до обработки.
    """

    # Отображаемые названия статусов на русском
    DISPLAY_NAMES = {
        DocumentStatusEnum.UPLOADED: "Загружен",
        DocumentStatusEnum.PROCESSING: "Обрабатывается",
        DocumentStatusEnum.PROCESSED: "Обработан",
        DocumentStatusEnum.FAILED: "Ошибка обработки",
        DocumentStatusEnum.ARCHIVED: "Архивирован",
        DocumentStatusEnum.DELETED: "Удален",
    }

    # Описания статусов
    DESCRIPTIONS = {
        DocumentStatusEnum.UPLOADED: "Документ загружен и ожидает обработки",
        DocumentStatusEnum.PROCESSING: "Документ обрабатывается (OCR, извлечение текста)",
        DocumentStatusEnum.PROCESSED: "Документ успешно обработан и доступен",
        DocumentStatusEnum.FAILED: "Произошла ошибка при обработке документа",
        DocumentStatusEnum.ARCHIVED: "Документ архивирован и не отображается",
        DocumentStatusEnum.DELETED: "Документ помечен на удаление",
    }

    def __init__(self, value: DocumentStatusEnum):
        """
        Создает экземпляр статуса документа.

        Args:
            value: Статус из перечисления
        """
        self._value = value

    @classmethod
    def create(cls, value: str) -> Result["DocumentStatus"]:
        """
        Создает экземпляр статуса с валидацией.

        Args:
            value: Строковое значение статуса

        Returns:
            Result с DocumentStatus или ошибкой
        """
        try:
            status_enum = DocumentStatusEnum(value)
            return Result.ok(cls(status_enum))
        except ValueError:
            valid_statuses = ", ".join([s.value for s in DocumentStatusEnum])
            return Result.fail(
                f"Invalid document status: {value}. "
                f"Valid statuses: {valid_statuses}"
            )

    @classmethod
    def uploaded(cls) -> "DocumentStatus":
        """Создает статус 'Загружен'"""
        return cls(DocumentStatusEnum.UPLOADED)

    @classmethod
    def processing(cls) -> "DocumentStatus":
        """Создает статус 'Обрабатывается'"""
        return cls(DocumentStatusEnum.PROCESSING)

    @classmethod
    def processed(cls) -> "DocumentStatus":
        """Создает статус 'Обработан'"""
        return cls(DocumentStatusEnum.PROCESSED)

    @classmethod
    def failed(cls) -> "DocumentStatus":
        """Создает статус 'Ошибка обработки'"""
        return cls(DocumentStatusEnum.FAILED)

    @classmethod
    def archived(cls) -> "DocumentStatus":
        """Создает статус 'Архивирован'"""
        return cls(DocumentStatusEnum.ARCHIVED)

    @classmethod
    def deleted(cls) -> "DocumentStatus":
        """Создает статус 'Удален'"""
        return cls(DocumentStatusEnum.DELETED)

    @property
    def value(self) -> DocumentStatusEnum:
        """Возвращает значение перечисления"""
        return self._value

    @property
    def display_name(self) -> str:
        """Возвращает отображаемое название на русском"""
        return self.DISPLAY_NAMES.get(self._value, self._value.value)

    @property
    def description(self) -> str:
        """Возвращает описание статуса"""
        return self.DESCRIPTIONS.get(self._value, "")

    @property
    def is_uploaded(self) -> bool:
        """Проверяет, загружен ли документ"""
        return self._value == DocumentStatusEnum.UPLOADED

    @property
    def is_processing(self) -> bool:
        """Проверяет, обрабатывается ли документ"""
        return self._value == DocumentStatusEnum.PROCESSING

    @property
    def is_processed(self) -> bool:
        """Проверяет, обработан ли документ"""
        return self._value == DocumentStatusEnum.PROCESSED

    @property
    def is_failed(self) -> bool:
        """Проверяет, произошла ли ошибка"""
        return self._value == DocumentStatusEnum.FAILED

    @property
    def is_archived(self) -> bool:
        """Проверяет, архивирован ли документ"""
        return self._value == DocumentStatusEnum.ARCHIVED

    @property
    def is_deleted(self) -> bool:
        """Проверяет, удален ли документ"""
        return self._value == DocumentStatusEnum.DELETED

    @property
    def can_be_processed(self) -> bool:
        """Проверяет, можно ли обработать документ"""
        return self._value in {
            DocumentStatusEnum.UPLOADED,
            DocumentStatusEnum.FAILED,
        }

    @property
    def can_be_deleted(self) -> bool:
        """Проверяет, можно ли удалить документ"""
        return self._value not in {
            DocumentStatusEnum.DELETED,
            DocumentStatusEnum.PROCESSING,
        }

    @property
    def can_be_archived(self) -> bool:
        """Проверяет, можно ли архивировать документ"""
        return self._value in {
            DocumentStatusEnum.PROCESSED,
            DocumentStatusEnum.FAILED,
        }

    def _get_equality_components(self) -> tuple:
        """Возвращает компоненты для сравнения"""
        return (self._value,)

    def __str__(self) -> str:
        """Строковое представление"""
        return self.display_name

    def __repr__(self) -> str:
        """Представление для отладки"""
        return f"DocumentStatus({self._value.value})"
