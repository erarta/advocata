"""
Storage Service

Сервис для работы с S3/MinIO хранилищем файлов.
"""
import io
from typing import Optional
import boto3
from botocore.exceptions import ClientError

from app.shared.domain.result import Result
from app.core.config import settings


class StorageService:
    """
    Сервис для работы с S3-совместимым хранилищем.

    Поддерживает:
    - Загрузку файлов
    - Скачивание файлов
    - Удаление файлов
    - Генерацию pre-signed URLs для прямого доступа

    Использует AWS S3 SDK (boto3) и совместим с MinIO.
    """

    def __init__(
        self,
        endpoint_url: Optional[str] = None,
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        bucket_name: Optional[str] = None,
        region: Optional[str] = None,
    ):
        """
        Инициализирует S3 клиент.

        Args:
            endpoint_url: URL эндпоинта S3/MinIO (для локальной разработки)
            access_key: AWS Access Key ID
            secret_key: AWS Secret Access Key
            bucket_name: Имя bucket для хранения файлов
            region: AWS регион
        """
        self.endpoint_url = endpoint_url or getattr(settings, "S3_ENDPOINT_URL", None)
        self.access_key = access_key or getattr(settings, "S3_ACCESS_KEY", None)
        self.secret_key = secret_key or getattr(settings, "S3_SECRET_KEY", None)
        self.bucket_name = bucket_name or getattr(
            settings, "S3_BUCKET_NAME", "advocata-documents"
        )
        self.region = region or getattr(settings, "S3_REGION", "us-east-1")

        # Создаем S3 клиент
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region,
        )

        # Проверяем/создаем bucket при инициализации
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self) -> None:
        """
        Проверяет существование bucket и создает его при необходимости.
        """
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            if error_code == "404":
                # Bucket не существует, создаем
                try:
                    if self.region == "us-east-1":
                        self.s3_client.create_bucket(Bucket=self.bucket_name)
                    else:
                        self.s3_client.create_bucket(
                            Bucket=self.bucket_name,
                            CreateBucketConfiguration={"LocationConstraint": self.region},
                        )
                except ClientError as create_error:
                    # Bucket уже может быть создан другим процессом
                    pass

    async def upload_file(
        self,
        file_content: bytes,
        storage_path: str,
        mime_type: str,
    ) -> Result[str]:
        """
        Загружает файл в S3.

        Args:
            file_content: Содержимое файла (bytes)
            storage_path: Путь для хранения в S3
            mime_type: MIME-тип файла

        Returns:
            Result с URL файла или ошибкой
        """
        try:
            # Создаем file-like object из bytes
            file_obj = io.BytesIO(file_content)

            # Загружаем в S3
            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                storage_path,
                ExtraArgs={
                    "ContentType": mime_type,
                    "ServerSideEncryption": "AES256",  # Шифрование на стороне сервера
                },
            )

            # Формируем URL файла
            if self.endpoint_url:
                # MinIO или локальный S3
                file_url = f"{self.endpoint_url}/{self.bucket_name}/{storage_path}"
            else:
                # AWS S3
                file_url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{storage_path}"

            return Result.ok(file_url)

        except ClientError as e:
            error_message = str(e)
            return Result.fail(f"Failed to upload file to S3: {error_message}")
        except Exception as e:
            return Result.fail(f"Unexpected error during file upload: {str(e)}")

    async def download_file(self, storage_path: str) -> Result[bytes]:
        """
        Скачивает файл из S3.

        Args:
            storage_path: Путь к файлу в S3

        Returns:
            Result с содержимым файла (bytes) или ошибкой
        """
        try:
            # Скачиваем файл
            file_obj = io.BytesIO()
            self.s3_client.download_fileobj(
                self.bucket_name,
                storage_path,
                file_obj,
            )

            # Возвращаем содержимое
            file_obj.seek(0)
            content = file_obj.read()

            return Result.ok(content)

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            if error_code == "NoSuchKey":
                return Result.fail(f"File not found in storage: {storage_path}")
            return Result.fail(f"Failed to download file from S3: {str(e)}")
        except Exception as e:
            return Result.fail(f"Unexpected error during file download: {str(e)}")

    async def delete_file(self, storage_path: str) -> Result[None]:
        """
        Удаляет файл из S3.

        Args:
            storage_path: Путь к файлу в S3

        Returns:
            Result с успехом или ошибкой
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=storage_path,
            )

            return Result.ok()

        except ClientError as e:
            return Result.fail(f"Failed to delete file from S3: {str(e)}")
        except Exception as e:
            return Result.fail(f"Unexpected error during file deletion: {str(e)}")

    async def generate_presigned_url(
        self,
        storage_path: str,
        expiration: int = 3600,
    ) -> Result[str]:
        """
        Генерирует pre-signed URL для временного доступа к файлу.

        Args:
            storage_path: Путь к файлу в S3
            expiration: Время жизни URL в секундах (по умолчанию 1 час)

        Returns:
            Result с pre-signed URL или ошибкой
        """
        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": storage_path,
                },
                ExpiresIn=expiration,
            )

            return Result.ok(url)

        except ClientError as e:
            return Result.fail(f"Failed to generate presigned URL: {str(e)}")
        except Exception as e:
            return Result.fail(f"Unexpected error during URL generation: {str(e)}")

    async def file_exists(self, storage_path: str) -> bool:
        """
        Проверяет существование файла в S3.

        Args:
            storage_path: Путь к файлу в S3

        Returns:
            True если файл существует, False иначе
        """
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=storage_path,
            )
            return True
        except ClientError:
            return False
        except Exception:
            return False

    async def get_file_metadata(self, storage_path: str) -> Result[dict]:
        """
        Получает метаданные файла из S3.

        Args:
            storage_path: Путь к файлу в S3

        Returns:
            Result с метаданными или ошибкой
        """
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=storage_path,
            )

            metadata = {
                "content_type": response.get("ContentType"),
                "content_length": response.get("ContentLength"),
                "last_modified": response.get("LastModified"),
                "etag": response.get("ETag"),
            }

            return Result.ok(metadata)

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            if error_code == "404":
                return Result.fail(f"File not found in storage: {storage_path}")
            return Result.fail(f"Failed to get file metadata: {str(e)}")
        except Exception as e:
            return Result.fail(f"Unexpected error during metadata retrieval: {str(e)}")
