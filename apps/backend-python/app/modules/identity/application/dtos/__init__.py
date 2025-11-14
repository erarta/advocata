"""
Identity Application - DTOs

Data Transfer Objects для передачи данных между слоями.
"""

from .user_dto import UserDTO
from .auth_tokens_dto import AuthTokensDTO

__all__ = ["UserDTO", "AuthTokensDTO"]
