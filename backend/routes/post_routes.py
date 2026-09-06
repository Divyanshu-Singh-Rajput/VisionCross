from flask import Blueprint, request
from controllers.post_controller import create_post_controller, show_all_posts_controller, post_verification_controller

post_routes = Blueprint("post_routes", __name__)

@post_routes.route("/create-post", methods=["POST"])
def create_post():
    return create_post_controller(request)

@post_routes.route("/", methods=["GET"])
def show_all_posts():
    return show_all_posts_controller(request)

@post_routes.route("/verification", methods=["POST"])
def post_verification():
    return post_verification_controller(request)