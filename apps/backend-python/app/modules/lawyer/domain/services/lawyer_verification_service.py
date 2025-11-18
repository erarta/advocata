"""
Lawyer Verification Service

Domain Service для верификации юристов.
"""

import re
from typing import Dict, List, Optional

from app.core.domain.result import Result


class LawyerVerificationService:
    """
    Domain Service для верификации юристов.

    Содержит бизнес-логику проверки документов и данных юриста,
    которая не принадлежит одной конкретной сущности.

    Business Rules:
    - Номер лицензии должен соответствовать формату
    - Образование должно быть валидным (ВУЗ + факультет)
    - Описание должно быть достаточно подробным
    - Проверка на наличие запрещенных слов/контактов

    Methods:
        validate_license_number: Проверка номера лицензии
        validate_education: Проверка образования
        validate_about: Проверка описания
        check_blacklisted_words: Проверка на запрещенные слова
        is_eligible_for_verification: Комплексная проверка
    """

    # Паттерны для валидации
    LICENSE_PATTERN = re.compile(r"^[А-ЯA-Z0-9]{5,20}$")

    # Список запрещенных слов (контакты, спам)
    BLACKLISTED_WORDS = [
        "whatsapp",
        "telegram",
        "viber",
        "вотсап",
        "телеграм",
        "вайбер",
        "+7",
        "89",
        "@",
        "http",
        "www",
        ".ru",
        ".com",
    ]

    # Минимальные требования к образованию
    MIN_EDUCATION_KEYWORDS = [
        "университет",
        "институт",
        "академия",
        "юридический",
        "правовой",
        "юриспруденция",
    ]

    @classmethod
    def validate_license_number(cls, license_number: str) -> Result[None]:
        """
        Валидация номера лицензии/свидетельства.

        Args:
            license_number: Номер для проверки

        Returns:
            Result с успехом или ошибкой
        """
        if not license_number or len(license_number.strip()) < 5:
            return Result.fail("License number is too short (min 5 characters)")

        cleaned = license_number.strip().upper()

        if not cls.LICENSE_PATTERN.match(cleaned):
            return Result.fail(
                "License number must contain only letters and numbers (5-20 characters)"
            )

        return Result.ok()

    @classmethod
    def validate_education(cls, education: str) -> Result[None]:
        """
        Валидация образования.

        Args:
            education: Образование для проверки

        Returns:
            Result с успехом или ошибкой
        """
        if not education or len(education.strip()) < 10:
            return Result.fail("Education description is too short (min 10 characters)")

        education_lower = education.lower()

        # Проверяем наличие хотя бы одного ключевого слова
        has_keyword = any(
            keyword in education_lower for keyword in cls.MIN_EDUCATION_KEYWORDS
        )

        if not has_keyword:
            return Result.fail(
                "Education must mention university/institute and legal faculty"
            )

        return Result.ok()

    @classmethod
    def validate_about(cls, about: str) -> Result[None]:
        """
        Валидация описания профиля.

        Args:
            about: Описание для проверки

        Returns:
            Result с успехом или ошибкой
        """
        if not about or len(about.strip()) < 50:
            return Result.fail("About section is too short (min 50 characters)")

        if len(about) > 2000:
            return Result.fail("About section is too long (max 2000 characters)")

        # Проверка на качество текста (минимум 3 предложения)
        sentences = about.split(".")
        if len(sentences) < 3:
            return Result.fail("About section must contain at least 3 sentences")

        return Result.ok()

    @classmethod
    def check_blacklisted_words(cls, text: str) -> Result[None]:
        """
        Проверка на запрещенные слова (контакты, спам).

        Args:
            text: Текст для проверки

        Returns:
            Result с успехом или ошибкой
        """
        text_lower = text.lower()

        found_words = [
            word for word in cls.BLACKLISTED_WORDS if word in text_lower
        ]

        if found_words:
            return Result.fail(
                f"Text contains prohibited content: {', '.join(found_words)}. "
                "Please remove phone numbers, messengers, and external links"
            )

        return Result.ok()

    @classmethod
    def is_eligible_for_verification(
        cls,
        license_number: str,
        education: str,
        about: str,
    ) -> Result[Dict[str, List[str]]]:
        """
        Комплексная проверка готовности к верификации.

        Args:
            license_number: Номер лицензии
            education: Образование
            about: Описание

        Returns:
            Result с отчетом о проверке или ошибкой
        """
        errors: Dict[str, List[str]] = {
            "license": [],
            "education": [],
            "about": [],
        }

        # Проверка лицензии
        license_result = cls.validate_license_number(license_number)
        if license_result.is_failure:
            errors["license"].append(license_result.error)

        # Проверка образования
        education_result = cls.validate_education(education)
        if education_result.is_failure:
            errors["education"].append(education_result.error)

        # Проверка описания
        about_result = cls.validate_about(about)
        if about_result.is_failure:
            errors["about"].append(about_result.error)

        # Проверка на запрещенные слова в описании
        blacklist_result = cls.check_blacklisted_words(about)
        if blacklist_result.is_failure:
            errors["about"].append(blacklist_result.error)

        # Если есть ошибки, возвращаем их
        total_errors = sum(len(errs) for errs in errors.values())
        if total_errors > 0:
            return Result.fail(errors)

        return Result.ok({
            "status": "eligible",
            "message": "Lawyer is eligible for verification",
        })

    @classmethod
    def calculate_profile_completeness(
        cls,
        has_license: bool,
        has_education: bool,
        about_length: int,
        specializations_count: int,
        has_languages: bool,
    ) -> int:
        """
        Рассчитывает процент заполненности профиля.

        Args:
            has_license: Есть ли лицензия
            has_education: Есть ли образование
            about_length: Длина описания
            specializations_count: Количество специализаций
            has_languages: Указаны ли языки

        Returns:
            Процент заполненности (0-100)
        """
        score = 0

        # Лицензия (20%)
        if has_license:
            score += 20

        # Образование (20%)
        if has_education:
            score += 20

        # Описание (30%)
        if about_length >= 200:
            score += 30
        elif about_length >= 100:
            score += 20
        elif about_length >= 50:
            score += 10

        # Специализации (20%)
        if specializations_count >= 3:
            score += 20
        elif specializations_count >= 2:
            score += 15
        elif specializations_count >= 1:
            score += 10

        # Языки (10%)
        if has_languages:
            score += 10

        return min(score, 100)
