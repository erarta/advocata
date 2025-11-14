"""
Core Infrastructure Layer

Базовая инфраструктура приложения (база данных, кеш, и т.д.).
"""

from .database import Base, get_db, init_db

__all__ = ["Base", "get_db", "init_db"]
