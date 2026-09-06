from flask import Blueprint, request
from controllers.admin_controller import show_all_users_controller,update_users_controller, delete_post_controller

admin_routes = Blueprint("admin_routes", __name__)

@admin_routes.route("/users", methods=["GET"])
def show_all_users():
    return show_all_users_controller(request)

@admin_routes.route("/users/update", methods=["PATCH", "DELETE"])
def update():
    return update_users_controller(request)

@admin_routes.route("/posts/delete", methods=["DELETE"])
def delete_post():
    return delete_post_controller(request)