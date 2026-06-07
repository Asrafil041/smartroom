# Replit Backend Configuration File
# Place this in the root of backend Replit project

run = "cd backend && python manage.py runserver 0.0.0.0:8000"
build = "cd backend && pip install -r requirements.txt && python manage.py migrate"

[nix]
channel = "stable-23_11"

[[languages.python.languageServers]]
start = "pylsp"

[env]
DEBUG = "False"
ALLOWED_HOSTS = "*"
CORS_ALLOW_ALL_ORIGINS = "True"
