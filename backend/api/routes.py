from flask import Blueprint, request, jsonify, session
from functools import wraps
import time
import os
from db.db_models import Complaints, db, Questions
from datetime import datetime

# Service imports
from services.sum_service import calculate_sum_service
from services.llm_chat_service import generate_content
from services.db_service import (
    authenticate_user,
    get_user_type,
    get_username_by_login_id,
    register_user,
    check_credentials,
    verify_password
)
from services.face_lock import (
    check_user_face,
    register_user_face_video
)
from services.session_management import (
    init_session,
    clear_session,
    check_session,
)
from services.admin_services import (
    get_all_users,
    delete_user,
    get_server_info,
    get_all_user_complaints,
    reply_to_user_complaints,
    update_admin_password,  # Ensure this import is present
    get_all_careers,
    add_career,
    update_career,
    delete_career
)
from services.question_services import (
    get_all_questions,
    add_question,
    update_question,
    delete_question,
    validate_question
)

from services.user_services import (
    get_user_stats, 
    user_update_password,
    get_user_complaints, 
    create_user_complaint,  
    update_user_profile, 
    update_user_facial_data, 
    delete_user_facial_data
)

# Database models
from db.db_models import Users, Login, UserType, Complaints

api = Blueprint('api', __name__)

@api.route('/api/calculate-sum', methods=['POST', 'OPTIONS'])
def calculate_sum():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        num1 = float(data.get('num1', 0))
        num2 = float(data.get('num2', 0))
        result = calculate_sum_service(num1, num2)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

request_times = []

def rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        now = time.time()
        request_times.append(now)
        request_times[:] = [t for t in request_times if t > now - 60]
        if len(request_times) > 60:
            return jsonify({'error': 'Rate limit exceeded'}), 429
        return f(*args, **kwargs)
    return decorated_function

@api.route('/v1/generate', methods=['POST'])
@rate_limit
def generate():
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({'error': 'No prompt provided'}), 400
        
        result = generate_content(data['prompt'])
        return jsonify({'response': result})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/v1/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'healthy',
        'model': 'gemini-1.5-flash'
    })

@api.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate_user(username, password)
        if user:
            init_session(user['login_id'], user['type_id'])
            return jsonify({
                'login_id': user['login_id'],
                'type_id': user['type_id']
            })
            
        return jsonify({'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/api/logout', methods=['POST'])
def logout():
    clear_session()
    return jsonify({'message': 'Logged out successfully'})

@api.route('/api/user', methods=['POST'])
def user():
    try:
        data = request.json
        login_id = data.get('login_id')
        if not login_id:
            return jsonify({'error': 'No login_id provided'}), 400
        
        # Handle the login_id as needed
        print(f"Received login_id: {login_id}")
        return jsonify({'message': 'Login ID received successfully'})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/api/get-username', methods=['POST'])
def get_username():
    try:
        data = request.json
        login_id = data.get('login_id')
        if not login_id:
            return jsonify({'error': 'No login_id provided'}), 400
        
        username = get_username_by_login_id(login_id)
        if username:
            return jsonify({'username': username})
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/api/register-user', methods=['POST', 'OPTIONS'])
def user_registration_api():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        # Get form data and files
        user_data = request.form.to_dict()
        profile_picture = request.files.get('profilePicture')
        
        # Validate required fields
        required_fields = ['username', 'password', 'email', 'full_name']
        for field in required_fields:
            if field not in user_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Add type_id for user
        user_data['type_id'] = 2  # User type
        
        # Register user
        result = register_user(user_data, profile_picture)
        
        if "error" in result:
            return jsonify(result), 400

        return jsonify(result), 201
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# Correct the route definition for verify-face
@api.route('/api/verify-face', methods=['POST']) 
def verify_face():
    print("Received verify-face request") 
    try:
        if 'video' not in request.files:
            print("No video file in request")
            return jsonify({'error': 'No video file provided'}), 400
            
        video_file = request.files['video']
        username = request.form.get('username')
        
        print(f"Processing verification video for user: {username}")
        
        if not username:
            print("No username provided")
            return jsonify({'error': 'No username provided'}), 400
            
        # Create temp directory for verification videos
        temp_dir = os.path.join(os.getcwd(), 'temp_verification')
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save video temporarily
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = secure_filename(f"verify_{username}_{timestamp}.webm")
        filepath = os.path.join(temp_dir, filename)
        
        print(f"Saving verification video to: {filepath}")
        video_file.save(filepath)
        
        # Verify face
        print("Processing video for face verification")
        success = check_user_face(username, filepath)
        
        # Cleanup temp file
        os.remove(filepath)
        
        if success:
            print("Face verification successful")
            # Initialize session
            user = Login.query.filter_by(username=username).first()
            if user:
                init_session(user.login_id, user.type_id)
            return jsonify({
                'success': True,
                'message': 'Face verification successful'
            })
        else:
            print("Face verification failed")
            return jsonify({
                'success': False,
                'message': 'Face verification failed'
            }), 401
            
    except Exception as e:
        print(f"Error in face verification: {str(e)}")
        return jsonify({'error': str(e)}), 500


# Protect admin routes
@api.route('/api/admin/users', methods=['GET', 'OPTIONS'])
@check_session(required_type=1)  # Admin type_id = 1
def get_users():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        users = get_all_users()
        return jsonify({'users': users})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/api/admin/users/<int:login_id>', methods=['DELETE', 'OPTIONS'])
@check_session(required_type=1)  # Admin type_id = 1
def delete_user_route(login_id):
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        delete_user(login_id)
        return jsonify({'message': 'User deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/api/admin/stats', methods=['GET'])
@check_session(required_type=1)  # Admin type_id = 1
def get_admin_stats():
    try:
        user_count = Users.query.count()
        
        
        # Specify the onclause for the join
        pending_user_complaints = Complaints.query.join(Login, Complaints.sender_login_id == Login.login_id).filter(Login.type_id == 2, Complaints.status == 'pending').count()
        
        return jsonify({
            'user_count': user_count,
            'pending_user_complaints': pending_user_complaints,
        })
    except Exception as e:
        print(f"Error in get_admin_stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Update the question routes to use the services
@api.route('/api/admin/questions', methods=['GET'])
@check_session(required_type=1)  # Admin only
def get_all_questions_route():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        sort_key = request.args.get('sort', 'question_id')
        sort_direction = request.args.get('direction', 'asc')

        # Get paginated questions
        result = get_all_questions(
            page=page,
            per_page=per_page,
            sort_key=sort_key,
            sort_direction=sort_direction
        )

        if "error" in result:
            return jsonify({'error': result["error"]}), 500

        return jsonify(result)
    except Exception as e:
        print(f"Error fetching questions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/api/admin/questions', methods=['POST'])
@check_session(required_type=1)  # Admin only
def add_question_route():
    try:
        data = request.get_json()
        question_text = data.get('question')
        
        # Validate question
        is_valid, error_message = validate_question(question_text)
        if not is_valid:
            return jsonify({'error': error_message}), 400
            
        result = add_question(question_text)
        if "error" in result:
            return jsonify({'error': result["error"]}), 500
            
        return jsonify({'question': result}), 201
    except Exception as e:
        print(f"Error adding question: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/api/admin/questions/<int:question_id>', methods=['PUT'])
@check_session(required_type=1)  # Admin only
def update_question_route(question_id):
    try:
        data = request.get_json()
        question_text = data.get('question')
        
        # Validate question
        is_valid, error_message = validate_question(question_text)
        if not is_valid:
            return jsonify({'error': error_message}), 400
            
        result = update_question(question_id, question_text)
        if "error" in result:
            if result["error"] == "Question not found":
                return jsonify({'error': result["error"]}), 404
            return jsonify({'error': result["error"]}), 500
            
        return jsonify({'question': result})
    except Exception as e:
        print(f"Error updating question: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/api/admin/questions/<int:question_id>', methods=['DELETE'])
@check_session(required_type=1)  # Admin only
def delete_question_route(question_id):
    try:
        result = delete_question(question_id)
        if "error" in result:
            if result["error"] == "Question not found":
                return jsonify({'error': result["error"]}), 404
            return jsonify({'error': result["error"]}), 500
            
        return jsonify({'message': result["message"]})
    except Exception as e:
        print(f"Error deleting question: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Protect user routes  
@api.route('/api/user/profile', methods=['GET'])
@check_session(required_type=2)  # User type_id = 2 
def get_user_profile():
    try:
        print("Fetching user profile...")
        
        # Get login_id from session
        login_id = session.get('login_id')
        print(f"Login ID from session: {login_id}")

        if not login_id:
            print("No login_id in session")
            return jsonify({'error': 'Not authenticated'}), 401

        # Query user data
        user = Users.query.filter_by(login_id=login_id).first()
        print(f"Found user: {user}")

        if not user:
            print("User not found")
            return jsonify({'error': 'User not found'}), 404

        # Construct response data
        profile_data = {
            'full_name': user.full_name,
            'email': user.email,
            'phone': user.phone,
            'gender': user.gender,
            'dateOfBirth': user.dateOfBirth.strftime('%Y-%m-%d'),
            'address': user.address,
            'state': user.state,
            'district': user.district,
            'postalPinCode': user.postalPinCode,
            'profilePicture': f"/user_data/user_profile_picture/{user.login_id}.jpg" if user.profilePicture else None
        }
        
        # print(f"Returning profile data: {profile_data}")
        return jsonify(profile_data)

    except Exception as e:
        print(f"Error in get_user_profile: {str(e)}")
        return jsonify({'error': str(e)}), 500



@api.route('/api/check-session', methods=['POST', 'OPTIONS'])
def check_session_status():
    if request.method == 'OPTIONS':
        return '', 204
        
    # print(f"Session during check: {session}")
    if 'login_id' not in session:
        return jsonify({'authenticated': False}), 401
        
    return jsonify({
        'authenticated': True,
        'type_id': session.get('type_id'),
        'login_id': session.get('login_id'),
        'username': get_username_by_login_id(session.get('login_id'))
    })

@api.route('/api/admin/server-info', methods=['GET'])
@check_session(required_type=1)  # Admin type_id = 1
def server_info_route():
    try:
        server_info = get_server_info()
        if 'error' in server_info:
            return jsonify({'error': server_info['error']}), 500
        return jsonify(server_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500




# Add these new routes for user complaints
@api.route('/api/admin/user-complaints', methods=['GET'])
@check_session(required_type=1)
def get_all_user_complaints_route():
    try:
        complaints = get_all_user_complaints()
        if "error" in complaints:
            return jsonify(complaints), 500
        return jsonify({'complaints': complaints})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/api/admin/user-complaints/<int:complaint_id>/reply', methods=['PUT']) 
@check_session(required_type=1)
def admin_reply_user_complaint_route(complaint_id):
    try:
        data = request.get_json()
        reply = data.get('reply')
        replier_login_id = session.get('login_id')

        if not reply:
            return jsonify({'error': 'Reply is required'}), 400

        result = reply_to_user_complaints(complaint_id, reply, replier_login_id)
        if "error" in result:
            return jsonify(result), 500
        return jsonify({'complaint': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/api/admin/update-password', methods=['PUT', 'OPTIONS'])
@check_session(required_type=1)  # Admin only
def admin_update_password_route():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Missing required fields'}), 400
            
        login_id = session.get('login_id')
        result = update_admin_password(login_id, current_password, new_password)
        
        if "error" in result:
            return jsonify(result), 400
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/api/check-credentials', methods=['POST'])
def check_credentials_route():
    """Check user credentials and return user type"""
    try:
        data = request.json
        identifier = data.get('identifier')
        
        if not identifier:
            return jsonify({"error": "Identifier is required"}), 400
            
        result = check_credentials(identifier)
        
        if "error" in result:
            status_code = 404 if result.get("exists") is False else 500
            return jsonify(result), status_code
            
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in check_credentials_route: {str(e)}")
        return jsonify({"error": str(e)}), 500



@api.route('/api/verify-password', methods=['POST'])
def verify_password_route():
    try:
        data = request.json
        identifier = data.get('identifier')
        password = data.get('password')

        if not identifier or not password:
            return jsonify({
                "success": False,
                "error": "Missing identifier or password"
            }), 400

        # Verify password
        result = verify_password(identifier, password)
        
        # Only initialize session if password verification was successful
        if result.get("success"):
            # Initialize session
            init_session(result["login_id"], result["type"])
            return jsonify(result)
        
        # Return error response if verification failed
        return jsonify(result), 401

    except Exception as e:
        print(f"Error in verify_password_route: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Server error during verification"
        }), 500



# Add this new route
import os
from werkzeug.utils import secure_filename

@api.route('/api/save-face-video', methods=['POST'])
def save_face_video():
    print("Received save-face-video request")
    try:
        if 'video' not in request.files:
            print("No video file in request")
            return jsonify({'error': 'No video file provided'}), 400
            
        video_file = request.files['video']
        username = request.form.get('username')
        
        print(f"Processing video for user: {username}")
        
        if not username:
            print("No username provided")
            return jsonify({'error': 'No username provided'}), 400
            
        if not video_file or video_file.filename == '':
            return jsonify({'error': 'No video file selected'}), 400
            
        # Create videos directory structure
        base_dir = os.path.join(os.getcwd(), 'user_data')
        temp_dir = os.path.join(base_dir, 'temp_videos')
        os.makedirs(temp_dir, exist_ok=True)
        
        # Generate timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Create filename with username and timestamp
        filename = secure_filename(f"{username}_{timestamp}.webm")
        filepath = os.path.join(temp_dir, filename)
        
        print(f"Saving video to: {filepath}")
        video_file.save(filepath)
        
        # Register face from video
        print("Processing video for face registration")
        success = register_user_face_video(username, filepath)
        
        if success:
            print("Face registration successful")
            return jsonify({
                'message': 'Video saved and processed successfully',
                'filepath': filepath
            }), 200
        else:
            print("Face registration failed")
            return jsonify({'error': 'Failed to process video for face registration'}), 400
            
    except Exception as e:
        print(f"Error saving video: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/api/user/home-stats', methods=['GET'])
@check_session(required_type=2)  # User type_id = 2
def get_user_home_stats():
    try:
        # print("Starting get_user_home_stats route")
        login_id = session.get('login_id')
        # print(f"login_id from session: {login_id}")
        
        if not login_id:
            print("No login_id found in session")
            return jsonify({'error': 'Not authenticated'}), 401
            
        # Get stats from service
        # print("Calling get_user_stats service")
        stats = get_user_stats(login_id)
        # print(f"Stats received from service: {stats}")
        
        if "error" in stats:
            print(f"Error in stats: {stats['error']}")
            return jsonify({'error': stats["error"]}), 500
            
        # print("Successfully got user stats")
        return jsonify(stats)

    except Exception as e:
        print(f"Error in get_user_home_stats: {str(e)}")
        return jsonify({'error': str(e)}), 500



@api.route('/api/user/update-password', methods=['PUT'])
@check_session(required_type=2)  # User type_id = 2
def user_update_password_route():
    try:
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        login_id = session.get('login_id')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Missing required fields'}), 400

        result = user_update_password(current_password, new_password, login_id)
        
        if "error" in result:
            return jsonify(result), 400
            
        return jsonify({'message': 'Password updated successfully'})

    except Exception as e:
        print(f"Error in user_update_password_route: {str(e)}")
        return jsonify({'error': str(e)}), 500


@api.route('/api/user/profile', methods=['GET'])
@check_session(required_type=2)  # User type_id = 2
def get_user_profile_route():
    try:
        login_id = session.get('login_id')
        # print(f"Fetching profile for login_id: {login_id}")
        
        profile = get_user_profile(login_id)
        if "error" in profile:
            return jsonify(profile), 400
            
        # print(f"Returning profile data: {profile}")
        return jsonify(profile)
        
    except Exception as e:
        print(f"Error in get_user_profile_route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/user/profile', methods=['PUT'])
@check_session(required_type=2)  # User type_id = 2
def update_user_profile_route():
    try:
        login_id = session.get('login_id')
        profile_data = request.form.to_dict()
        profile_picture = request.files.get('profilePicture')
        
        print(f"Updating profile for login_id: {login_id}")
        print(f"Profile data received: {profile_data}")
        
        result = update_user_profile(login_id, profile_data, profile_picture)
        if "error" in result:
            return jsonify(result), 400
            
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in update_user_profile_route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/user/facial-data', methods=['DELETE'])
@check_session(required_type=2)
def delete_facial_data_route():
    try:
        login_id = session.get('login_id')
        print(f"Deleting facial data for login_id: {login_id}")
        
        result = delete_user_facial_data(login_id)
        if "error" in result:
            return jsonify(result), 400
            
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in delete_facial_data_route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/user/facial-data', methods=['PUT'])
@check_session(required_type=2)
def update_facial_data_route():
    try:
        if 'video' not in request.files:
            return jsonify({"error": "No video file provided"}), 400
            
        login_id = session.get('login_id')
        video_file = request.files['video']
        
        print(f"Updating facial data for login_id: {login_id}")
        result = update_user_facial_data(login_id, video_file)
        
        if "error" in result:
            return jsonify(result), 400
            
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in update_facial_data_route: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    
@api.route('/api/user/complaints', methods=['POST'])
@check_session(required_type=2)  # User type_id = 2
def create_user_complaint():
    try:
        login_id = session.get('login_id')
        data = request.json
        
        new_complaint = Complaints(
            sender_login_id=login_id,
            subject=data['subject'],
            message=data['message'],
            status='pending'
        )
        
        db.session.add(new_complaint)
        db.session.commit()
        
        return jsonify({
            'complaint': {
                'id': new_complaint.complaint_id,
                'subject': new_complaint.subject,
                'message': new_complaint.message,
                'status': new_complaint.status,
                'send_time': new_complaint.send_time.strftime('%Y-%m-%d %H:%M:%S')
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating complaint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/user/complaints', methods=['GET'])
@check_session(required_type=2)  # User type_id = 2
def get_user_complaints_route():
    try:
        login_id = session.get('login_id')
        print(f"Fetching complaints for login_id: {login_id}")
        
        complaints = get_user_complaints(login_id)
        if "error" in complaints:
            return jsonify(complaints), 400
            
        print(f"Returning complaints data: {complaints}")
        return jsonify({'complaints': complaints})
        
    except Exception as e:
        print(f"Error in get_user_complaints_route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/user/complaints', methods=['POST'])
@check_session(required_type=2)
def create_user_complaint_route():
    try:
        login_id = session.get('login_id')
        data = request.json
        
        if not data or 'subject' not in data or 'message' not in data:
            return jsonify({"error": "Missing required fields"}), 400
            
        result = create_user_complaint(login_id, data['subject'], data['message'])
        
        if "error" in result:
            return jsonify(result), 400
            
        return jsonify({"complaint": result}), 201
        
    except Exception as e:
        print(f"Error in create_user_complaint_route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/user/complaints/<int:complaint_id>', methods=['DELETE'])
@check_session(required_type=2)
def delete_user_complaint_route(complaint_id):
    try:
        login_id = session.get('login_id')
        
        # First verify complaint belongs to user
        complaint = Complaints.query.filter_by(
            complaint_id=complaint_id,
            sender_login_id=login_id
        ).first()
        
        if not complaint:
            return jsonify({"error": "Complaint not found"}), 404
            
        db.session.delete(complaint)
        db.session.commit()
        
        return jsonify({"message": "Complaint deleted successfully"})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_user_complaint_route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/user/complaints/<int:complaint_id>', methods=['GET'])
@check_session(required_type=2)
def get_user_complaint_details_route(complaint_id):
    try:
        login_id = session.get('login_id')
        
        complaint = Complaints.query.filter_by(
            complaint_id=complaint_id,
            sender_login_id=login_id
        ).first()
        
        if not complaint:
            return jsonify({"error": "Complaint not found"}), 404
            
        return jsonify({
            "complaint": {
                "id": complaint.complaint_id,
                "subject": complaint.subject,
                "message": complaint.message,
                "send_time": complaint.send_time.strftime('%Y-%m-%d %H:%M:%S'),
                "reply": complaint.reply,
                "reply_time": complaint.reply_time.strftime('%Y-%m-%d %H:%M:%S') if complaint.reply_time else None,
                "status": complaint.status
            }
        })
        
    except Exception as e:
        print(f"Error in get_user_complaint_details_route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/admin/careers', methods=['GET'])
@check_session(required_type=1)  # Admin only
def get_all_careers_route():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        sort_key = request.args.get('sort', 'career_id')
        sort_direction = request.args.get('direction', 'asc')

        # Get paginated careers
        result = get_all_careers(
            page=page,
            per_page=per_page,
            sort_key=sort_key,
            sort_direction=sort_direction
        )

        if "error" in result:
            print(f"Error in get_all_careers_route: {result['error']}")  # Add logging
            return jsonify({'error': result["error"]}), 500

        return jsonify(result)
    except Exception as e:
        print(f"Error fetching careers: {str(e)}")  # Add logging
        return jsonify({'error': str(e)}), 500
    
    
@api.route('/api/admin/careers', methods=['POST'])
@check_session(required_type=1)  # Admin only
def add_career_route():
    try:
        data = request.get_json()
        career_text = data.get('career')
        
        if not career_text:
            return jsonify({'error': 'Career text is required'}), 400

        result = add_career(career_text)
        if "error" in result:
            return jsonify({'error': result["error"]}), 400
            
        return jsonify({'career': result}), 201
    except Exception as e:
        print(f"Error adding career: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/api/admin/careers/<int:career_id>', methods=['PUT'])
@check_session(required_type=1)  # Admin only
def update_career_route(career_id):
    try:
        data = request.get_json()
        career_text = data.get('career')
        
        if not career_text:
            return jsonify({'error': 'Career text is required'}), 400

        result = update_career(career_id, career_text)
        if "error" in result:
            if result["error"] == "Career not found":
                return jsonify({'error': result["error"]}), 404
            return jsonify({'error': result["error"]}), 400
            
        return jsonify({'career': result})
    except Exception as e:
        print(f"Error updating career: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/api/admin/careers/<int:career_id>', methods=['DELETE'])
@check_session(required_type=1)  # Admin only
def delete_career_route(career_id):
    try:
        result = delete_career(career_id)
        if "error" in result:
            if result["error"] == "Career not found":
                return jsonify({'error': result["error"]}), 404
            return jsonify({'error': result["error"]}), 500
            
        return jsonify({'message': 'Career deleted successfully'})
    except Exception as e:
        print(f"Error deleting career: {str(e)}")
        return jsonify({'error': str(e)}), 500






