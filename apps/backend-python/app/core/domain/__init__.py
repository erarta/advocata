"""
Core Domain Layer - Shared Kernel

Базовые классы для Domain-Driven Design архитектуры.
"""

from .entity import Entity
from .aggregate_root import AggregateRoot
from .value_object import ValueObject
from .domain_event import DomainEvent
from .result import Result

__all__ = [
    "Entity",
    "AggregateRoot",
    "ValueObject",
    "DomainEvent",
    "Result",
]
