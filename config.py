import os 
from dotenv import load_dotenv

load_dotenv()

SENDER_EMAIL = os.getenv("SENDER_EMAIL")
API_TOKEN = os.getenv("API_TOKEN")
APP_PASSWORD = os.getenv("APP_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))

if not API_TOKEN:
    raise Exception("API_TOKEN manquant dans .env")

if not SENDER_EMAIL or not APP_PASSWORD:
    raise Exception("Config mail invalide")

if not SMTP_PORT or not SMTP_SERVER:
    raise Exception("Config SMTP invalide")