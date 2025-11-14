"""
UpdateAvailabilityCommand

Команда для обновления доступности юриста.
"""

from dataclasses import dataclass


@dataclass
class UpdateAvailabilityCommand:
    """
    Команда: Обновить доступность юриста.

    Юрист может включать/выключать свою доступность для консультаций.
    Только верифицированные юристы могут менять доступность.

    Attributes:
        lawyer_id: ID юриста
        is_available: Доступен ли для консультаций
    """

    lawyer_id: str
    is_available: bool
