"""
Identity API Package

Содержит FastAPI роутеры для Identity модуля.
"""

from .auth_router import router as auth_router

__all__ = ["auth_router"]
