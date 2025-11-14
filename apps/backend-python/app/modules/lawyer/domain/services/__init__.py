"""
Domain Services для Lawyer Module

Бизнес-логика, не принадлежащая одной сущности.
"""

from .lawyer_verification_service import LawyerVerificationService

__all__ = ["LawyerVerificationService"]
