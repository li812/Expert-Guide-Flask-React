from flask import Blueprint, request, jsonify, session
from functools import wraps
import time
import logger
import os
from db.db_models import db, Users, Login, Complaints, Careers, CourseType, Course, InstitutionType, Institution, CourseMapping

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
    update_admin_password,  
    get_all_careers,
    add_career,
    update_career,
    delete_career,
    get_all_course_types,
    add_course_type,
    update_course_type,
    delete_course_type,
    get_all_courses,
    add_course,
    update_course,
    delete_course,
    get_all_institute_types,
    add_institute_type,
    update_institute_type,
    delete_institute_type,
    get_all_institutes,
    add_institute,
    update_institute,
    delete_institute,
    delete_course_mapping,
    update_course_mapping,
    add_course_mapping,
    get_all_course_mappings
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

from services.assesment_services import (
    get_assessment_questions,
    process_assessment
)
from services.course_services import (
    get_course_mapping_details,
    get_course_dislikes,
    get_course_filters,
    get_course_likes,
    get_filtered_courses,
    calculate_institution_rating,
    update_course_rating,
    get_institution_details
    )

# Database models
from db.db_models import Users, Login, UserType, Complaints, Questions, Careers

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
        # print("Fetching user profile...")
        
        # Get login_id from session
        login_id = session.get('login_id')
        # print(f"Login ID from session: {login_id}")

        if not login_id:
            print("No login_id in session")
            return jsonify({'error': 'Not authenticated'}), 401

        # Query user data
        user = Users.query.filter_by(login_id=login_id).first()
        # print(f"Found user: {user}")

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
        # print(f"Fetching complaints for login_id: {login_id}")
        
        complaints = get_user_complaints(login_id)
        if "error" in complaints:
            return jsonify(complaints), 400
            
        # print(f"Returning complaints data: {complaints}")
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
            return jsonify({'error': result["error"]}), 500
            
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
            return jsonify({'error': result["error"]}), 500
            
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



@api.route('/api/assessment/questions', methods=['GET'])
@check_session(required_type=2)  # User only
def get_assessment_questions_route():
    try:
        result = get_assessment_questions()
        if "error" in result:
            return jsonify({"error": result["error"]}), 500
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/assessment/submit', methods=['POST'])
@check_session(required_type=2)
def submit_assessment_route():
    try:
        data = request.json
        answers = data.get('answers')
        
        if not answers:
            return jsonify({"error": "No answers provided"}), 400
            
        result = process_assessment(answers)
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 500
            
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500




@api.route('/api/admin/course-types', methods=['GET'])
@check_session(required_type=1)  # Admin only
def get_all_course_types_route():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        sort_key = request.args.get('sort', 'course_type_id')
        sort_direction = request.args.get('direction', 'asc')

        result = get_all_course_types(
            page=page,
            per_page=per_page,
            sort_key=sort_key,
            sort_direction=sort_direction
        )

        if "error" in result:
            return jsonify({"error": result["error"]}), 400

        return jsonify(result)
    except Exception as e:
        print(f"Error fetching course types: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/admin/course-types', methods=['POST'])
@check_session(required_type=1)  # Admin only
def add_course_type_route():
    try:
        data = request.get_json()
        course_type_text = data.get('course_type')
        
        if not course_type_text:
            return jsonify({"error": "Course type text is required"}), 400

        result = add_course_type(course_type_text)
        if "error" in result:
            return jsonify({"error": result["error"]}), 400

        return jsonify(result), 201
    except Exception as e:
        print(f"Error adding course type: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/admin/course-types/<int:course_type_id>', methods=['PUT'])
@check_session(required_type=1)  # Admin only
def update_course_type_route(course_type_id):
    try:
        data = request.get_json()
        course_type_text = data.get('course_type')
        
        if not course_type_text:
            return jsonify({"error": "Course type text is required"}), 400

        result = update_course_type(course_type_id, course_type_text)
        if "error" in result:
            return jsonify({"error": result["error"]}), 400

        return jsonify(result)
    except Exception as e:
        print(f"Error updating course type: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/admin/course-types/<int:course_type_id>', methods=['DELETE'])
@check_session(required_type=1)  # Admin only
def delete_course_type_route(course_type_id):
    try:
        result = delete_course_type(course_type_id)
        if "error" in result:
            return jsonify({"error": result["error"]}), 400

        return jsonify({"message": "Course type deleted successfully"})
    except Exception as e:
        print(f"Error deleting course type: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
    
    
    

@api.route('/api/admin/courses', methods=['GET'])
@check_session(required_type=1)  # Admin only
def get_all_courses_route():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        sort_key = request.args.get('sort', 'course_id')
        sort_direction = request.args.get('direction', 'asc')

        # Get paginated courses
        result = get_all_courses(
            page=page,
            per_page=per_page,
            sort_key=sort_key,
            sort_direction=sort_direction
        )

        if "error" in result:
            return jsonify({"error": result["error"]}), 400

        return jsonify(result)
    except Exception as e:
        print(f"Error fetching courses: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/admin/courses', methods=['POST'])
@check_session(required_type=1)  # Admin only
def add_course_route():
    try:
        data = request.get_json()
        result = add_course(data)
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify({"course": result}), 201
    except Exception as e:
        print(f"Error adding course: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/admin/courses/<int:course_id>', methods=['PUT'])
@check_session(required_type=1)  # Admin only
def update_course_route(course_id):
    try:
        data = request.get_json()
        result = update_course(course_id, data)
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify({"course": result})
    except Exception as e:
        print(f"Error updating course: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/admin/courses/<int:course_id>', methods=['DELETE'])
@check_session(required_type=1)  # Admin only
def delete_course_route(course_id):
    try:
        result = delete_course(course_id)
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify({"message": result["message"]})
    except Exception as e:
        print(f"Error deleting course: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@api.route('/api/admin/institute-types', methods=['GET'])
@check_session(required_type=1)  # Admin only
def get_all_institute_types_route():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        sort_key = request.args.get('sort', 'institution_type_id')
        sort_direction = request.args.get('direction', 'asc')

        # Get paginated institution types
        result = get_all_institute_types(
            page=page,
            per_page=per_page,
            sort_key=sort_key,
            sort_direction=sort_direction
        )

        if "error" in result:
            return jsonify({"error": result["error"]}), 400

        return jsonify(result)
    except Exception as e:
        print(f"Error fetching institution types: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/admin/institute-types', methods=['POST'])
@check_session(required_type=1)  # Admin only
def add_institute_type_route():
    try:
        data = request.get_json()
        if not data or 'institution_type' not in data:
            return jsonify({"error": "Missing institution type"}), 400
            
        result = add_institute_type(data['institution_type'])
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify({"instituteType": result}), 201
    except Exception as e:
        print(f"Error adding institution type: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/admin/institute-types/<int:institute_type_id>', methods=['PUT'])
@check_session(required_type=1)  # Admin only
def update_institute_type_route(institute_type_id):
    try:
        data = request.get_json()
        if not data or 'institution_type' not in data:
            return jsonify({"error": "Missing institution type"}), 400
            
        result = update_institute_type(institute_type_id, data['institution_type'])
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify({"instituteType": result})
    except Exception as e:
        print(f"Error updating institution type: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/admin/institute-types/<int:institute_type_id>', methods=['DELETE'])
@check_session(required_type=1)  # Admin only
def delete_institute_type_route(institute_type_id):
    try:
        result = delete_institute_type(institute_type_id)
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify({"message": result["message"]})
    except Exception as e:
        print(f"Error deleting institution type: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
@api.route('/api/admin/institutes', methods=['GET'])
@check_session(required_type=1)  # Admin only
def get_all_institutes_route():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        sort_key = request.args.get('sort', 'institution_id')
        sort_direction = request.args.get('direction', 'asc')

        # Get paginated institutions
        result = get_all_institutes(
            page=page,
            per_page=per_page,
            sort_key=sort_key,
            sort_direction=sort_direction
        )

        if "error" in result:
            return jsonify({"error": result["error"]}), 400

        return jsonify(result)
    except Exception as e:
        print(f"Error fetching institutions: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/admin/institutes', methods=['POST'])
@check_session(required_type=1)  # Admin only
def add_institute_route():
    try:
        # Get form data and files
        institute_data = request.form.to_dict()
        logo_file = request.files.get('logoPicture')
        
        result = add_institute(institute_data, logo_file)
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify({"institute": result}), 201
    except Exception as e:
        print(f"Error adding institution: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/admin/institutes/<int:institute_id>', methods=['PUT'])
@check_session(required_type=1)  # Admin only
def update_institute_route(institute_id):
    try:
        # Get form data and files
        institute_data = request.form.to_dict()
        logo_file = request.files.get('logoPicture')
        
        result = update_institute(institute_id, institute_data, logo_file)
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify({"institute": result})
    except Exception as e:
        print(f"Error updating institution: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/admin/institutes/<int:institute_id>', methods=['DELETE'])
@check_session(required_type=1)  # Admin only
def delete_institute_route(institute_id):
    try:
        result = delete_institute(institute_id)
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify({"message": result["message"]})
    except Exception as e:
        print(f"Error deleting institution: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
    
@api.route('/api/admin/course-mappings', methods=['GET'])
@check_session(required_type=1)  # Admin only
def get_all_course_mappings_route():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        sort_key = request.args.get('sort', 'course_mapping_id')
        sort_direction = request.args.get('direction', 'asc')

        result = get_all_course_mappings(
            page=page,
            per_page=per_page,
            sort_key=sort_key,
            sort_direction=sort_direction
        )

        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/admin/course-mappings', methods=['POST'])
@check_session(required_type=1)  # Admin only
def add_course_mapping_route():
    try:
        mapping_data = request.json
        
        # Validate required fields
        required_fields = ['institution_id', 'course_type_id', 'course_id', 'description', 
                         'fees', 'website', 'student_qualification', 'course_affliation', 
                         'duration']
        
        for field in required_fields:
            if field not in mapping_data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Validate relationships
        institution = Institution.query.get(mapping_data['institution_id'])
        course = Course.query.get(mapping_data['course_id'])
        course_type = CourseType.query.get(mapping_data['course_type_id'])

        if not institution:
            return jsonify({"error": "Invalid institution_id"}), 400
        if not course:
            return jsonify({"error": "Invalid course_id"}), 400
        if not course_type:
            return jsonify({"error": "Invalid course_type_id"}), 400

        result = add_course_mapping(mapping_data)

        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify(result), 201
    except Exception as e:
        print(f"Error in add_course_mapping_route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/admin/course-mappings/<int:mapping_id>', methods=['PUT'])
@check_session(required_type=1)  # Admin only
def update_course_mapping_route(mapping_id):
    try:
        mapping_data = request.json
        result = update_course_mapping(mapping_id, mapping_data)

        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/admin/course-mappings/<int:mapping_id>', methods=['DELETE'])
@check_session(required_type=1)  # Admin only
def delete_course_mapping_route(mapping_id):
    try:
        result = delete_course_mapping(mapping_id)

        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add this new route
@api.route('/api/admin/course-mappings/<int:mapping_id>', methods=['GET'])
def get_course_mapping_details_route(mapping_id):
    """Get detailed information about a course mapping"""
    try:
        result = get_course_mapping_details(mapping_id)
        if "error" in result:
            return jsonify(result), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add these routes after your existing routes



@api.route('/api/courses/search', methods=['GET'])
def search_courses():
    """Search and filter courses"""
    try:
        # Validate page and per_page
        page = max(1, request.args.get('page', 1, type=int))
        per_page = min(max(1, request.args.get('per_page', 12, type=int)), 48)

        # Validate and sanitize fees
        try:
            min_fees = max(0, float(request.args.get('min_fees', 0)))
            max_fees = max(min_fees, float(request.args.get('max_fees', 5000000)))
        except ValueError:
            return jsonify({"error": "Invalid fee values"}), 400

        # Sanitize search term
        search = request.args.get('search', '').strip()

        filters = {
            'search': search,
            'course_types': request.args.getlist('course_types[]'),
            'careers': request.args.getlist('careers[]'),
            'state': request.args.get('state'),
            'district': request.args.get('district'),
            'min_fees': min_fees,
            'max_fees': max_fees,
            'sort_by': request.args.get('sort_by', 'relevance')
        }

        result = get_filtered_courses(filters, page, per_page)
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 400
            
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error in search_courses: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/api/courses/filters', methods=['GET'])
def get_course_filter_options():
    """Get all available filter options"""
    try:
        filters = get_course_filters()
        
        if "error" in filters:
            return jsonify({"error": filters["error"]}), 400
            
        return jsonify(filters)

    except Exception as e:
        print(f"Error in get_course_filter_options: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/courses/<int:mapping_id>/like', methods=['POST'])
@check_session(required_type=2)
def like_course(mapping_id):
    """Like a course"""
    try:
        login_id = session.get('login_id')
        result = update_course_rating(mapping_id, login_id, True)
        
        if "error" in result:
            return jsonify(result), 400
            
        return jsonify(result)
    except Exception as e:
        print(f"Error in like_course: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/courses/<int:mapping_id>/dislike', methods=['POST'])
@check_session(required_type=2)
def dislike_course(mapping_id):
    """Dislike a course"""
    try:
        login_id = session.get('login_id')
        result = update_course_rating(mapping_id, login_id, False)
        
        if "error" in result:
            return jsonify(result), 400
            
        return jsonify(result)
    except Exception as e:
        print(f"Error in dislike_course: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/courses/<int:mapping_id>', methods=['GET'])
def get_course_details(mapping_id):
    """Get course mapping details - public route"""
    try:
        details = get_course_mapping_details(mapping_id)
        if "error" in details:
            return jsonify(details), 404
        return jsonify(details)
    except Exception as e:
        return jsonify({"error": str(e)}), 500