from db.db import users, user_embeddings
import jwt
import os
from bson import ObjectId
from bson.errors import InvalidId

import cv2
import numpy as np
from siameseModel.run_model import app

def resize_with_pad(image, size=(250, 250)):
    if image is None:
        return None
    
    h, w = image.shape[:2]
    sh, sw = size
    aspect = w / h
    if aspect > 1:
        new_w = sw
        new_h = int(sw / aspect)
    else:
        new_h = sh
        new_w = int(sh * aspect)

    img_resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)

    top = (sh - new_h) // 2
    bottom = sh - new_h - top
    left = (sw - new_w) // 2
    right = sw - new_w - left

    img_padded = cv2.copyMakeBorder(img_resized, top, bottom, left, right, cv2.BORDER_CONSTANT, value=[0, 0, 0])
    return img_padded

def img_to_embedding(images):
    embeddings_list = []

    for img in images:
        if not img.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
            return {
                "message": "Photo type not supported"
            }

        img = cv2.imdecode(np.frombuffer(img.read(), np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            continue

        img = resize_with_pad(img)

        faces = app.get(img)
        num_faces = len(faces)

        if num_faces == 0:
            # continue
            return -1

        if num_faces > 1:
            # continue
            return +1

        embeddings_list.append(faces[0].normed_embedding.tolist())

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

    if isinstance(embeddings_list, dict) and embeddings_list.get("message")=="Photo type not supported":
        return {
            "message": "Photo type not supported",
            "status": 415
        }

    elif embeddings_list == -1:
        return {
            "message": "No Face Detected",
            "status": 422
        }

    elif embeddings_list == +1:
        return {
            "message": "Multiple Faces Detected",
            "status": 422
        }

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
    input_embedding = np.array(input_embedding)
    val_embedding = np.array(val_embedding)

    similarity = np.dot(input_embedding, val_embedding)

    return similarity

def verify_identity(image, verification_threshold=0.6):
    input_embedding = img_to_embedding(image)

    if isinstance(input_embedding, dict) and input_embedding.get("message")=="Photo type not supported":
        return {
            "message": "Photo type not supported",
            "status": 415
        }

    elif input_embedding == -1:
        return {
            "message": "No Face Detected",
            "status": 422
        }

    elif input_embedding == +1:
        return {
            "message": "Multiple Faces Detected",
            "status": 422
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