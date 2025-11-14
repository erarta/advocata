"""
Document Type Value Object

Тип юридического документа с предопределенными категориями.
"""
from enum import Enum
from typing import Optional

from app.shared.domain.value_object import ValueObject
from app.shared.domain.result import Result


class DocumentTypeEnum(str, Enum):
    """Перечисление типов юридических документов"""

    # Договоры и соглашения
    CONTRACT = "contract"  # Договор
    AGREEMENT = "agreement"  # Соглашение
    POWER_OF_ATTORNEY = "power_of_attorney"  # Доверенность

    # Судебные документы
    COURT_DECISION = "court_decision"  # Решение суда
    COURT_ORDER = "court_order"  # Определение суда
    APPEAL = "appeal"  # Апелляционная жалоба
    CASSATION = "cassation"  # Кассационная жалоба

    # Заявления и жалобы
    CLAIM = "claim"  # Исковое заявление
    COMPLAINT = "complaint"  # Жалоба
    APPLICATION = "application"  # Заявление
    PETITION = "petition"  # Ходатайство

    # Процессуальные документы
    PROTOCOL = "protocol"  # Протокол
    MINUTES = "minutes"  # Протокол заседания
    NOTIFICATION = "notification"  # Уведомление
    SUMMONS = "summons"  # Повестка

    # ДТП документы
    ACCIDENT_REPORT = "accident_report"  # Справка о ДТП
    INSURANCE_CLAIM = "insurance_claim"  # Заявление в страховую
    DAMAGE_ASSESSMENT = "damage_assessment"  # Акт осмотра повреждений

    # Корпоративные документы
    CHARTER = "charter"  # Устав
    EXTRACT = "extract"  # Выписка из ЕГРЮЛ/ЕГРИП
    CORPORATE_DECISION = "corporate_decision"  # Решение участников

    # Трудовые документы
    EMPLOYMENT_CONTRACT = "employment_contract"  # Трудовой договор
    DISMISSAL_ORDER = "dismissal_order"  # Приказ об увольнении
    WORK_CERTIFICATE = "work_certificate"  # Справка с места работы

    # Прочее
    CERTIFICATE = "certificate"  # Справка
    REFERENCE = "reference"  # Выписка
    REPORT = "report"  # Отчет
    LETTER = "letter"  # Письмо
    OTHER = "other"  # Прочее


class DocumentType(ValueObject):
    """
    Value Object для типа документа.

    Инкапсулирует тип юридического документа с отображаемым названием
    и описанием на русском языке.
    """

    # Отображаемые названия типов документов на русском
    DISPLAY_NAMES = {
        DocumentTypeEnum.CONTRACT: "Договор",
        DocumentTypeEnum.AGREEMENT: "Соглашение",
        DocumentTypeEnum.POWER_OF_ATTORNEY: "Доверенность",
        DocumentTypeEnum.COURT_DECISION: "Решение суда",
        DocumentTypeEnum.COURT_ORDER: "Определение суда",
        DocumentTypeEnum.APPEAL: "Апелляционная жалоба",
        DocumentTypeEnum.CASSATION: "Кассационная жалоба",
        DocumentTypeEnum.CLAIM: "Исковое заявление",
        DocumentTypeEnum.COMPLAINT: "Жалоба",
        DocumentTypeEnum.APPLICATION: "Заявление",
        DocumentTypeEnum.PETITION: "Ходатайство",
        DocumentTypeEnum.PROTOCOL: "Протокол",
        DocumentTypeEnum.MINUTES: "Протокол заседания",
        DocumentTypeEnum.NOTIFICATION: "Уведомление",
        DocumentTypeEnum.SUMMONS: "Повестка",
        DocumentTypeEnum.ACCIDENT_REPORT: "Справка о ДТП",
        DocumentTypeEnum.INSURANCE_CLAIM: "Заявление в страховую",
        DocumentTypeEnum.DAMAGE_ASSESSMENT: "Акт осмотра повреждений",
        DocumentTypeEnum.CHARTER: "Устав",
        DocumentTypeEnum.EXTRACT: "Выписка из ЕГРЮЛ/ЕГРИП",
        DocumentTypeEnum.CORPORATE_DECISION: "Решение участников",
        DocumentTypeEnum.EMPLOYMENT_CONTRACT: "Трудовой договор",
        DocumentTypeEnum.DISMISSAL_ORDER: "Приказ об увольнении",
        DocumentTypeEnum.WORK_CERTIFICATE: "Справка с места работы",
        DocumentTypeEnum.CERTIFICATE: "Справка",
        DocumentTypeEnum.REFERENCE: "Выписка",
        DocumentTypeEnum.REPORT: "Отчет",
        DocumentTypeEnum.LETTER: "Письмо",
        DocumentTypeEnum.OTHER: "Прочее",
    }

    # Описания типов документов
    DESCRIPTIONS = {
        DocumentTypeEnum.CONTRACT: "Договор между сторонами",
        DocumentTypeEnum.AGREEMENT: "Соглашение или договоренность",
        DocumentTypeEnum.POWER_OF_ATTORNEY: "Доверенность на представление интересов",
        DocumentTypeEnum.COURT_DECISION: "Решение суда по делу",
        DocumentTypeEnum.COURT_ORDER: "Определение или постановление суда",
        DocumentTypeEnum.APPEAL: "Апелляционная жалоба на решение суда",
        DocumentTypeEnum.CASSATION: "Кассационная жалоба",
        DocumentTypeEnum.CLAIM: "Исковое заявление в суд",
        DocumentTypeEnum.COMPLAINT: "Жалоба на действия или бездействие",
        DocumentTypeEnum.APPLICATION: "Заявление в государственный орган",
        DocumentTypeEnum.PETITION: "Ходатайство в рамках судебного процесса",
        DocumentTypeEnum.PROTOCOL: "Протокол об административном правонарушении",
        DocumentTypeEnum.MINUTES: "Протокол судебного заседания",
        DocumentTypeEnum.NOTIFICATION: "Уведомление или извещение",
        DocumentTypeEnum.SUMMONS: "Повестка в суд или на допрос",
        DocumentTypeEnum.ACCIDENT_REPORT: "Справка о дорожно-транспортном происшествии",
        DocumentTypeEnum.INSURANCE_CLAIM: "Заявление о страховой выплате",
        DocumentTypeEnum.DAMAGE_ASSESSMENT: "Акт осмотра и оценки повреждений",
        DocumentTypeEnum.CHARTER: "Устав организации",
        DocumentTypeEnum.EXTRACT: "Выписка из государственного реестра",
        DocumentTypeEnum.CORPORATE_DECISION: "Решение участников или акционеров",
        DocumentTypeEnum.EMPLOYMENT_CONTRACT: "Трудовой договор с работником",
        DocumentTypeEnum.DISMISSAL_ORDER: "Приказ об увольнении работника",
        DocumentTypeEnum.WORK_CERTIFICATE: "Справка с места работы",
        DocumentTypeEnum.CERTIFICATE: "Официальная справка",
        DocumentTypeEnum.REFERENCE: "Выписка из документа или реестра",
        DocumentTypeEnum.REPORT: "Отчет или заключение",
        DocumentTypeEnum.LETTER: "Деловое или официальное письмо",
        DocumentTypeEnum.OTHER: "Прочий документ",
    }

    def __init__(self, value: DocumentTypeEnum):
        """
        Создает экземпляр типа документа.

        Args:
            value: Тип документа из перечисления
        """
        self._value = value

    @classmethod
    def create(cls, value: str) -> Result["DocumentType"]:
        """
        Создает экземпляр типа документа с валидацией.

        Args:
            value: Строковое значение типа документа

        Returns:
            Result с DocumentType или ошибкой
        """
        try:
            document_type_enum = DocumentTypeEnum(value)
            return Result.ok(cls(document_type_enum))
        except ValueError:
            valid_types = ", ".join([t.value for t in DocumentTypeEnum])
            return Result.fail(
                f"Invalid document type: {value}. "
                f"Valid types: {valid_types}"
            )

    @property
    def value(self) -> DocumentTypeEnum:
        """Возвращает значение перечисления"""
        return self._value

    @property
    def display_name(self) -> str:
        """Возвращает отображаемое название на русском"""
        return self.DISPLAY_NAMES.get(self._value, self._value.value)

    @property
    def description(self) -> str:
        """Возвращает описание типа документа"""
        return self.DESCRIPTIONS.get(self._value, "")

    @property
    def is_contract(self) -> bool:
        """Проверяет, является ли документ договором"""
        return self._value in {
            DocumentTypeEnum.CONTRACT,
            DocumentTypeEnum.AGREEMENT,
            DocumentTypeEnum.EMPLOYMENT_CONTRACT,
        }

    @property
    def is_court_document(self) -> bool:
        """Проверяет, является ли документ судебным"""
        return self._value in {
            DocumentTypeEnum.COURT_DECISION,
            DocumentTypeEnum.COURT_ORDER,
            DocumentTypeEnum.APPEAL,
            DocumentTypeEnum.CASSATION,
            DocumentTypeEnum.CLAIM,
            DocumentTypeEnum.PROTOCOL,
            DocumentTypeEnum.MINUTES,
            DocumentTypeEnum.SUMMONS,
        }

    @property
    def is_accident_related(self) -> bool:
        """Проверяет, относится ли документ к ДТП"""
        return self._value in {
            DocumentTypeEnum.ACCIDENT_REPORT,
            DocumentTypeEnum.INSURANCE_CLAIM,
            DocumentTypeEnum.DAMAGE_ASSESSMENT,
        }

    def _get_equality_components(self) -> tuple:
        """Возвращает компоненты для сравнения"""
        return (self._value,)

    def __str__(self) -> str:
        """Строковое представление"""
        return self.display_name

    def __repr__(self) -> str:
        """Представление для отладки"""
        return f"DocumentType({self._value.value})"
