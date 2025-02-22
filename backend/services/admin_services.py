from db.db_models import db, Users, Login, Complaints, Careers, CourseType
import platform
import psutil
import socket
import uuid
from datetime import datetime

def get_all_users():
    users = Users.query.join(Login, Users.login_id == Login.login_id).all()
    return [{
        'login_id': user.login_id,
        'full_name': user.full_name,
        'email': user.email,
        'phone': user.phone,
        'state': user.state,
        'profilePicture': f"/user_data/user_profile_picture/{user.login_id}.jpg" if user.profilePicture else None,
        'username': Login.query.get(user.login_id).username
    } for user in users]

def delete_user(login_id):
    user = Users.query.filter_by(login_id=login_id).first()
    login = Login.query.filter_by(login_id=login_id).first()
    if user:
        db.session.delete(user)
    if login:
        db.session.delete(login)
    db.session.commit()

def get_server_info():
    try:
        uptime = psutil.boot_time()
        cpu_usage = psutil.cpu_percent(interval=1)
        memory_info = psutil.virtual_memory()
        disk_info = psutil.disk_usage('/')
        net_io = psutil.net_io_counters()
        ip_address = socket.gethostbyname(socket.gethostname())
        mac_address = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) for elements in range(0, 2*6, 2)][::-1])
        
        # Get OS, processor, and GPU information
        os_info = platform.system() + " " + platform.release()
        processor_info = platform.processor()
        gpu_info = "N/A"  # Placeholder for GPU info, as psutil does not provide GPU info

        return {
            'uptime': uptime,
            'cpu_usage': cpu_usage * 10,
            'memory_usage': memory_info.percent,
            'total_memory': memory_info.total,
            'used_memory': memory_info.used,
            'free_memory': memory_info.free,
            'total_storage': disk_info.total,
            'used_storage': disk_info.used,
            'free_storage': disk_info.free,
            'ip_address': ip_address,
            'mac_address': mac_address,
            'network_sent': net_io.bytes_sent,
            'network_received': net_io.bytes_recv,
            'timestamp': datetime.utcnow().isoformat(),
            'os_info': os_info,
            'processor_info': processor_info,
            'gpu_info': gpu_info
        }
    except Exception as e:
        print(f"Error fetching server info: {str(e)}")
        return {'error': str(e)}

def get_all_user_complaints():
    try:
        complaints = Complaints.query.join(
            Login,
            Complaints.sender_login_id == Login.login_id
        ).filter(Login.type_id == 2).all()  # User type_id = 2
        
        return [{
            'id': complaint.complaint_id,
            'subject': complaint.subject,
            'message': complaint.message,
            'send_time': complaint.send_time.strftime('%Y-%m-%d %H:%M:%S'),
            'reply': complaint.reply,
            'reply_time': complaint.reply_time.strftime('%Y-%m-%d %H:%M:%S') if complaint.reply_time else None,
            'status': complaint.status,
            'sender_username': Login.query.filter_by(login_id=complaint.sender_login_id).first().username
        } for complaint in complaints]
    except Exception as e:
        return {"error": str(e)}

def reply_to_user_complaints(complaint_id, reply, replier_login_id):
    try:
        complaint = Complaints.query.filter_by(complaint_id=complaint_id).first()
        if not complaint:
            return {"error": "Complaint not found"}

        complaint.reply = reply
        complaint.reply_time = datetime.utcnow()
        complaint.replier_login_id = replier_login_id
        complaint.status = 'solved'
        db.session.commit()

        return {
            'id': complaint.complaint_id,
            'subject': complaint.subject,
            'message': complaint.message,
            'send_time': complaint.send_time.strftime('%Y-%m-%d %H:%M:%S'),
            'reply': complaint.reply,
            'reply_time': complaint.reply_time.strftime('%Y-%m-%d %H:%M:%S'),
            'status': complaint.status,
            'sender_username': Login.query.filter_by(login_id=complaint.sender_login_id).first().username
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def update_admin_password(login_id, current_password, new_password):
    try:
        admin = Login.query.filter_by(login_id=login_id, type_id=1).first()
        if not admin:
            return {"error": "Admin not found"}
            
        if admin.password != current_password:
            return {"error": "Current password is incorrect"}
            
        admin.password = new_password
        db.session.commit()
        
        return {"message": "Password updated successfully"}
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def get_all_careers(page=1, per_page=10, sort_key='career_id', sort_direction='asc'):
    try:
        # Create base query
        query = Careers.query

        # Apply sorting
        if sort_key == 'career_id':
            sort_column = Careers.career_id
        else:
            sort_column = Careers.career

        if sort_direction == 'desc':
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Get total count before pagination
        total = query.count()

        # Apply pagination
        paginated = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )

        # Format the response with safe datetime handling
        careers_list = []
        for c in paginated.items:
            career_dict = {
                'career_id': c.career_id,
                'career': c.career,
                'created_at': c.created_at.isoformat() if c.created_at else None,
                'updated_at': c.updated_at.isoformat() if c.updated_at else None
            }
            careers_list.append(career_dict)

        return {
            'careers': careers_list,
            'total': total
        }
    except Exception as e:
        print(f"Error in get_all_careers: {str(e)}")
        return {"error": str(e)}

def validate_career(career_text):
    """Validate career text"""
    if not career_text or len(career_text.strip()) == 0:
        return False, "Career text cannot be empty"
    if len(career_text) > 500:
        return False, "Career text is too long (max 500 characters)"
    return True, None

def add_career(career_text):
    try:
        # Validate career text
        is_valid, error_message = validate_career(career_text)
        if not is_valid:
            return {"error": error_message}

        new_career = Careers(career=career_text)
        db.session.add(new_career)
        db.session.commit()
        
        return {
            'career_id': new_career.career_id,
            'career': new_career.career
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def update_career(career_id, career_text):
    try:
        # Validate career text
        is_valid, error_message = validate_career(career_text)
        if not is_valid:
            return {"error": error_message}

        career = Careers.query.get(career_id)
        if not career:
            return {"error": "Career not found"}
            
        career.career = career_text
        db.session.commit()
        
        return {
            'career_id': career.career_id,
            'career': career.career
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def delete_career(career_id):
    try:
        career = Careers.query.get(career_id)
        if not career:
            return {"error": "Career not found"}
            
        db.session.delete(career)
        db.session.commit()
        
        return {"message": "Career deleted successfully"}
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def get_all_course_types(page=1, per_page=10, sort_key='course_type_id', sort_direction='asc'):
    """Get all course types with pagination and sorting"""
    try:
        # Create base query
        query = CourseType.query

        # Apply sorting
        if sort_key == 'course_type_id':
            sort_column = CourseType.course_type_id
        else:
            sort_column = CourseType.course_type

        if sort_direction == 'desc':
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Get total count before pagination
        total = query.count()

        # Apply pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        # Format response
        course_types_list = [{
            'course_type_id': ct.course_type_id,
            'course_type': ct.course_type,
            'created_at': ct.created_at.isoformat() if ct.created_at else None,
            'updated_at': ct.updated_at.isoformat() if ct.updated_at else None
        } for ct in paginated.items]

        return {
            'courseTypes': course_types_list,
            'total': total
        }
    except Exception as e:
        print(f"Error in get_all_course_types: {str(e)}")
        return {"error": str(e)}

def validate_course_type(course_type_text):
    """Validate course type text"""
    if not course_type_text or len(course_type_text.strip()) == 0:
        return False, "Course type text cannot be empty"
    if len(course_type_text) > 120:
        return False, "Course type text is too long (max 120 characters)"
    return True, None

def add_course_type(course_type_text):
    """Add a new course type"""
    try:
        # Validate course type text
        is_valid, error_message = validate_course_type(course_type_text)
        if not is_valid:
            return {"error": error_message}

        # Check if course type already exists
        existing = CourseType.query.filter_by(course_type=course_type_text).first()
        if existing:
            return {"error": "Course type already exists"}

        new_course_type = CourseType(course_type=course_type_text)
        db.session.add(new_course_type)
        db.session.commit()
        
        return {
            'course_type_id': new_course_type.course_type_id,
            'course_type': new_course_type.course_type,
            'created_at': new_course_type.created_at.isoformat(),
            'updated_at': new_course_type.updated_at.isoformat()
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def update_course_type(course_type_id, course_type_text):
    """Update an existing course type"""
    try:
        # Validate course type text
        is_valid, error_message = validate_course_type(course_type_text)
        if not is_valid:
            return {"error": error_message}

        course_type = CourseType.query.get(course_type_id)
        if not course_type:
            return {"error": "Course type not found"}

        # Check if new name already exists for different course type
        existing = CourseType.query.filter(
            CourseType.course_type == course_type_text,
            CourseType.course_type_id != course_type_id
        ).first()
        if existing:
            return {"error": "Course type name already exists"}
            
        course_type.course_type = course_type_text
        db.session.commit()
        
        return {
            'course_type_id': course_type.course_type_id,
            'course_type': course_type.course_type,
            'created_at': course_type.created_at.isoformat(),
            'updated_at': course_type.updated_at.isoformat()
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def delete_course_type(course_type_id):
    """Delete a course type"""
    try:
        course_type = CourseType.query.get(course_type_id)
        if not course_type:
            return {"error": "Course type not found"}

        # Check if course type is being used
        if course_type.courses:
            return {"error": "Cannot delete course type that has associated courses"}
            
        db.session.delete(course_type)
        db.session.commit()
        
        return {"message": "Course type deleted successfully"}
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}