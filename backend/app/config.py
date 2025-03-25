import os
from typing import Optional
from pydantic import BaseModel, Field, validator
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings with environment variable validation
    """
    # Database settings
    DB_HOST: str = Field(..., env="DB_HOST")
    DB_PORT: int = Field(5432, env="DB_PORT")
    DB_NAME: str = Field(..., env="DB_NAME")
    DB_USER: str = Field(..., env="DB_USER")
    DB_PASSWORD: str = Field(..., env="DB_PASSWORD")
    
    # AWS settings
    AWS_ACCESS_KEY: str = Field(..., env="AWS_ACCESS_KEY")
    AWS_SECRET_KEY: str = Field(..., env="AWS_SECRET_KEY")
    AWS_REGION: str = Field("us-west-2", env="AWS_REGION")
    AWS_CUSTOM_LABELS_BUCKET: str = Field("brand-protection-custom-labels", env="AWS_CUSTOM_LABELS_BUCKET")
    
    # Storage paths
    STORAGE_PATH: str = Field("./storage", env="STORAGE_PATH")
    
    # API keys
    ANTHROPIC_API_KEY: str = Field(..., env="ANTHROPIC_API_KEY")
    
    # Celery settings
    CELERY_BROKER_URL: str = Field("redis://localhost:6379/0", env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field("redis://localhost:6379/0", env="CELERY_RESULT_BACKEND")
    
    # JPlag settings
    JPLAG_JAR_PATH: str = Field("./lib/jplag.jar", env="JPLAG_JAR_PATH")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @validator("STORAGE_PATH")
    def create_storage_dirs(cls, v):
        """Create storage directories if they don't exist"""
        os.makedirs(v, exist_ok=True)
        os.makedirs(os.path.join(v, "logos"), exist_ok=True)
        os.makedirs(os.path.join(v, "snapshots"), exist_ok=True)
        os.makedirs(os.path.join(v, "assets"), exist_ok=True)
        os.makedirs(os.path.join(v, "evidence"), exist_ok=True)
        os.makedirs(os.path.join(v, "custom_datasets"), exist_ok=True)
        return v


@lru_cache()
def get_settings() -> Settings:
    """
    Get application settings from environment variables with caching
    """
    try:
        return Settings()
    except Exception as e:
        missing_fields = []
        if hasattr(e, "errors"):
            for error in e.errors():
                if error["type"] == "missing":
                    missing_fields.append(error["loc"][0])
        
        if missing_fields:
            error_message = f"Missing required environment variables: {', '.join(missing_fields)}"
            raise ValueError(error_message) from e
        raise e 