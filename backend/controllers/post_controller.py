from flask import jsonify, redirect
from db.db import posts, users
from controllers.auth_controller import user_info_controller
from bson import ObjectId
from models.posts_model import validate_post
from controllers.embeddings_controller import verify_identity
from datetime import datetime
from bson.errors import InvalidId
import jwt
import os
import bcrypt

def create_post_controller(request):
    token, status = user_info_controller(request)

    if status == 401:
        return jsonify({
            "message": token.get_json().get("message")
        }), status

    token = request.cookies.get("token")

    try:
        user_id = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"]).get("id")
        user_id = ObjectId(user_id)
    except (jwt.InvalidTokenError, InvalidId, KeyError):
        return jsonify({
            "message": "Invalid token"
        }), 401

    user = users.find_one({
        "_id": user_id
    })

    if not user:
        return jsonify({
            "message": "User doesn't exist"
        }), 404

    data = request.json

    is_post_valid = validate_post(user.get("username"), data.get("caption"), data.get("clearance_level"), data.get("link"))

    if not is_post_valid:
        return jsonify({
            "message": "Invalid details"
        }), 400

    posted = posts.insert_one({
        "username": user.get("username"),
        "post_user_id": user_id,
        "caption": data.get("caption"),
        "clearance_level": data.get("clearance_level"),
        "created_at": datetime.now(),
        "link": data.get("link")
    })

    if posted.acknowledged:
        return jsonify({
            "message": "Post created successfully",
        }), 201

    return jsonify({
        "message": "Error, failed to create the post"
    }), 500

def show_all_posts_controller(request):
    token, status = user_info_controller(request)

    if status == 401:
        return jsonify({
            "message": token.get_json().get("message")
        }), status

    token = request.cookies.get("token")

    try:
        user_id = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])["id"]
        user_id = ObjectId(user_id)
    except (jwt.InvalidTokenError, InvalidId, KeyError):
        return jsonify({
            "message": "Invalid token"
        }), 401

    user = users.find_one({
        "_id": user_id
    })

    if not user:
        return jsonify({
            "message": "User doesn't exist"
        }), 404

    clearance_level = user.get("clearance_level")

    posts_list = posts.find(
        {"clearance_level": {"$gte": clearance_level}},
        {
            "_id": 1,
            "username": 1,
            "post_user_id": 1,
            "caption": 1,
            "created_at": 1,
        }
    )

    posts_list = list(posts_list)

    if not posts_list:
        return jsonify({
            "message": "No posts available",
            "posts": []
        }), 200

    for post in posts_list:
        post["post_user_id"] = str(post["post_user_id"])
        post["_id"] = str(post["_id"])

    return jsonify({
        "message": "Posts fetched successfully",
        "posts": posts_list
    }), 200

def post_verification_controller(request):
    image = request.files.getlist("photos")
    post_id = request.form.get("post_id")
    verification_method = request.form.get("verification_method") or "face-scan"
    result = {}

    if verification_method == "face-scan":
        result = verify_identity(image)

    elif verification_method == "credential":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")

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

        result = {
            "message": "Signed in successfully",
            "status": 200,
            "user_id": str(user_details.get("_id")),
        }

    else:
        return jsonify({
            "message": "Invalid verification method"
        }), 400

    if result.get("status") != 200:
        return jsonify({
            "message": result.get("message")
        }), result.get("status")

    user_id = result.get("user_id")

    auth_info, auth_status = user_info_controller(request)

    if auth_status != 200:
        return jsonify({
            "message": auth_info.get_json().get("message")
        }), auth_status

    try:
        token = jwt.decode(request.cookies.get("token"), os.getenv("JWT_SECRET"), algorithms=["HS256"]).get("id")
    except (jwt.InvalidTokenError, KeyError):
        return jsonify({
            "message": "Invalid token"
        }), 401

    if user_id != token and verification_method=="face-scan":
        return jsonify({
            "message": "Face does not match the signed-in account"
        }), 401
    elif user_id != token and verification_method=="credential":
        return jsonify({
            "message": "Credentials does not match the credentials of signed-in account"
        }), 401

    try:
        post_id = ObjectId(post_id)
    except InvalidId:
        return jsonify({
            "message": "Post doesn't exist"
        }), 404

    try:
        user_id = ObjectId(user_id)
    except InvalidId:
        return jsonify({
            "message": "User doesn't exist"
        }), 404

    post_details = posts.find_one({
        "_id": post_id
    })

    if not post_details:
        return jsonify({
            "message": "post doesn't exist"
        }), 404

    clearance_status = users.find_one({"_id": user_id}).get("clearance_level") <= post_details.get("clearance_level")

    if not clearance_status:
        return jsonify({
            "message": "User doesn't have permission to access this"
        }), 403

    post_link = post_details.get("link")

    return redirect(post_link)