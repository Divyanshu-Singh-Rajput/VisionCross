import os
import jwt
import bcrypt
from flask import jsonify
from controllers.embeddings_controller import store_embeddings, verify_identity
from db.db import users
from bson import ObjectId
from bson.errors import InvalidId
from models.users_model import validate_details

def register_user_controller(request):
    data = request.json

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    embedding_status = False
    clearance_level = 0

    is_valid = validate_details(username, email, password, embedding_status, clearance_level)

    if not is_valid:
        return jsonify({
            "message": "Invalid Credentials"
        }), 400

    is_already_present = users.find_one({
        "$or":[
         {"username": username},
         {"email": email}
        ]
    })

    if is_already_present:
        return jsonify({
            "message": "User already present"
        }), 409

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    result = users.insert_one({
        "username": username,
        "email": email,
        "password": hashed_password,
        "embedding_status": embedding_status,
        "clearance_level": clearance_level
    })

    if result.acknowledged:
        token = jwt.encode({
            "id": str(result.inserted_id)
        }, os.getenv("JWT_SECRET"), algorithm="HS256")

        response = jsonify({
            "message": "User created successfully",
            "user": {
                "username": username,
                "email": email,
                "embedding_status": embedding_status
            }
        })

        response.set_cookie("token", token)
        
        return response, 201

    else:
        return jsonify({
            "message": "Error in registering, please try again"
        }), 500

def login_controller(request):
    username = request.json.get("username")
    email = request.json.get("email")
    password = request.json.get("password")

    user_details = users.find_one({
        "$or":[
            {"username": username},
            {"email": email}   
        ]
    })

    if not user_details:
        return jsonify({
            "message": "Invalid credentials"
        }), 401

    hashed_password = user_details["password"]

    is_valid = bcrypt.checkpw(
        password.encode("utf-8"), 
        hashed_password.encode("utf-8")
    )

    if not is_valid:
        return jsonify({
            "message": "Invalid credentials"
        }), 401

    token = jwt.encode({
        "id": str(user_details["_id"])
        }, 
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )

    response = jsonify({
        "message": "Logged in successfully",
        "User": user_details["username"]
    })
    response.set_cookie("token", token)

    return response, 200

def upload_photos_controller(request):
    response = store_embeddings(request)

    return jsonify({
        "message": response.get("message")
    }), response.get("status")

def face_scan_login_controller(request):
    image = request.files.getlist("photos")
    result = verify_identity(image)

    if result.get("status") == 415:
        return jsonify({
            "message": result.get("message")
        }), result.get("status")

    if result.get("status") == 401:
        return jsonify({
            "message": result.get("message")
        }), result.get("status")

    if result.get("status") == 204:
        return jsonify({
            "message": result.get("message")
        }), result.get("status")
    
    try:
        user_id = result.get("user_id")

        if not user_id:
            return jsonify({
                "message": "Invalid User Id"
            }), 400
        
        user_id = ObjectId(user_id)
    except (InvalidId, KeyError):
        return jsonify({
            "message": "Bad request"
        }), 400

    user = users.find_one({"_id": user_id})
    if not user:
        return jsonify({
            "message": "User doesn't exist"
        }), 404

    username = user.get("username")
    
    response = jsonify({
        "message": result.get("message"),
        "username": username,
        "similarity_score": result.get("similarity_score")
    })

    token = jwt.encode({
        "id": str(user_id)
    }, os.getenv("JWT_SECRET"), algorithm="HS256")

    response.set_cookie("token", token)

    return response

def user_info_controller(request):
    token = request.cookies.get("token")

    if not token:
        return jsonify({
            "message": "No token found"
        }), 401
    try:
        user_id = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"]).get("id")
        user_id = ObjectId(user_id)
    except (InvalidId, jwt.InvalidTokenError, KeyError):
        return jsonify({
            "message": "Invalid token"
        }), 401

    is_valid = users.find_one({
        "_id": user_id
    })

    if not is_valid:
        return jsonify({
            "message": "User doesn't exist"
        }), 404

    return jsonify({
        "message": "User details fetched successfully",
        "username": is_valid.get("username"),
        "email": is_valid.get("email"),
        "embedding_status": is_valid.get("embedding_status")
    }), 200