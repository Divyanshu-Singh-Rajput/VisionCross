from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI"))

db = client["VisionCross"]

users = db["Users"]

user_embeddings = db["User Embeddings"]

posts = db["posts"]