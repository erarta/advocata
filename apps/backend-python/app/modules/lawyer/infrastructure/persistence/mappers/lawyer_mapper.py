"""
LawyerMapper

Маппинг между Lawyer entity и LawyerModel.
"""

from typing import List

from ....domain.entities.lawyer import Lawyer
from ....domain.value_objects.experience import Experience
from ....domain.value_objects.price import Price
from ....domain.value_objects.rating import Rating
from ....domain.value_objects.specialization import Specialization
from ....domain.value_objects.verification_status import VerificationStatus
from ..models.lawyer_model import LawyerModel


class LawyerMapper:
    """
    Mapper для конвертации Lawyer entity ↔ LawyerModel.

    Methods:
        to_domain: Конвертирует ORM model в domain entity
        to_model: Конвертирует domain entity в ORM model
        update_model_from_entity: Обновляет существующую модель из entity
    """

    @staticmethod
    def to_domain(model: LawyerModel) -> Lawyer:
        """
        Конвертирует LawyerModel в Lawyer entity.

        Args:
            model: SQLAlchemy модель

        Returns:
            Lawyer domain entity
        """
        # Конвертируем specializations из строк в Value Objects
        specializations: List[Specialization] = []
        for spec_str in model.specializations:
            specializations.append(Specialization(spec_str))

        # Конвертируем остальные Value Objects
        experience = Experience(model.experience_years)
        price = Price(model.price_amount)
        verification_status = VerificationStatus(model.verification_status)
        rating = Rating(float(model.rating)) if model.rating else None

        # Создаем Lawyer entity через конструктор
        lawyer = Lawyer(
            lawyer_id=model.id,
            user_id=model.user_id,
            specializations=specializations,
            experience=experience,
            price_per_consultation=price,
            verification_status=verification_status,
            license_number=model.license_number,
            education=model.education,
            about=model.about,
            location=model.location,
            rating=rating,
            reviews_count=model.reviews_count,
            consultations_count=model.consultations_count,
            is_available=model.is_available,
            languages=model.languages if model.languages else ["Русский"],
            verified_at=model.verified_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

        return lawyer

    @staticmethod
    def to_model(lawyer: Lawyer) -> LawyerModel:
        """
        Конвертирует Lawyer entity в LawyerModel.

        Args:
            lawyer: Domain entity

        Returns:
            SQLAlchemy модель
        """
        # Конвертируем specializations в строки (русские названия)
        specializations_str = [spec.display_name for spec in lawyer.specializations]

        model = LawyerModel(
            id=lawyer.id,
            user_id=lawyer.user_id,
            specializations=specializations_str,
            experience_years=lawyer.experience.years,
            price_amount=lawyer.price_per_consultation.amount,
            verification_status=lawyer.verification_status.value.value,
            rating=lawyer.rating.value if lawyer.rating else None,
            reviews_count=lawyer.reviews_count,
            consultations_count=lawyer.consultations_count,
            license_number=lawyer.license_number,
            education=lawyer.education,
            about=lawyer.about,
            location=lawyer.location,
            is_available=lawyer.is_available,
            languages=lawyer.languages,
            verified_at=lawyer.verified_at,
            created_at=lawyer.created_at,
            updated_at=lawyer.updated_at,
        )

        return model

    @staticmethod
    def update_model_from_entity(model: LawyerModel, lawyer: Lawyer) -> None:
        """
        Обновляет существующую LawyerModel из Lawyer entity.

        Args:
            model: SQLAlchemy модель для обновления
            lawyer: Domain entity с новыми данными
        """
        # Конвертируем specializations в строки
        specializations_str = [spec.display_name for spec in lawyer.specializations]

        # Обновляем все поля
        model.user_id = lawyer.user_id
        model.specializations = specializations_str
        model.experience_years = lawyer.experience.years
        model.price_amount = lawyer.price_per_consultation.amount
        model.verification_status = lawyer.verification_status.value.value
        model.rating = lawyer.rating.value if lawyer.rating else None
        model.reviews_count = lawyer.reviews_count
        model.consultations_count = lawyer.consultations_count
        model.license_number = lawyer.license_number
        model.education = lawyer.education
        model.about = lawyer.about
        model.location = lawyer.location
        model.is_available = lawyer.is_available
        model.languages = lawyer.languages
        model.verified_at = lawyer.verified_at
        model.updated_at = lawyer.updated_at
        # created_at НЕ обновляем
