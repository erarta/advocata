"""
RegisterLawyerCommand

Команда для регистрации нового юриста.
"""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class RegisterLawyerCommand:
    """
    Команда: Зарегистрировать юриста.

    Создает нового юриста в системе со статусом PENDING.
    После регистрации юрист должен пройти верификацию.

    Attributes:
        user_id: ID пользователя из Identity Module
        specializations: Список специализаций (русские названия или enum names)
        experience_years: Опыт работы в годах
        price_per_consultation: Цена за консультацию (рубли)
        license_number: Номер лицензии/свидетельства
        education: Образование (ВУЗ, факультет)
        about: Описание юриста (минимум 50 символов)
        location: Город/регион
        languages: Языки (опционально)
    """

    user_id: str
    specializations: List[str]
    experience_years: int
    price_per_consultation: float
    license_number: str
    education: str
    about: str
    location: str
    languages: Optional[List[str]] = None
