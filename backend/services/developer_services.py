from db.db_models import db, APIs, Developers, Login, Complaints
from datetime import datetime
import os
import string
import random
import traceback

def generate_api(api_data, logo):
    try:
        def generate_unique_api_key():
            characters = string.ascii_letters + string.digits
            while True:
                api_key = ''.join(random.choices(characters, k=15))
                if not APIs.query.filter_by(api_key=api_key).first():
                    return api_key
        
        api_key = generate_unique_api_key()
        
        # Create API record
        new_api = APIs(
            login_id=api_data['login_id'],
            api_key=api_key,
            api_name=api_data['apiName'],
            website_app=api_data['websiteApp'],
            website_app_logo=None,  # Placeholder for logo path
            status='active'
        )
        db.session.add(new_api)
        db.session.flush()  # Get api_id

        # Save logo if provided
        if logo:
            logo_path = f"API_data/website_app_logo/{new_api.api_id}.jpg"
            os.makedirs(os.path.dirname(logo_path), exist_ok=True)
            logo.save(logo_path)
            new_api.website_app_logo = logo_path

        # Commit the API record
        db.session.commit()
        
        # Convert the APIs object to a dictionary
        api_dict = {
            'api_id': new_api.api_id,
            'login_id': new_api.login_id,
            'api_key': new_api.api_key,
            'api_name': new_api.api_name,
            'website_app': new_api.website_app,
            'website_app_logo': new_api.website_app_logo,
            'created_at': new_api.created_at,
            'status': new_api.status
        }
        
        return {"api": api_dict}
    except Exception as e:
        print(f"Exception in generate_api: {str(e)}")
        traceback.print_exc()
        db.session.rollback()
        return {"error": str(e)}

def get_apis_by_developer(login_id):
    try:
        apis = APIs.query.filter_by(login_id=login_id).all()
        return [{
            'api_id': api.api_id,
            'api_key': api.api_key,
            'api_name': api.api_name,
            'website_app': api.website_app,
            'website_app_logo': api.website_app_logo,
            'status': api.status,
            'created_at': api.created_at
        } for api in apis]
    except Exception as e:
        return {"error": str(e)}

def update_api_status(api_id, new_status):
    try:
        api = APIs.query.filter_by(api_id=api_id).first()
        if not api:
            return {"error": "API not found"}
            
        # Validate status value
        if new_status not in ['active', 'inactive']:
            return {"error": "Invalid status value"}
            
        api.status = new_status
        db.session.commit()
        
        # Return complete API object
        return {
            'api_id': api.api_id,
            'api_key': api.api_key,
            'api_name': api.api_name, 
            'website_app': api.website_app,
            'website_app_logo': api.website_app_logo,
            'status': api.status,
            'created_at': api.created_at
        }
    except Exception as e:
        db.session.rollback()
        print(f"Error updating API status: {str(e)}")
        return {"error": str(e)}

def delete_api(api_id):
    try:
        api = APIs.query.filter_by(api_id=api_id).first()
        if api:
            db.session.delete(api)
            db.session.commit()
            return {"message": "API deleted successfully"}
        return {"error": "API not found"}
    except Exception as e:
        print(f"Exception in delete_api: {str(e)}")
        traceback.print_exc()
        db.session.rollback()
        return {"error": str(e)}

def get_developer_stats(login_id):
    try:
        api_count = APIs.query.filter_by(login_id=login_id).count()
        active_apps = APIs.query.filter_by(login_id=login_id, status='active').count()
        non_active_apps = APIs.query.filter_by(login_id=login_id, status='inactive').count()
        return {
            'api_count': api_count,
            'active_apps': active_apps,
            'non_active_apps': non_active_apps
        }
    except Exception as e:
        return {"error": str(e)}

def get_developer_profile(login_id):
    try:
        developer = Developers.query.filter_by(login_id=login_id).first()
        if not developer:
            return {"error": "Developer not found"}

        return {
            "full_name": developer.full_name,
            "email": developer.email,
            "phone": developer.phone,
            "gitHubUsername": developer.gitHubUsername,
            "linkedInUsername": developer.linkedInUsername,
            "typeOfDeveloper": developer.typeOfDeveloper,
            "companyName": developer.companyName,
            "address": developer.address,
            "state": developer.state,
            "district": developer.district,
            "postalPinCode": developer.postalPinCode,
            "profilePicture": f"/developer_data/developer_profile_picture/{developer.login_id}.jpg" if developer.profilePicture else None
        }
    except Exception as e:
        print(f"Error in get_developer_profile: {str(e)}")
        return {"error": str(e)}


def update_developer_profile(login_id, profile_data, profile_picture=None):
    try:
        developer = Developers.query.filter_by(login_id=login_id).first()
        if not developer:
            return {"error": "Developer not found"}

        # Update profile fields
        field_mappings = {
            'fullName': 'full_name',
            'linkedinId': 'linkedInUsername',
            'githubUsername': 'gitHubUsername',
            'developerType': 'typeOfDeveloper'
        }

        for key, value in profile_data.items():
            db_field = field_mappings.get(key, key)
            if hasattr(developer, db_field):
                setattr(developer, db_field, value)

        # Handle profile picture upload
        if profile_picture:
            try:
                # Create directory if it doesn't exist
                picture_directory = "developer_data/developer_profile_picture"
                os.makedirs(picture_directory, exist_ok=True)
                
                # Delete old profile picture if it exists
                if developer.profilePicture:
                    old_picture_path = developer.profilePicture
                    if os.path.exists(old_picture_path):
                        os.remove(old_picture_path)

                # Save new profile picture
                picture_path = f"{picture_directory}/{login_id}.jpg"
                profile_picture.save(picture_path)
                developer.profilePicture = picture_path

            except Exception as e:
                print(f"Error handling profile picture: {str(e)}")
                return {"error": f"Failed to handle profile picture: {str(e)}"}

        db.session.commit()

        return {
            "message": "Profile updated successfully",
            "profile": {
                "full_name": developer.full_name,
                "email": developer.email,
                "phone": developer.phone,
                "gitHubUsername": developer.gitHubUsername,
                "linkedInUsername": developer.linkedInUsername,
                "typeOfDeveloper": developer.typeOfDeveloper,
                "companyName": developer.companyName,
                "address": developer.address,
                "state": developer.state,
                "district": developer.district,
                "postalPinCode": developer.postalPinCode,
                "profilePicture": f"/developer_data/developer_profile_picture/{developer.login_id}.jpg" if developer.profilePicture else None
            }
        }

    except Exception as e:
        db.session.rollback()
        print(f"Error in update_developer_profile: {str(e)}")
        return {"error": str(e)}


def update_developer_password(login_id, current_password, new_password):
    try:
        login = Login.query.filter_by(login_id=login_id).first()
        if not login:
            return {"error": "Developer not found"}
            
        # Verify current password
        if login.password != current_password:
            return {"error": "Current password is incorrect"}
            
        # Update password
        login.password = new_password
        db.session.commit()
        
        return {"message": "Password updated successfully"}
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def get_developer_settings(login_id):
    """Get developer theme settings"""
    try:
        settings = DeveloperSettings.query.filter_by(login_id=login_id).first()
        
        if not settings:
            # Create default settings if none exist
            settings = DeveloperSettings(
                login_id=login_id,
                theme='light',
                font_size='medium',
                density='comfortable',
                animations_enabled=True
            )
            db.session.add(settings)
            db.session.commit()
        
        return {
            "theme": settings.theme,
            "font_size": settings.font_size,
            "density": settings.density,
            "animations_enabled": settings.animations_enabled
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def update_developer_theme_settings(login_id, settings_data):
    """Update developer theme settings"""
    try:
        settings = DeveloperSettings.query.filter_by(login_id=login_id).first()
        
        if not settings:
            settings = DeveloperSettings(
                login_id=login_id,
                theme=settings_data.get('theme', 'light'),
                font_size=settings_data.get('fontSize', 'medium'),
                density=settings_data.get('density', 'comfortable'),
                animations_enabled=settings_data.get('animationsEnabled', True)
            )
            db.session.add(settings)
        else:
            settings.theme = settings_data.get('theme', settings.theme)
            settings.font_size = settings_data.get('fontSize', settings.font_size)
            settings.density = settings_data.get('density', settings.density)
            settings.animations_enabled = settings_data.get('animationsEnabled', settings.animations_enabled)
        
        db.session.commit()
        
        return {
            "theme": settings.theme,
            "font_size": settings.font_size,
            "density": settings.density,
            "animations_enabled": settings.animations_enabled
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def get_complaints(login_id):
    try:
        complaints = Complaints.query.filter_by(sender_login_id=login_id).all()
        return [{
            'id': complaint.complaint_id,
            'subject': complaint.subject,
            'message': complaint.message,
            'send_time': complaint.send_time.strftime('%Y-%m-%d %H:%M:%S'),
            'reply': complaint.reply,
            'reply_time': complaint.reply_time.strftime('%Y-%m-%d %H:%M:%S') if complaint.reply_time else None,
            'status': complaint.status
        } for complaint in complaints]
    except Exception as e:
        return {"error": str(e)}

def create_complaint(login_id, subject, message):
    try:
        new_complaint = Complaints(
            sender_login_id=login_id,
            subject=subject,
            message=message,
            status='pending'
        )
        db.session.add(new_complaint)
        db.session.commit()

        return {
            'id': new_complaint.complaint_id,
            'subject': new_complaint.subject,
            'message': new_complaint.message,
            'send_time': new_complaint.send_time.strftime('%Y-%m-%d %H:%M:%S'),
            'reply': new_complaint.reply,
            'reply_time': new_complaint.reply_time,
            'replier_login_id': new_complaint.replier_login_id,
            'status': new_complaint.status
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def delete_complaint(login_id, complaint_id):
    try:
        complaint = Complaints.query.filter_by(complaint_id=complaint_id, sender_login_id=login_id).first()
        if not complaint:
            return {"error": "Complaint not found"}

        db.session.delete(complaint)
        db.session.commit()

        return {"message": "Complaint deleted successfully"}
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def update_complaint(login_id, complaint_id, data):
    try:
        complaint = Complaints.query.filter_by(complaint_id=complaint_id, sender_login_id=login_id).first()
        if not complaint:
            return {"error": "Complaint not found"}

        # Update fields
        if 'subject' in data:
            complaint.subject = data['subject']
        if 'message' in data:
            complaint.message = data['message']
        if 'reply' in data:
            complaint.reply = data['reply']
            complaint.reply_time = datetime.utcnow()
            complaint.status = 'solved'

        db.session.commit()

        # Return updated complaint
        return {
            'id': complaint.complaint_id,
            'subject': complaint.subject,
            'message': complaint.message,
            'send_time': complaint.send_time.strftime('%Y-%m-%d %H:%M:%S'),
            'reply': complaint.reply,
            'reply_time': complaint.reply_time.strftime('%Y-%m-%d %H:%M:%S') if complaint.reply_time else None,
            'status': complaint.status
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def get_complaint_details(login_id, complaint_id):
    try:
        complaint = Complaints.query.filter_by(
            complaint_id=complaint_id, 
            sender_login_id=login_id
        ).first()
        
        if not complaint:
            return {"error": "Complaint not found"}

        return {
            'id': complaint.complaint_id,
            'subject': complaint.subject,
            'message': complaint.message,
            'send_time': complaint.send_time.strftime('%Y-%m-%d %H:%M:%S'),
            'reply': complaint.reply,
            'reply_time': complaint.reply_time.strftime('%Y-%m-%d %H:%M:%S') if complaint.reply_time else None,
            'status': complaint.status
        }
    except Exception as e:
        return {"error": str(e)}

