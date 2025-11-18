"""
Lawyer API Package

Содержит FastAPI роутеры для Lawyer модуля.
"""

from .lawyer_router import router as lawyer_router

__all__ = ["lawyer_router"]
