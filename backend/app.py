from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from routes.admin_routes import admin_routes
from routes.auth_routes import auth_routes
from routes.post_routes import post_routes

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[r"http://localhost:\d+", r"http://127\.0\.0\.1:\d+"])

app.register_blueprint(admin_routes, url_prefix = "/admin")
app.register_blueprint(auth_routes, url_prefix = "/accounts")
app.register_blueprint(post_routes, url_prefix = "/posts")

if __name__ == "__main__":
    app.run(port=3000, debug=True)