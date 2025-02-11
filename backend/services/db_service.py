from db.db_models import db, Login, UserType, Users, Developers
from services.face_lock import register_user_face
import os
from datetime import datetime
from sqlalchemy import or_
from db.db_models import db, Login, Users, Developers

def authenticate_user(username, password):
    print(f"Authenticating user: {username}")
    user = Login.query.filter_by(username=username, password=password).first()
    if user:
        print(f"User authenticated: {user.username}")
        return {
            'login_id': user.login_id,
            'type_id': user.type_id
        }
    print("Authentication failed")
    return None

def get_user_type(type_id):
    print(f"Fetching user type for type_id: {type_id}")
    user_type = UserType.query.filter_by(type_id=type_id).first()
    if user_type:
        print(f"User type found: {user_type.type}")
        return user_type.type
    print("User type not found")
    return None

def get_username_by_login_id(login_id):
    # print(f"Fetching username for login_id: {login_id}")
    user = Login.query.filter_by(login_id=login_id).first()
    if user:
        # print(f"Username found: {user.username}")
        return user.username
    print("Username not found")
    return None

def validate_user_data(user_data):
    try:
        date_str = user_data.get('dateOfBirth', '')
        if date_str:
            datetime.strptime(date_str, '%Y-%m-%d')
            return True, None  # Return success correctly
        return False, "Date of birth is required"
    except ValueError:
        return False, "Invalid date format. Use YYYY-MM-DD"

def register_user(user_data, profile_picture):
    try:
        # Validate user data first
        is_valid, error_message = validate_user_data(user_data)
        if not is_valid:
            return {"error": error_message}

        # Create login record
        login = Login(
            username=user_data.get('username'),
            password=user_data.get('password'),
            type_id=user_data.get('type_id', 2)
        )
        db.session.add(login)
        db.session.flush()

        # Create user record
        new_user = Users(
            login_id=login.login_id,
            full_name=user_data.get('full_name'),
            gender=user_data.get('gender'),
            email=user_data.get('email'),
            phone=user_data.get('phone'),
            dateOfBirth=user_data.get('dateOfBirth'),
            address=user_data.get('address'),
            state=user_data.get('state'),
            district=user_data.get('district'),
            postalPinCode=user_data.get('postalPinCode')
        )
        db.session.add(new_user)
        
        # Handle profile picture
        if profile_picture:
            profile_picture_path = f"user_data/user_profile_picture/{login.login_id}.jpg"
            os.makedirs(os.path.dirname(profile_picture_path), exist_ok=True)
            profile_picture.save(profile_picture_path)
            new_user.profilePicture = profile_picture_path

        db.session.commit()
        return {"message": "User registered successfully", "login_id": login.login_id}

    except Exception as e:
        db.session.rollback()
        print(f"Error in register_user: {str(e)}")
        return {"error": str(e)}
    
def register_developer(developer_data, profile_picture):
    try:
        # Validate user data first
        is_valid, error_message = validate_user_data(developer_data)
        if not is_valid:
            return {"error": error_message}

        # Validate date format
        try:
            datetime.strptime(developer_data['dateOfBirth'], '%Y-%m-%d')
        except ValueError:
            return {"error": "Invalid date format"}

        # Create login record
        login = Login(
            username=developer_data.get('username'),
            password=developer_data.get('password'),
            type_id=developer_data.get('type_id', 3)
        )
        db.session.add(login)
        db.session.flush()  # Get login_id

        # Create Developer record
        new_developer = Developers(
            login_id=login.login_id,
            full_name=developer_data.get('full_name'),
            email=developer_data.get('email'),
            phone=developer_data.get('phone'),
            dateOfBirth=developer_data.get('dateOfBirth'),
            gitHubUsername=developer_data.get('gitHubUsername'),
            linkedInUsername=developer_data.get('linkedInUsername'),
            typeOfDeveloper=developer_data.get('typeOfDeveloper'),
            companyName=developer_data.get('companyName', ''),  # Default empty string if not provided
            address=developer_data.get('address'),
            state=developer_data.get('state'),
            district=developer_data.get('district'),
            postalPinCode=developer_data.get('postalPinCode')
        )

        # Add developer to session
        db.session.add(new_developer)  # This was missing

        # Save profile picture if provided
        if profile_picture:
            profile_picture_path = f"developer_data/developer_profile_picture/{login.login_id}.jpg"
            os.makedirs(os.path.dirname(profile_picture_path), exist_ok=True)
            profile_picture.save(profile_picture_path)
            new_developer.profilePicture = profile_picture_path

        # Commit both login and developer records
        db.session.commit()
        print(f"Developer registered successfully with login_id: {login.login_id}")
        return {"message": "Developer registered successfully", "login_id": login.login_id}

    except Exception as e:
        db.session.rollback()
        print("Error in register_developer:", str(e))
        if "Duplicate entry" in str(e):
            if "email" in str(e):
                return {"error": "Email already registered"}
            elif "gitHubUsername" in str(e):
                return {"error": "GitHub username already registered"}
            elif "linkedInUsername" in str(e):
                return {"error": "LinkedIn username already registered"}
            elif "phone" in str(e):
                return {"error": "Phone number already registered"}
        return {"error": str(e)}

def check_credentials(identifier):
    """Check if identifier exists and get user type"""
    print(f"Checking credentials for identifier: {identifier}")
    try:
        # Check admin (username only)
        admin = Login.query.filter_by(username=identifier, type_id=1).first()
        if admin:
            print("Admin credentials found")
            return {
                "exists": True,
                "type": 1,
                "username": admin.username
            }
            
        # Check developer (username or email)
        developer = Login.query.join(Developers).filter(
            or_(
                Login.username == identifier,
                Developers.email == identifier
            )
        ).first()
        if developer:
            print("Developer credentials found")
            return {
                "exists": True,
                "type": 3,
                "username": developer.username
            }
            
        # Check regular user
        user = Login.query.join(Users).filter(
            or_(
                Login.username == identifier,
                Users.email == identifier
            )
        ).first()
        if user:
            print("User credentials found")
            return {
                "exists": True,
                "type": 2,
                "username": user.username
            }
            
        print("Credentials not found")
        return {
            "exists": False,
            "error": "User not found"
        }
        
    except Exception as e:
        print(f"Error checking credentials: {str(e)}")
        return {"error": str(e)}



def verify_password(identifier, password):
    """Verify password and initialize session"""
    print(f"Verifying password for identifier: {identifier}")
    try:
        user = None
        
        # First try username
        user = Login.query.filter_by(username=identifier).first()
        if user:
            print(f"Found user by username")
            # Verify password immediately
            if user.password == password:
                print("Password verified successfully")
                return {
                    "success": True,
                    "type": user.type_id,
                    "login_id": user.login_id
                }
            else:
                print(f"Password mismatch for username login")
                return {
                    "success": False,
                    "error": "Invalid credentials"
                }

        # Try email lookups for Users if not found by username
        user = db.session.query(Login).join(Users).filter(
            Users.email == identifier
        ).first()
        if user:
            print(f"Found user by Users email")
            if user.password == password:
                print("Password verified successfully")
                return {
                    "success": True,
                    "type": user.type_id,
                    "login_id": user.login_id
                }
            else:
                print(f"Password mismatch for user email login")
                return {
                    "success": False,
                    "error": "Invalid credentials"
                }

        # Try email lookups for Developers if still not found
        user = db.session.query(Login).join(Developers).filter(
            Developers.email == identifier
        ).first()
        if user:
            print(f"Found user by Developers email")
            if user.password == password:
                print("Password verified successfully")
                return {
                    "success": True,
                    "type": user.type_id,
                    "login_id": user.login_id
                }
            else:
                print(f"Password mismatch for developer email login")
                return {
                    "success": False,
                    "error": "Invalid credentials"
                }

        print("User not found")
        return {
            "success": False,
            "error": "Invalid credentials"
        }

    except Exception as e:
        print(f"Error verifying password: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }




