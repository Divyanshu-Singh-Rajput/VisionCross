from db.db import users, user_embeddings
import jwt
import os
from bson import ObjectId
from bson.errors import InvalidId
import torch
import torch.nn.functional as F
from siameseModel.model import model, preprocess, test_transform, device

def img_to_embedding(images):
    embeddings_list = []

    for image in images:
        
        if not image.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
            continue
        
        processed_img = preprocess(image, transform=test_transform).unsqueeze(0).to(device)

        with torch.no_grad():
            img_embedding = model(processed_img).squeeze(0).cpu().tolist()

        embeddings_list.append(img_embedding)

    return embeddings_list

def store_embeddings(request):
    token = request.cookies.get("token")
    images = request.files.getlist("photos")

    if not token:
        return {
            "message": "No token found",
            "status": 401
        }
    try:
        user_id = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])["id"]
        user_id = ObjectId(user_id)
    except (InvalidId, jwt.InvalidTokenError, KeyError):
        return {
            "message": "Invalid token",
            "status": 401
        }

    is_valid = users.find_one({
        "_id": user_id
    })

    if not is_valid:
        return {
            "message": "User doesn't exist",
            "status": 401
        }

    is_embedded = is_valid.get("embedding_status")

    if is_embedded:
        return {
            "message": "User photos has already been embedded",
            "status": 409
        }

    if len(images)!=100:
        return {
            "message": "Exactly 100 photos are required",
            "status": 400
        }

    embeddings_list = img_to_embedding(images)

    user_embeddings.insert_one({
        "user_id": str(user_id),
        "embeddings_list": embeddings_list
    })

    users.update_one(
        {"_id": user_id},
        {"$set": {"embedding_status": True}}
    )

    return {
        "message": "Photos uploaded successfully",
        "status": 201
    }

def calculate_distance(input_embedding, val_embedding):

    val_embedding = torch.tensor(val_embedding, dtype=torch.float32).unsqueeze(0).to(device)
    input_embedding = torch.tensor(input_embedding, dtype=torch.float32).unsqueeze(0).to(device)

    dist = F.pairwise_distance(input_embedding, val_embedding, 2).item()

    similarity = 1.0/(1.0 + dist)

    return similarity

def verify_identity(image, verification_threshold=0):
    input_embedding = img_to_embedding(image)

    if not input_embedding:
        return {
            "message": "Photo type not supported",
            "status": 415
        }

    input_embedding = input_embedding[0]

    user_embeddings_list = list(user_embeddings.find())

    if not user_embeddings_list:
        return {
            "message": "No user's embeddings found",
            "status": 204
        }

    avg_scores = {}

    for user_embedding in user_embeddings_list:
        scores = []
        embeddings = user_embedding.get("embeddings_list")
        for embedding in embeddings:
            scores.append(calculate_distance(input_embedding, embedding))

        if len(scores) > 0:
            scores.sort(reverse=True)
            top_n = scores[:30]  

        avg_scores[user_embedding.get("user_id")] = sum(top_n) / len(top_n)

    best_match = None
    highest_avg = 0
    
    if avg_scores:
        best_match = max(avg_scores, key=avg_scores.get)
        highest_avg = avg_scores[best_match]
        
    if highest_avg >= verification_threshold:
        user_id = best_match
    else:
        user_id = "Unverified"

    if user_id != "Unverified":
        return {
            "message": "Signed in successfully",
            "status": 200,
            "user_id": user_id,
            "similarity_score": highest_avg
        }

    return {
        "message": "Unauthorized",
        "status": 401,
    } 