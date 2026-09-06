from pydantic import BaseModel, Field, ValidationError

class StoreUserEmbeddings(BaseModel):
    user_id: str = Field(min_length=1, max_length=30)
    embeddings_list: list[list[float]]

def validate_embedding(user_id, embeddings_list):
    try:
        StoreUserEmbeddings(user_id=user_id, embeddings_list=embeddings_list)
        return True
    except ValidationError:
        return False