"""
Verify OTP Command

Команда для верификации OTP кода.
"""

from dataclasses import dataclass


@dataclass
class VerifyOTPCommand:
    """
    Команда: верифицировать OTP код.

    Attributes:
        phone: Номер телефона (опционально)
        email: Email адрес (опционально)
        otp_code: 6-значный OTP код
    """

    phone: str | None
    email: str | None
    otp_code: str

    def __post_init__(self) -> None:
        """Валидация после инициализации."""
        if not self.phone and not self.email:
            raise ValueError("Either phone or email must be provided")

        if not self.otp_code or len(self.otp_code) != 6:
            raise ValueError("OTP code must be 6 digits")
