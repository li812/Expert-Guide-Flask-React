import os
from datetime import datetime, timedelta
from db.db_models import db, Users, Login, Complaints

def get_user_stats(login_id):
    """Get user statistics"""
    try:
        # print(f"Fetching stats for login_id: {login_id}")
        user_login = Login.query.filter_by(login_id=login_id).first()
        
        if not user_login:
            return {"error": "User not found"}

        # Format dates safely
        last_login_str = user_login.last_login.strftime('%Y-%m-%d %H:%M:%S') if user_login.last_login else 'Never'
        created_at_str = user_login.created_at.strftime('%Y-%m-%d') if user_login.created_at else 'Unknown'
        
        activities = [
            f"Last login: {last_login_str}",
            f"Total logins: {user_login.login_count or 0}",
            f"Account created: {created_at_str}"
        ]

        return {
            "totalLogins": user_login.login_count or 0,
            "lastLogin": last_login_str,
            "activities": activities
        }
    except Exception as e:
        print(f"Error in get_user_stats: {str(e)}")
        return {"error": str(e)}

def user_update_password(current_password, new_password, login_id):
    user = Login.query.get(login_id)
    if not user or not user.check_password(current_password):
        return {"error": "Current password is incorrect"}
    
    user.set_password(new_password)
    db.session.commit()
    return {"message": "Password updated successfully"}

def get_user_profile(login_id):
    try:
        user = Users.query.filter_by(login_id=login_id).first()
        
        if not user:
            return {"error": "User not found"}

        # Remove ID fields from response
        return {
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "state": user.state,
            "district": user.district,
            "postalPinCode": user.postalPinCode,
            "profilePicture": f"/user_data/user_profile_picture/{user.login_id}.jpg" if user.profilePicture else None
        }
    except Exception as e:
        return {"error": str(e)}

def update_user_profile(login_id, profile_data, profile_picture=None):
    """Update user profile"""
    try:
        print(f"Updating profile for login_id: {login_id}")
        user = Users.query.filter_by(login_id=login_id).first()
        
        if not user:
            return {"error": "User not found"}

        # List of protected fields
        protected_fields = ['gender', 'dateOfBirth', 'aadhaar', 'pan', 'passport']
        
        # Update only allowed fields
        for key, value in profile_data.items():
            if hasattr(user, key) and key not in protected_fields:
                setattr(user, key, value)

        # Handle profile picture
        if profile_picture:
            try:
                picture_directory = "user_data/user_profile_picture"
                os.makedirs(picture_directory, exist_ok=True)
                picture_path = f"{picture_directory}/{login_id}.jpg"
                profile_picture.save(picture_path)
                user.profilePicture = picture_path
            except Exception as e:
                print(f"Error handling profile picture: {str(e)}")
                return {"error": f"Failed to save profile picture: {str(e)}"}

        db.session.commit()
        return {"message": "Profile updated successfully"}
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in update_user_profile: {str(e)}")
        return {"error": str(e)}

def delete_user_facial_data(login_id):
    """Delete user's facial data"""
    try:
        user = Users.query.filter_by(login_id=login_id).first()
        if not user:
            return {"error": "User not found"}
            
        from services.face_lock import delete_user_face
        username = Login.query.filter_by(login_id=login_id).first().username
        delete_user_face(username)
        
        return {"message": "Facial data deleted successfully"}
    except Exception as e:
        print(f"Error deleting facial data: {str(e)}")
        return {"error": str(e)}

def update_user_facial_data(login_id, video_file):
    """Update user's facial data by first deleting existing data"""
    try:
        print("Starting facial data update process...")
        user = Users.query.filter_by(login_id=login_id).first()
        if not user:
            return {"error": "User not found"}
            
        username = Login.query.filter_by(login_id=login_id).first().username
        print(f"Updating facial data for user: {username}")
        
        # First delete existing facial data
        from services.face_lock import delete_user_face
        delete_user_face(username)
        print("Existing facial data deleted")
        
        # Save and process new video
        from services.face_lock import register_user_face_video
        temp_dir = "temp_videos"
        os.makedirs(temp_dir, exist_ok=True)
        video_path = os.path.join(temp_dir, f"{username}_update.webm")
        
        print(f"Saving video to: {video_path}")
        video_file.save(video_path)
        
        # Process video and update facial data
        success = register_user_face_video(username, video_path)
        
        # Cleanup
        os.remove(video_path)
        print("Temporary video file cleaned up")
        
        if success:
            print("Facial data updated successfully")
            return {"message": "Facial data updated successfully"}
            
        return {"error": "Failed to update facial data"}
        
    except Exception as e:
        print(f"Error updating facial data: {str(e)}")
        return {"error": str(e)}
    
def get_user_complaints(login_id):
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
        print(f"Error in get_user_complaints: {str(e)}")
        return {"error": str(e)}

def create_user_complaint(login_id, subject, message):
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
            'status': new_complaint.status
        }
    except Exception as e:
        db.session.rollback()
        print(f"Error creating user complaint: {str(e)}")
        return {"error": str(e)}