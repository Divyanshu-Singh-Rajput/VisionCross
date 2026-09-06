from pydantic import BaseModel, Field, ValidationError, HttpUrl
from typing import Literal
from datetime import datetime

class StoreUserEmbeddings(BaseModel):
    username: str = Field(min_length=1, max_length=30)
    caption: str
    created_at: datetime
    clearance_level: Literal[1, 2, 3, 4]
    link: HttpUrl

def validate_post(username, caption, clearance_level, link):
    try:
        StoreUserEmbeddings(username=username, caption=caption, created_at= datetime.now(), clearance_level=clearance_level, link=link)
        return True
    except ValidationError:
        return False