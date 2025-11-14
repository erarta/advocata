"""
Document Category Value Object

Категория юридического документа для классификации.
"""
from enum import Enum
from typing import Optional

from app.shared.domain.value_object import ValueObject
from app.shared.domain.result import Result


class DocumentCategoryEnum(str, Enum):
    """Перечисление категорий документов"""

    # Основные категории по специализациям
    AUTO_ACCIDENTS = "auto_accidents"  # ДТП и автоправо
    CRIMINAL = "criminal"  # Уголовное право
    CIVIL = "civil"  # Гражданское право
    FAMILY = "family"  # Семейное право
    LABOR = "labor"  # Трудовое право
    HOUSING = "housing"  # Жилищное право
    CORPORATE = "corporate"  # Корпоративное право
    TAX = "tax"  # Налоговое право
    ADMINISTRATIVE = "administrative"  # Административное право
    INSURANCE = "insurance"  # Страховое право
    INHERITANCE = "inheritance"  # Наследственное право
    REAL_ESTATE = "real_estate"  # Недвижимость
    CONSUMER_PROTECTION = "consumer_protection"  # Защита прав потребителей
    BANKRUPTCY = "bankruptcy"  # Банкротство
    INTELLECTUAL_PROPERTY = "intellectual_property"  # Интеллектуальная собственность
    MIGRATION = "migration"  # Миграционное право
    LAND = "land"  # Земельное право
    MEDICAL = "medical"  # Медицинское право
    OTHER = "other"  # Прочее


class DocumentCategory(ValueObject):
    """
    Value Object для категории документа.

    Категоризирует документ по юридической области для упрощения
    поиска и рекомендаций.
    """

    # Отображаемые названия категорий на русском
    DISPLAY_NAMES = {
        DocumentCategoryEnum.AUTO_ACCIDENTS: "ДТП и автоправо",
        DocumentCategoryEnum.CRIMINAL: "Уголовное право",
        DocumentCategoryEnum.CIVIL: "Гражданское право",
        DocumentCategoryEnum.FAMILY: "Семейное право",
        DocumentCategoryEnum.LABOR: "Трудовое право",
        DocumentCategoryEnum.HOUSING: "Жилищное право",
        DocumentCategoryEnum.CORPORATE: "Корпоративное право",
        DocumentCategoryEnum.TAX: "Налоговое право",
        DocumentCategoryEnum.ADMINISTRATIVE: "Административное право",
        DocumentCategoryEnum.INSURANCE: "Страховое право",
        DocumentCategoryEnum.INHERITANCE: "Наследственное право",
        DocumentCategoryEnum.REAL_ESTATE: "Недвижимость",
        DocumentCategoryEnum.CONSUMER_PROTECTION: "Защита прав потребителей",
        DocumentCategoryEnum.BANKRUPTCY: "Банкротство",
        DocumentCategoryEnum.INTELLECTUAL_PROPERTY: "Интеллектуальная собственность",
        DocumentCategoryEnum.MIGRATION: "Миграционное право",
        DocumentCategoryEnum.LAND: "Земельное право",
        DocumentCategoryEnum.MEDICAL: "Медицинское право",
        DocumentCategoryEnum.OTHER: "Прочее",
    }

    # Описания категорий
    DESCRIPTIONS = {
        DocumentCategoryEnum.AUTO_ACCIDENTS: "Документы, связанные с ДТП и автомобильным правом",
        DocumentCategoryEnum.CRIMINAL: "Документы по уголовным делам и защите",
        DocumentCategoryEnum.CIVIL: "Гражданско-правовые документы",
        DocumentCategoryEnum.FAMILY: "Документы по семейным спорам и отношениям",
        DocumentCategoryEnum.LABOR: "Трудовые договоры и споры с работодателем",
        DocumentCategoryEnum.HOUSING: "Документы по жилищным вопросам",
        DocumentCategoryEnum.CORPORATE: "Корпоративные и коммерческие документы",
        DocumentCategoryEnum.TAX: "Налоговые споры и документы",
        DocumentCategoryEnum.ADMINISTRATIVE: "Административные правонарушения",
        DocumentCategoryEnum.INSURANCE: "Страховые споры и выплаты",
        DocumentCategoryEnum.INHERITANCE: "Наследственные дела и завещания",
        DocumentCategoryEnum.REAL_ESTATE: "Документы по недвижимости",
        DocumentCategoryEnum.CONSUMER_PROTECTION: "Защита прав потребителей",
        DocumentCategoryEnum.BANKRUPTCY: "Банкротство физических и юридических лиц",
        DocumentCategoryEnum.INTELLECTUAL_PROPERTY: "Авторские права, патенты, товарные знаки",
        DocumentCategoryEnum.MIGRATION: "Миграционные вопросы и документы",
        DocumentCategoryEnum.LAND: "Земельные споры и документы",
        DocumentCategoryEnum.MEDICAL: "Медицинское право и ошибки врачей",
        DocumentCategoryEnum.OTHER: "Прочие категории документов",
    }

    def __init__(self, value: DocumentCategoryEnum):
        """
        Создает экземпляр категории документа.

        Args:
            value: Категория из перечисления
        """
        self._value = value

    @classmethod
    def create(cls, value: str) -> Result["DocumentCategory"]:
        """
        Создает экземпляр категории с валидацией.

        Args:
            value: Строковое значение категории

        Returns:
            Result с DocumentCategory или ошибкой
        """
        try:
            category_enum = DocumentCategoryEnum(value)
            return Result.ok(cls(category_enum))
        except ValueError:
            valid_categories = ", ".join([c.value for c in DocumentCategoryEnum])
            return Result.fail(
                f"Invalid document category: {value}. "
                f"Valid categories: {valid_categories}"
            )

    @classmethod
    def other(cls) -> "DocumentCategory":
        """Создает категорию 'Прочее'"""
        return cls(DocumentCategoryEnum.OTHER)

    @property
    def value(self) -> DocumentCategoryEnum:
        """Возвращает значение перечисления"""
        return self._value

    @property
    def display_name(self) -> str:
        """Возвращает отображаемое название на русском"""
        return self.DISPLAY_NAMES.get(self._value, self._value.value)

    @property
    def description(self) -> str:
        """Возвращает описание категории"""
        return self.DESCRIPTIONS.get(self._value, "")

    @property
    def is_litigation(self) -> bool:
        """Проверяет, относится ли к судебным спорам"""
        return self._value in {
            DocumentCategoryEnum.CRIMINAL,
            DocumentCategoryEnum.CIVIL,
            DocumentCategoryEnum.ADMINISTRATIVE,
            DocumentCategoryEnum.BANKRUPTCY,
        }

    @property
    def is_contractual(self) -> bool:
        """Проверяет, относится ли к договорным отношениям"""
        return self._value in {
            DocumentCategoryEnum.CORPORATE,
            DocumentCategoryEnum.LABOR,
            DocumentCategoryEnum.REAL_ESTATE,
            DocumentCategoryEnum.HOUSING,
        }

    def _get_equality_components(self) -> tuple:
        """Возвращает компоненты для сравнения"""
        return (self._value,)

    def __str__(self) -> str:
        """Строковое представление"""
        return self.display_name

    def __repr__(self) -> str:
        """Представление для отладки"""
        return f"DocumentCategory({self._value.value})"
