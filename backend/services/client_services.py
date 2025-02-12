from db.db_models import db, APIs, Users, Login, UserType
from services.face_lock import check_user_face
from datetime import datetime, timedelta
import jwt
import os

def client_validate_api_key(api_key):
    """Validate API key and return API details"""
    try:
        api = APIs.query.filter_by(api_key=api_key, status='active').first()
        if not api:
            return {"error": "Invalid or inactive API key"}
        return {"api_id": api.api_id, "developer_id": api.login_id}
    except Exception as e:
        return {"error": str(e)}

def handle_client_authentication(api_key, username, video_data=None):
    """Handle authentication request from client apps"""
    try:
        # Validate API key
        api_result = client_validate_api_key(api_key) 
        if "error" in api_result:
            return api_result

        # Check if user exists
        user = Login.query.filter_by(username=username).first()
        if not user:
            return {"error": "User not found"}

        # Handle face verification if provided
        if video_data:
            success = check_user_face(username, video_data)
            if not success:
                return {"error": "Face verification failed"}

        # Generate authentication token
        token = jwt.encode(
            {
                "user_id": user.login_id,
                "exp": datetime.utcnow() + timedelta(days=1)
            },
            os.getenv("JWT_SECRET_KEY"),
            algorithm="HS256"
        )

        return {
            "success": True,
            "token": token,
            "user": {
                "id": user.login_id,
                "username": user.username
            }
        }

    except Exception as e:
        return {"error": str(e)}

def client_register_user(api_key, user_data, video_data):
    """Register new user through client application"""
    try:
        # Validate API key
        api_result = client_validate_api_key(api_key)
        if "error" in api_result:
            return api_result

        # Create user login
        login = Login(
            username=user_data['username'],
            password=user_data['password'],
            type_id=2  # User type
        )
        db.session.add(login)
        db.session.flush()

        # Create user profile
        user = Users(
            login_id=login.login_id,
            full_name=user_data['full_name'],
            email=user_data['email'],
            phone=user_data.get('phone', ''),
            address=user_data.get('address', ''),
            state=user_data.get('state', ''),
            district=user_data.get('district', ''),
            postalPinCode=user_data.get('pincode', ''),
            dateOfBirth=datetime.strptime(user_data['dateOfBirth'], '%Y-%m-%d')
        )
        db.session.add(user)
        db.session.commit()

        # Register face data
        from services.face_lock import register_user_face_video
        face_result = register_user_face_video(user_data['username'], video_data)
        
        if not face_result:
            db.session.rollback()
            return {"error": "Failed to register facial data"}

        return {
            "message": "User registered successfully",
            "user_id": user.user_id
        }

    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}
    
    
    
    
    
def client_verify_user_type(username, api_key):
    """Verify username and API key validity"""
    try:
        print(f"Verifying user type for username: {username}")
        print(f"Using API key: {api_key}")

        # First validate API key
        api = APIs.query.filter_by(api_key=api_key, status='active').first()
        if not api:
            print("Invalid or inactive API key")
            return False

        # Then check user type
        user = Login.query.filter_by(username=username).first()
        if not user:
            print("User not found")
            return False

        user_type = UserType.query.filter_by(type_id=user.type_id).first()
        is_valid = bool(user_type and user_type.type == 'user')
        print(f"User type validation result: {is_valid}")
        return is_valid

    except Exception as e:
        print(f"Error in verify_user_type: {str(e)}")
        return False


    
    
    
def client_verify_user_face(api_key, video_data, username):
    """Verify face video for Expert_Guide authentication"""
    try:
        print(f"\nStarting face verification:")
        print(f"Username: {username}")
        print(f"API Key: {api_key}")

        # Validate inputs
        if not all([username, api_key, video_data]):
            return {"success": False, "error": "Missing required parameters"}

        # Validate API key
        api_result = client_validate_api_key(api_key)
        print(f"API validation result: {api_result}")
        
        if "error" in api_result:
            return {"success": False, "error": api_result["error"]}

        # Process video
        temp_dir = "temp_videos"
        os.makedirs(temp_dir, exist_ok=True)
        video_path = os.path.join(temp_dir, f"{username}_verify.webm")
        
        try:
            # Read video data as bytes
            video_data_bytes = video_data.read()
            with open(video_path, "wb") as video_file:
                video_file.write(video_data_bytes)
            
            # Perform face verification
            verification_success = check_user_face(username, video_path)
            print(f"Face verification result: {verification_success}")

            # Return properly formatted response
            if verification_success:
                return {"success": True, "message": "Face verification successful"}
            else:
                return {"success": False, "error": "Face verification failed"}

        finally:
            if os.path.exists(video_path):
                os.remove(video_path)
                print(f"Cleaned up temp file: {video_path}")

    except Exception as e:
        print(f"Error in verify_user_face: {str(e)}")
        return {"success": False, "error": str(e)}


    
def verify_client_password(api_key, username, password):
    """Verify user password for Expert_Guide authentication"""
    try:
        # Validate API key logic (assuming validate_api_key exists)
        api_result = client_validate_api_key(api_key)
        if "error" in api_result:
            return {"error": "Invalid API key"}

        # Lookup user from database (using Login model)
        user = Login.query.filter_by(username=username).first()
        if not user:
            return {"error": "User not found"}
        if user.password == password:
            return {"success": True}
        else:
            return {"success": False, "error": "Invalid credentials"}
    except Exception as e:
        return {"error": str(e)}


