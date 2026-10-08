from pydantic import BaseModel, EmailStr


class DocumentData(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    company: str | None = None
    role: str | None = None
    location: str | None = None