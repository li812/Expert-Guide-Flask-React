import os
from flask import Flask, send_from_directory
from api.routes import api
from utils.cors import configure_cors
from db.db_config import init_db, ensure_database
from api.websocket_handler import init_websocket, create_websocket_server
from services.face_lock import show_registered_user_face, delete_user_face

app = Flask(__name__)

# Initialize WebSocket
sockets = init_websocket(app)

ENV = os.environ.get("FLASK_ENV", "development")

# Basic config
app.config.update(
    SECRET_KEY='dev-key-123',
    SESSION_COOKIE_SAMESITE='None' if ENV == "production" else 'Lax',  # Set SameSite to None for cross-site requests in production
    SESSION_COOKIE_SECURE=(ENV == "production"),  # Only secure in production (HTTPS)
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_NAME='Expert_Guide_session',
    PERMANENT_SESSION_LIFETIME=1800,
    SESSION_COOKIE_PATH='/',
    SESSION_COOKIE_DOMAIN=None,  # Allow dynamic domain resolution
    REMEMBER_COOKIE_SAMESITE='None' if ENV == "production" else 'Lax'  # For "Remember me" functionality
)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'data/institute_data/institute_logo'

# Configure CORS
configure_cors(app)

run_env = "docker"

# Ensure database exists before initializing app
ensure_database(run_env)
# Initialize database
init_db(app, run_env)

# show_registered_user_face()



print("""

███████╗██╗░░██╗██████╗░███████╗██████╗░████████╗      ░██████╗░██╗░░░██╗██╗██████╗░███████╗  
██╔════╝╚██╗██╔╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝      ██╔════╝░██║░░░██║██║██╔══██╗██╔════╝  
█████╗░░░╚███╔╝░██████╔╝█████╗░░██████╔╝░░░██║░░░      ██║░░██╗░██║░░░██║██║██║░░██║█████╗░░  
██╔══╝░░░██╔██╗░██╔═══╝░██╔══╝░░██╔══██╗░░░██║░░░      ██║░░╚██╗██║░░░██║██║██║░░██║██╔══╝░░  
███████╗██╔╝╚██╗██║░░░░░███████╗██║░░██║░░░██║░░░      ╚██████╔╝╚██████╔╝██║██████╔╝███████╗  
╚══════╝╚═╝░░╚═╝╚═╝░░░░░╚══════╝╚═╝░░╚═╝░░░╚═╝░░░      ░╚═════╝░░╚═════╝░╚═╝╚═════╝░╚══════╝  

░██████╗██╗░░░██╗░██████╗████████╗███████╗███╗░░░███╗
██╔════╝╚██╗░██╔╝██╔════╝╚══██╔══╝██╔════╝████╗░████║
╚█████╗░░╚████╔╝░╚█████╗░░░░██║░░░█████╗░░██╔████╔██║
░╚═══██╗░░╚██╔╝░░░╚═══██╗░░░██║░░░██╔══╝░░██║╚██╔╝██║
██████╔╝░░░██║░░░██████╔╝░░░██║░░░███████╗██║░╚═╝░██║
╚═════╝░░░░╚═╝░░░╚═════╝░░░░╚═╝░░░╚══════╝╚═╝░░░░░╚═╝                 Started Successfully!
""")

app.register_blueprint(api)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Add specific route for profile pictures
@app.route('/data/user_data/user_profile_picture/<filename>')
def serve_user_profile_picture(filename):
    try:
        return send_from_directory('data/user_data/user_profile_picture', filename)
    except:
        return '', 404

# Add route for institute logos
@app.route('/data/institute_data/institute_logo/<filename>')
def serve_institute_logo(filename):
    try:
        return send_from_directory('data/institute_data/institute_logo', filename)
    except:
        return '', 404


if __name__ == '__main__':
    # Use WebSocket server instead of regular Flask server
    server = create_websocket_server(app, port=5001)
    server.serve_forever()





