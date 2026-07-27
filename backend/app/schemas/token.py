from pydantic import BaseModel


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class LoginRequest(BaseModel):
    identifier: str  # official email OR employee ID (Section 7)
    password: str
    mfa_code: str | None = None
    captcha_token: str | None = None


class LoginResponse(BaseModel):
    """Returned on success, OR when MFA/CAPTCHA is required (partial auth)."""
    status: str  # "success" | "mfa_required" | "captcha_required"
    tokens: TokenPair | None = None
