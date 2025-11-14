"""
VerifyLawyerCommand

Команда для верификации юриста администратором.
"""

from dataclasses import dataclass


@dataclass
class VerifyLawyerCommand:
    """
    Команда: Верифицировать юриста.

    Подтверждает документы юриста и переводит его в статус VERIFIED.
    После верификации юрист может принимать консультации.

    Attributes:
        lawyer_id: ID юриста для верификации
        verified_by_admin_id: ID администратора, проводящего верификацию
    """

    lawyer_id: str
    verified_by_admin_id: str
