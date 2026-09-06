from pydantic import BaseModel, EmailStr, Field, ValidationError

class UserValidation(BaseModel):
    username: str = Field(min_length=1, max_length=30)
    email: EmailStr
    password: str = Field(min_length=6, max_length=30)
    embedding_status: bool
    clearance_level: int

def validate_details(username, email, password, embedding_status, clearance_level):
    try:
        UserValidation(username=username, email=email, password=password, embedding_status=embedding_status, clearance_level=clearance_level)
        return True
    except ValidationError:
        return False