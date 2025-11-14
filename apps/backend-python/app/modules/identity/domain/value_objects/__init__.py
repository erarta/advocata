"""
Identity Domain - Value Objects

Объекты-значения для Identity bounded context.
"""

from .email import Email
from .phone import Phone
from .user_role import UserRole

__all__ = ["Email", "Phone", "UserRole"]
