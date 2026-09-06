from flask import jsonify
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError
from db.db import users, posts
import os
import jwt

def is_admin(request):
    token = request.cookies.get("token")

    if not token:
        return {
            "message": "Token not found",
            "status": 401
        }

    try:
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET"),
            algorithms=["HS256"]
        )
        user_id = ObjectId(payload["id"])

    except (jwt.InvalidTokenError, InvalidId, KeyError):
        return {
            "message": "Invalid token",
            "status": 401
        }

    user_details = users.find_one({
        "_id": user_id
    })

    if not user_details:
        return {
            "message": "User doesn't exist",
            "status": 401
        }

    if user_details.get("clearance_level") != 0:
        return {
            "message": "User does not have permission to access this resource",
            "status": 403
        }

    return {
        "message": "Admin",
        "status": 200,
        "user_id": user_id
    }

def show_all_users_controller(request):
    is_admin_res = is_admin(request)

    if is_admin_res.get("status") != 200:
        return jsonify({
            "message": is_admin_res.get("message")
        }), is_admin_res.get("status")

    users_list = list(users.find())

    if not users_list:
        return jsonify({
            "message": "No users available",
            "users_list": []
        }), 200

    for user in users_list:
        user["_id"] = str(user["_id"])

    return jsonify({
        "message": "All users details fetched successfully",
        "users_list": users_list
    }), 200

def update_users_controller(request):
    is_admin_res = is_admin(request)

    if is_admin_res.get("status") != 200:
        return jsonify({
            "message": is_admin_res.get("message")
        }), is_admin_res.get("status")

    if request.method == "PATCH":
        return patch_user(request)
    if request.method == "DELETE":
        return delete_user(request)

def patch_user(request):
    user_id = request.json.get("user_id")
    updates = request.json.get("updates")

    if not updates or not isinstance(updates, dict) or not user_id:
        return jsonify({
            "message": "Bad request"
        }), 400

    update = {}

    if updates.get("username"):
        update["username"] = str(updates["username"])
    if "clearance_level" in updates:
        update["clearance_level"] = updates["clearance_level"]

        if not (type(update.get("clearance_level")) == int and 0 < update.get("clearance_level") <= 4):
            return jsonify({
                "message": "Invalid clearance level"
            }), 400

    if not update:
        return jsonify({
            "message": "No fields found to be updated"
        }), 400

    try:
        user_id = ObjectId(user_id)
    except InvalidId:
        return jsonify({
            "message": "Invalid user_id"
        }), 400

    is_user_valid = users.find_one({
        "_id": user_id
    })

    if not is_user_valid:
        return jsonify({
            "message": "User doesn't exist"
        }), 404   
    
    try:
        users.update_one(
            {"_id": user_id},
            {"$set": update}
        )
    except PyMongoError:
        return jsonify({
            "message": "Bad request"
        }), 400

    return jsonify({
        "message": "User's details updated successfully"
    }), 200

def delete_user(request):
    user_id = request.json.get("user_id")

    try:
        user_id = ObjectId(user_id)
    except InvalidId:
        return jsonify({
            "message": "Invalid user_id"
        }), 400

    is_user_valid = users.find_one({
        "_id": user_id
    })

    if not is_user_valid:
        return jsonify({
            "message": "User doesn't exist"
        }), 404    

    users.delete_one({
        "_id": user_id
    })

    return jsonify({
        "message": "User deleted successfully"
    }), 200

def delete_post_controller(request):
    is_admin_res = is_admin(request)

    if is_admin_res.get("status") != 200:
        return jsonify({
            "message": is_admin_res.get("message")
        }), is_admin_res.get("status")

    post_id = request.json.get("post_id")

    try:
        post_id = ObjectId(post_id)
    except InvalidId:
        return jsonify({
            "message": "Invalid Post Id"
        }), 400

    is_user_valid = posts.find_one({
        "_id": post_id
    })

    if not is_user_valid:
        return jsonify({
            "message": "Post doesn't exist"
        }), 404    

    posts.delete_one({
        "_id": post_id
    })

    return jsonify({
        "message": "Post deleted successfully"
    }), 200