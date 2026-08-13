from pydantic import BaseModel


class ImportRowError(BaseModel):
    row: int  # spreadsheet row number, for the user to find it easily
    identifier: str  # whatever we could read off that row (name/email), for context
    error: str


class EmployeeImportResult(BaseModel):
    total_rows: int
    created: int
    updated: int
    skipped: int
    errors: list[ImportRowError]
