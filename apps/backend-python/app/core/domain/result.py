"""
Result Pattern для обработки ошибок

Result - паттерн для явной обработки успеха/неудачи операции без использования исключений.
"""

from typing import Generic, TypeVar, Optional

T = TypeVar("T")


class Result(Generic[T]):
    """
    Класс для представления результата операции.

    Result Pattern позволяет явно обрабатывать успех и неудачу операции
    без использования try-catch блоков.

    Attributes:
        _value: Значение в случае успеха
        _error: Сообщение об ошибке в случае неудачи
        _is_success: Флаг успешности операции

    Example:
        ```python
        def create_user(email: str) -> Result[User]:
            if not email:
                return Result.fail("Email is required")

            user = User(email=email)
            return Result.ok(user)

        # Использование
        result = create_user("test@example.com")
        if result.is_success:
            user = result.value
            print(f"User created: {user.email}")
        else:
            print(f"Error: {result.error}")
        ```
    """

    def __init__(
        self,
        value: Optional[T] = None,
        error: Optional[str] = None,
        is_success: bool = False,
    ) -> None:
        """
        Инициализация результата.

        Args:
            value: Значение в случае успеха
            error: Сообщение об ошибке в случае неудачи
            is_success: Флаг успешности

        Raises:
            ValueError: Если одновременно переданы value и error
        """
        if value is not None and error is not None:
            raise ValueError("Result cannot have both value and error")

        self._value = value
        self._error = error
        self._is_success = is_success

    @property
    def is_success(self) -> bool:
        """Проверить успешность операции."""
        return self._is_success

    @property
    def is_failure(self) -> bool:
        """Проверить неудачу операции."""
        return not self._is_success

    @property
    def value(self) -> T:
        """
        Получить значение результата.

        Returns:
            Значение результата

        Raises:
            ValueError: Если результат неудачный
        """
        if not self._is_success:
            raise ValueError(f"Cannot get value of failed result. Error: {self._error}")

        if self._value is None:
            raise ValueError("Result value is None")

        return self._value

    @property
    def error(self) -> str:
        """
        Получить сообщение об ошибке.

        Returns:
            Сообщение об ошибке

        Raises:
            ValueError: Если результат успешный
        """
        if self._is_success:
            raise ValueError("Cannot get error of successful result")

        if self._error is None:
            raise ValueError("Result error is None")

        return self._error

    @classmethod
    def ok(cls, value: T) -> "Result[T]":
        """
        Создать успешный результат.

        Args:
            value: Значение результата

        Returns:
            Result с успешным значением
        """
        return cls(value=value, is_success=True)

    @classmethod
    def fail(cls, error: str) -> "Result[T]":
        """
        Создать неудачный результат.

        Args:
            error: Сообщение об ошибке

        Returns:
            Result с ошибкой
        """
        return cls(error=error, is_success=False)

    def __repr__(self) -> str:
        """Строковое представление результата."""
        if self._is_success:
            return f"Result.ok({self._value})"
        else:
            return f"Result.fail({self._error})"

    def __bool__(self) -> bool:
        """Логическое значение результата (True если успешный)."""
        return self._is_success
