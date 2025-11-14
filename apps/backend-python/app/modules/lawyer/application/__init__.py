"""
Lawyer Application Layer

Use Cases (Commands & Queries) для Lawyer Module.
"""

# DTOs
from .dtos.lawyer_dto import LawyerDTO, LawyerListItemDTO, LawyerSearchResultDTO

# Commands
from .commands.register_lawyer import RegisterLawyerCommand
from .commands.register_lawyer_handler import RegisterLawyerHandler
from .commands.verify_lawyer import VerifyLawyerCommand
from .commands.verify_lawyer_handler import VerifyLawyerHandler
from .commands.update_availability import UpdateAvailabilityCommand
from .commands.update_availability_handler import UpdateAvailabilityHandler

# Queries
from .queries.search_lawyers import SearchLawyersQuery
from .queries.search_lawyers_handler import SearchLawyersHandler
from .queries.get_lawyer import GetLawyerQuery
from .queries.get_lawyer_handler import GetLawyerHandler
from .queries.get_top_rated import GetTopRatedQuery
from .queries.get_top_rated_handler import GetTopRatedHandler

__all__ = [
    # DTOs
    "LawyerDTO",
    "LawyerListItemDTO",
    "LawyerSearchResultDTO",
    # Commands
    "RegisterLawyerCommand",
    "RegisterLawyerHandler",
    "VerifyLawyerCommand",
    "VerifyLawyerHandler",
    "UpdateAvailabilityCommand",
    "UpdateAvailabilityHandler",
    # Queries
    "SearchLawyersQuery",
    "SearchLawyersHandler",
    "GetLawyerQuery",
    "GetLawyerHandler",
    "GetTopRatedQuery",
    "GetTopRatedHandler",
]
