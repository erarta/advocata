"""
Specialization Value Object

Специализация юриста (область права).
"""

from enum import Enum
from typing import Any

from app.core.domain.value_object import ValueObject


class SpecializationType(str, Enum):
    """
    Типы специализаций юристов в российском праве.

    Основные направления:
    - ДТП и страховые споры
    - Уголовное право
    - Трудовое право
    - Семейное право
    - Жилищное право
    - Административное право
    - Налоговое право
    - Корпоративное право
    - Гражданское право
    """

    # Traffic & Insurance
    AUTO_ACCIDENTS = "ДТП"
    INSURANCE_DISPUTES = "Страховые споры"

    # Criminal Law
    CRIMINAL_DEFENSE = "Уголовное право"
    CRIMINAL_APPEALS = "Обжалование приговоров"

    # Labor Law
    LABOR_DISPUTES = "Трудовое право"
    LABOR_DISMISSAL = "Незаконное увольнение"
    LABOR_SALARY = "Невыплата зарплаты"

    # Family Law
    FAMILY_DIVORCE = "Разводы"
    FAMILY_CUSTODY = "Опека над детьми"
    FAMILY_ALIMONY = "Алименты"

    # Housing Law
    HOUSING_DISPUTES = "Жилищное право"
    HOUSING_EVICTION = "Выселение"
    HOUSING_UTILITIES = "ЖКХ споры"

    # Administrative Law
    ADMINISTRATIVE = "Административное право"
    ADMINISTRATIVE_FINES = "Обжалование штрафов"

    # Tax Law
    TAX_LAW = "Налоговое право"
    TAX_DISPUTES = "Налоговые споры"

    # Corporate Law
    CORPORATE = "Корпоративное право"
    CORPORATE_CONTRACTS = "Договорное право"

    # Civil Law
    CIVIL_LAW = "Гражданское право"
    CIVIL_DISPUTES = "Гражданские споры"

    # Other
    BANKRUPTCY = "Банкротство"
    REAL_ESTATE = "Недвижимость"
    INHERITANCE = "Наследство"
    CONSUMER_RIGHTS = "Защита прав потребителей"
    IMMIGRATION = "Миграционное право"

    @classmethod
    def get_display_names(cls) -> dict[str, str]:
        """Возвращает маппинг enum → русское название."""
        return {member.name: member.value for member in cls}

    @classmethod
    def from_display_name(cls, display_name: str) -> "SpecializationType":
        """Создает enum из русского названия."""
        for member in cls:
            if member.value == display_name:
                return member
        raise ValueError(f"Unknown specialization: {display_name}")


class Specialization(ValueObject):
    """
    Value Object для специализации юриста.

    Представляет область права, в которой специализируется юрист.
    Неизменяемый объект.

    Examples:
        >>> spec = Specialization(SpecializationType.AUTO_ACCIDENTS)
        >>> spec.value
        <SpecializationType.AUTO_ACCIDENTS: 'ДТП'>
        >>> spec.display_name
        'ДТП'
    """

    def __init__(self, value: SpecializationType | str) -> None:
        """
        Создает специализацию.

        Args:
            value: Тип специализации (enum или строка)

        Raises:
            ValueError: Если специализация невалидна
        """
        if isinstance(value, str):
            # Попробуем найти по display name (русское название)
            try:
                value = SpecializationType.from_display_name(value)
            except ValueError:
                # Попробуем найти по enum name (AUTO_ACCIDENTS)
                try:
                    value = SpecializationType[value]
                except KeyError:
                    raise ValueError(f"Invalid specialization: {value}")

        if not isinstance(value, SpecializationType):
            raise ValueError(f"Invalid specialization type: {type(value)}")

        self._value = value

    @property
    def value(self) -> SpecializationType:
        """Возвращает enum специализации."""
        return self._value

    @property
    def display_name(self) -> str:
        """Возвращает русское название специализации."""
        return self._value.value

    @property
    def enum_name(self) -> str:
        """Возвращает название enum (AUTO_ACCIDENTS)."""
        return self._value.name

    def _get_equality_components(self) -> tuple[Any, ...]:
        """Компоненты для сравнения."""
        return (self._value,)

    def __str__(self) -> str:
        """Строковое представление."""
        return self.display_name

    def __repr__(self) -> str:
        """Представление для отладки."""
        return f"Specialization({self.enum_name})"
