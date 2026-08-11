from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class DataResetRequest(BaseModel):
    """Confirmation-gated — requires the caller's own password plus typing
    the literal phrase 'RESET' so this can't be triggered by a stray
    click or a scripted retry."""
    password: str
    confirm: Literal["RESET"]


class DataResetResponse(BaseModel):
    backup_filename: str
    tables_cleared: list[str]
    users_removed: int
    message: str


class BackupInfo(BaseModel):
    filename: str
    size_bytes: int
    created_at: datetime
