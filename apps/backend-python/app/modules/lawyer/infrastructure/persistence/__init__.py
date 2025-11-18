"""
Persistence для Lawyer Module

Компоненты для работы с хранилищем данных.
"""

from .models.lawyer_model import LawyerModel
from .mappers.lawyer_mapper import LawyerMapper
from .repositories.lawyer_repository_impl import LawyerRepositoryImpl

__all__ = [
    "LawyerModel",
    "LawyerMapper",
    "LawyerRepositoryImpl",
]
