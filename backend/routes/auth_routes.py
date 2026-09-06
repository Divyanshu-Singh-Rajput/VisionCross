from flask import Blueprint, request
from controllers.auth_controller import register_user_controller, login_controller, upload_photos_controller, face_scan_login_controller, user_info_controller

auth_routes = Blueprint("auth_routes", __name__)

@auth_routes.route("/register", methods=["POST"])
def register_user():
    return register_user_controller(request)

@auth_routes.route("/upload", methods=["POST"])
def upload_photos():
    return upload_photos_controller(request)

@auth_routes.route("/login", methods=["POST"])
def login_user():
    return login_controller(request)

@auth_routes.route("/login/facescan", methods=["POST"])
def face_scan_login():
    return face_scan_login_controller(request)

@auth_routes.route("/info", methods=["GET"])
def user_information():
    return user_info_controller(request)