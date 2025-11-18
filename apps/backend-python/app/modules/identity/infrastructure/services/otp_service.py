"""
OTP Service

Сервис для генерации и отправки OTP кодов.
"""

import random
import logging
from abc import ABC, abstractmethod
from typing import Optional

from app.config import settings


logger = logging.getLogger(__name__)


class IOTPService(ABC):
    """
    Интерфейс сервиса для работы с OTP.
    """

    @abstractmethod
    def generate_otp(self) -> str:
        """Генерировать OTP код."""
        pass

    @abstractmethod
    async def send_otp_sms(self, phone: str, otp_code: str) -> None:
        """Отправить OTP по SMS."""
        pass

    @abstractmethod
    async def send_otp_email(self, email: str, otp_code: str) -> None:
        """Отправить OTP по email."""
        pass


class OTPService(IOTPService):
    """
    Реализация OTP сервиса.

    Генерирует 6-значные OTP коды и отправляет их через SMS/Email.
    """

    def __init__(
        self,
        twilio_account_sid: Optional[str] = None,
        twilio_auth_token: Optional[str] = None,
        twilio_phone_number: Optional[str] = None,
    ) -> None:
        """
        Инициализация сервиса.

        Args:
            twilio_account_sid: Twilio Account SID
            twilio_auth_token: Twilio Auth Token
            twilio_phone_number: Twilio номер телефона
        """
        self.twilio_account_sid = twilio_account_sid or settings.twilio_account_sid
        self.twilio_auth_token = twilio_auth_token or settings.twilio_auth_token
        self.twilio_phone_number = twilio_phone_number or settings.twilio_phone_number

        # Инициализация Twilio клиента (если настроено)
        if self.twilio_account_sid and self.twilio_auth_token:
            try:
                from twilio.rest import Client
                self.twilio_client = Client(
                    self.twilio_account_sid,
                    self.twilio_auth_token,
                )
            except ImportError:
                logger.warning("Twilio library not installed. SMS sending will be mocked.")
                self.twilio_client = None
        else:
            self.twilio_client = None
            logger.warning("Twilio credentials not configured. SMS sending will be mocked.")

    def generate_otp(self) -> str:
        """
        Генерировать 6-значный OTP код.

        Returns:
            OTP код (6 цифр)

        Example:
            ```python
            service = OTPService()
            otp = service.generate_otp()
            # Returns: "123456"
            ```
        """
        return str(random.randint(100000, 999999))

    async def send_otp_sms(self, phone: str, otp_code: str) -> None:
        """
        Отправить OTP код по SMS.

        Args:
            phone: Номер телефона в формате +79991234567
            otp_code: OTP код для отправки

        Example:
            ```python
            service = OTPService()
            await service.send_otp_sms("+79991234567", "123456")
            ```
        """
        message = f"Ваш код подтверждения Advocata: {otp_code}"

        if self.twilio_client and self.twilio_phone_number:
            try:
                self.twilio_client.messages.create(
                    body=message,
                    from_=self.twilio_phone_number,
                    to=phone,
                )
                logger.info(f"OTP SMS sent to {phone}")
            except Exception as e:
                logger.error(f"Failed to send OTP SMS to {phone}: {str(e)}")
                raise
        else:
            # Мок для разработки
            logger.info(f"[MOCK] OTP SMS to {phone}: {message}")
            logger.info(f"[DEV] OTP Code: {otp_code}")

    async def send_otp_email(self, email: str, otp_code: str) -> None:
        """
        Отправить OTP код по email.

        Args:
            email: Email адрес
            otp_code: OTP код для отправки

        Example:
            ```python
            service = OTPService()
            await service.send_otp_email("user@example.com", "123456")
            ```
        """
        subject = "Код подтверждения Advocata"
        body = f"""
        Добро пожаловать в Advocata!

        Ваш код подтверждения: {otp_code}

        Код действителен в течение 5 минут.

        Если вы не запрашивали этот код, проигнорируйте это письмо.
        """

        # TODO: Реализовать отправку через SendGrid или другой SMTP
        # Пока мок для разработки
        logger.info(f"[MOCK] OTP Email to {email}")
        logger.info(f"[MOCK] Subject: {subject}")
        logger.info(f"[MOCK] Body: {body}")
        logger.info(f"[DEV] OTP Code: {otp_code}")
