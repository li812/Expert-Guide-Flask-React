from db.db_models import db, Users, Login, Complaints, Careers, CourseType, Course, InstitutionType, Institution
import platform
import psutil
import socket
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
import os

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
    
    
    
def get_all_courses(page=1, per_page=10, sort_key='course_id', sort_direction='asc'):
    """Get all courses with pagination and sorting"""
    try:
        # Create base query
        query = Course.query

        # Apply sorting
        if sort_key == 'course_id':
            sort_column = Course.course_id
        elif sort_key == 'course':
            sort_column = Course.course
        elif sort_key == 'course_type':
            sort_column = CourseType.course_type
        elif sort_key == 'career':
            sort_column = Careers.career
        else:
            sort_column = Course.course_id

        if sort_direction == 'desc':
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Get total count before pagination
        total = query.count()

        # Apply pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        # Format response
        courses_list = [{
            'course_id': c.course_id,
            'course': c.course,
            'course_description': c.course_description,
            'course_type_id': c.course_type_id,
            'career_id': c.career_id,
            'course_type': c.course_type.course_type,
            'career': c.career.career,
            'created_at': c.created_at.isoformat() if c.created_at else None,
            'updated_at': c.updated_at.isoformat() if c.updated_at else None
        } for c in paginated.items]

        return {
            'courses': courses_list,
            'total': total
        }
    except Exception as e:
        print(f"Error in get_all_courses: {str(e)}")
        return {"error": str(e)}

def validate_course(course_data):
    """Validate course data"""
    if not course_data.get('course') or len(course_data['course'].strip()) == 0:
        return False, "Course name cannot be empty"
    if not course_data.get('course_description') or len(course_data['course_description'].strip()) == 0:
        return False, "Course description cannot be empty"
    if not course_data.get('course_type_id'):
        return False, "Course type must be selected"
    if not course_data.get('career_id'):
        return False, "Career must be selected"
    return True, None

def add_course(course_data):
    """Add a new course"""
    try:
        # Validate course data
        is_valid, error_message = validate_course(course_data)
        if not is_valid:
            return {"error": error_message}

        # Check if course already exists
        existing = Course.query.filter_by(course=course_data['course']).first()
        if existing:
            return {"error": "Course already exists"}

        new_course = Course(
            course=course_data['course'],
            course_description=course_data['course_description'],
            course_type_id=course_data['course_type_id'],
            career_id=course_data['career_id']
        )
        db.session.add(new_course)
        db.session.commit()
        
        return {
            'course_id': new_course.course_id,
            'course': new_course.course,
            'course_description': new_course.course_description,
            'course_type_id': new_course.course_type_id,
            'career_id': new_course.career_id,
            'course_type': new_course.course_type.course_type,
            'career': new_course.career.career,
            'created_at': new_course.created_at.isoformat(),
            'updated_at': new_course.updated_at.isoformat()
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def update_course(course_id, course_data):
    """Update an existing course"""
    try:
        # Validate course data
        is_valid, error_message = validate_course(course_data)
        if not is_valid:
            return {"error": error_message}

        course = Course.query.get(course_id)
        if not course:
            return {"error": "Course not found"}

        # Check if new name already exists for different course
        existing = Course.query.filter(
            Course.course == course_data['course'],
            Course.course_id != course_id
        ).first()
        if existing:
            return {"error": "Course name already exists"}
            
        course.course = course_data['course']
        course.course_description = course_data['course_description']
        course.course_type_id = course_data['course_type_id']
        course.career_id = course_data['career_id']
        
        db.session.commit()
        
        return {
            'course_id': course.course_id,
            'course': course.course,
            'course_description': course.course_description,
            'course_type_id': course.course_type_id,
            'career_id': course.career_id,
            'course_type': course.course_type.course_type,
            'career': course.career.career,
            'created_at': course.created_at.isoformat(),
            'updated_at': course.updated_at.isoformat()
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def delete_course(course_id):
    """Delete a course"""
    try:
        course = Course.query.get(course_id)
        if not course:
            return {"error": "Course not found"}

        # Check if course has any mappings
        if course.institution_mappings:
            return {"error": "Cannot delete course that has institution mappings"}
            
        db.session.delete(course)
        db.session.commit()
        
        return {"message": "Course deleted successfully"}
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}
    
    
def get_all_institute_types(page=1, per_page=10, sort_key='institution_type_id', sort_direction='asc'):
    """Get all institution types with pagination and sorting"""
    try:
        # Create base query
        query = InstitutionType.query

        # Apply sorting
        if sort_key == 'institution_type_id':
            sort_column = InstitutionType.institution_type_id
        else:
            sort_column = InstitutionType.institution_type

        if sort_direction == 'desc':
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Get total count before pagination
        total = query.count()

        # Apply pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        # Format response
        institute_types_list = [{
            'institution_type_id': it.institution_type_id,
            'institution_type': it.institution_type,
            'created_at': it.created_at.isoformat() if it.created_at else None,
            'updated_at': it.updated_at.isoformat() if it.updated_at else None
        } for it in paginated.items]

        return {
            'instituteTypes': institute_types_list,
            'total': total
        }
    except Exception as e:
        print(f"Error in get_all_institute_types: {str(e)}")
        return {"error": str(e)}

def validate_institute_type(institute_type_text):
    """Validate institution type text"""
    if not institute_type_text or len(institute_type_text.strip()) == 0:
        return False, "Institution type cannot be empty"
    if len(institute_type_text) > 120:
        return False, "Institution type must be less than 120 characters"
    return True, None

def add_institute_type(institute_type_text):
    """Add a new institution type"""
    try:
        # Validate institution type text
        is_valid, error_message = validate_institute_type(institute_type_text)
        if not is_valid:
            return {"error": error_message}

        # Check if institution type already exists
        existing = InstitutionType.query.filter_by(institution_type=institute_type_text).first()
        if existing:
            return {"error": "Institution type already exists"}

        new_institute_type = InstitutionType(institution_type=institute_type_text)
        db.session.add(new_institute_type)
        db.session.commit()
        
        return {
            'institution_type_id': new_institute_type.institution_type_id,
            'institution_type': new_institute_type.institution_type,
            'created_at': new_institute_type.created_at.isoformat(),
            'updated_at': new_institute_type.updated_at.isoformat()
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def update_institute_type(institute_type_id, institute_type_text):
    """Update an existing institution type"""
    try:
        # Validate institution type text
        is_valid, error_message = validate_institute_type(institute_type_text)
        if not is_valid:
            return {"error": error_message}

        institute_type = InstitutionType.query.get(institute_type_id)
        if not institute_type:
            return {"error": "Institution type not found"}

        # Check if new name already exists for different institution type
        existing = InstitutionType.query.filter(
            InstitutionType.institution_type == institute_type_text,
            InstitutionType.institution_type_id != institute_type_id
        ).first()
        if existing:
            return {"error": "Institution type name already exists"}
            
        institute_type.institution_type = institute_type_text
        db.session.commit()
        
        return {
            'institution_type_id': institute_type.institution_type_id,
            'institution_type': institute_type.institution_type,
            'created_at': institute_type.created_at.isoformat(),
            'updated_at': institute_type.updated_at.isoformat()
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def delete_institute_type(institute_type_id):
    """Delete an institution type"""
    try:
        institute_type = InstitutionType.query.get(institute_type_id)
        if not institute_type:
            return {"error": "Institution type not found"}

        # Check if institution type is being used by any institutions
        if Institution.query.filter_by(institution_type_id=institute_type_id).first():
            return {"error": "Cannot delete institution type that has associated institutions"}
            
        db.session.delete(institute_type)
        db.session.commit()
        
        return {"message": "Institution type deleted successfully"}
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def validate_institute(institute_data):
    """Validate institution data"""
    if not institute_data.get('institution') or len(institute_data['institution'].strip()) == 0:
        return False, "Institution name is required"
    if not institute_data.get('institution_type_id'):
        return False, "Institution type is required"
    if not institute_data.get('description') or len(institute_data['description'].strip()) == 0:
        return False, "Description is required"
    if not institute_data.get('since_date'):
        return False, "Since date is required"
    if not institute_data.get('website') or len(institute_data['website'].strip()) == 0:
        return False, "Website is required"
    if not institute_data.get('email') or len(institute_data['email'].strip()) == 0:
        return False, "Email is required"
    if not institute_data.get('phone') or len(institute_data['phone'].strip()) == 0:
        return False, "Phone is required"
    if not institute_data.get('address') or len(institute_data['address'].strip()) == 0:
        return False, "Address is required"
    if not institute_data.get('state') or len(institute_data['state'].strip()) == 0:
        return False, "State is required"
    if not institute_data.get('district') or len(institute_data['district'].strip()) == 0:
        return False, "District is required"
    if not institute_data.get('postalPinCode') or len(institute_data['postalPinCode'].strip()) == 0:
        return False, "Postal/Pin code is required"
    return True, None

def add_institute(institute_data, logo_file=None):
    """Add a new institution"""
    try:
        # Validate institution data
        is_valid, error_message = validate_institute(institute_data)
        if not is_valid:
            return {"error": error_message}

        # Check if institution already exists
        existing = Institution.query.filter_by(institution=institute_data['institution']).first()
        if existing:
            return {"error": "Institution already exists"}

        # Handle logo file if provided
        logo_path = None
        if logo_file:
            filename = secure_filename(f"{institute_data['institution']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")
            logo_path = f"/institution_logos/{filename}"
            logo_file.save(os.path.join('static', 'institution_logos', filename))

        new_institute = Institution(
            institution=institute_data['institution'],
            institution_type_id=institute_data['institution_type_id'],
            description=institute_data['description'],
            accreditation=institute_data.get('accreditation'),
            since_date=datetime.strptime(institute_data['since_date'], '%Y-%m-%d').date(),
            website=institute_data['website'],
            email=institute_data['email'],
            phone=institute_data['phone'],
            address=institute_data['address'],
            state=institute_data['state'],
            district=institute_data['district'],
            postalPinCode=institute_data['postalPinCode'],
            logoPicture=logo_path
        )
        
        db.session.add(new_institute)
        db.session.commit()
        
        return {
            'institution_id': new_institute.institution_id,
            'institution': new_institute.institution,
            'institution_type_id': new_institute.institution_type_id,
            'description': new_institute.description,
            'accreditation': new_institute.accreditation,
            'since_date': new_institute.since_date.isoformat(),
            'website': new_institute.website,
            'email': new_institute.email,
            'phone': new_institute.phone,
            'address': new_institute.address,
            'state': new_institute.state,
            'district': new_institute.district,
            'postalPinCode': new_institute.postalPinCode,
            'logoPicture': new_institute.logoPicture,
            'created_at': new_institute.created_at.isoformat(),
            'updated_at': new_institute.updated_at.isoformat()
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def update_institute(institute_id, institute_data, logo_file=None):
    """Update an existing institution"""
    try:
        # Validate institution data
        is_valid, error_message = validate_institute(institute_data)
        if not is_valid:
            return {"error": error_message}

        institute = Institution.query.get(institute_id)
        if not institute:
            return {"error": "Institution not found"}

        # Check if new name already exists for different institution
        existing = Institution.query.filter(
            Institution.institution == institute_data['institution'],
            Institution.institution_id != institute_id
        ).first()
        if existing:
            return {"error": "Institution name already exists"}

        # Handle logo file if provided
        if logo_file:
            # Delete old logo if exists
            if institute.logoPicture:
                old_logo_path = os.path.join('static', institute.logoPicture.lstrip('/'))
                if os.path.exists(old_logo_path):
                    os.remove(old_logo_path)

            # Save new logo
            filename = secure_filename(f"{institute_data['institution']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")
            logo_path = f"/institution_logos/{filename}"
            logo_file.save(os.path.join('static', 'institution_logos', filename))
            institute.logoPicture = logo_path

        # Update fields
        institute.institution = institute_data['institution']
        institute.institution_type_id = institute_data['institution_type_id']
        institute.description = institute_data['description']
        institute.accreditation = institute_data.get('accreditation')
        institute.since_date = datetime.strptime(institute_data['since_date'], '%Y-%m-%d').date()
        institute.website = institute_data['website']
        institute.email = institute_data['email']
        institute.phone = institute_data['phone']
        institute.address = institute_data['address']
        institute.state = institute_data['state']
        institute.district = institute_data['district']
        institute.postalPinCode = institute_data['postalPinCode']
        
        db.session.commit()
        
        return {
            'institution_id': institute.institution_id,
            'institution': institute.institution,
            'institution_type_id': institute.institution_type_id,
            'description': institute.description,
            'accreditation': institute.accreditation,
            'since_date': institute.since_date.isoformat(),
            'website': institute.website,
            'email': institute.email,
            'phone': institute.phone,
            'address': institute.address,
            'state': institute.state,
            'district': institute.district,
            'postalPinCode': institute.postalPinCode,
            'logoPicture': institute.logoPicture,
            'created_at': institute.created_at.isoformat(),
            'updated_at': institute.updated_at.isoformat()
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def delete_institute(institute_id):
    """Delete an institution"""
    try:
        institute = Institution.query.get(institute_id)
        if not institute:
            return {"error": "Institution not found"}

        # Check if institution has any course mappings
        if institute.course_mappings:
            return {"error": "Cannot delete institution that has course mappings"}

        # Delete logo file if exists
        if institute.logoPicture:
            logo_path = os.path.join('static', institute.logoPicture.lstrip('/'))
            if os.path.exists(logo_path):
                os.remove(logo_path)
            
        db.session.delete(institute)
        db.session.commit()
        
        return {"message": "Institution deleted successfully"}
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def get_all_institutes(page=1, per_page=10, sort_key='institution_id', sort_direction='asc'):
    """Get all institutions with pagination and sorting"""
    try:
        # Create base query
        query = Institution.query

        # Apply sorting
        if sort_key == 'institution_id':
            sort_column = Institution.institution_id
        elif sort_key == 'institution':
            sort_column = Institution.institution
        elif sort_key == 'email':
            sort_column = Institution.email
        elif sort_key == 'state':
            sort_column = Institution.state
        else:
            sort_column = Institution.institution_id

        if sort_direction == 'desc':
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Get total count before pagination
        total = query.count()

        # Apply pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        # Format response
        institutes_list = [{
            'institution_id': inst.institution_id,
            'institution': inst.institution,
            'institution_type_id': inst.institution_type_id,
            'description': inst.description,
            'accreditation': inst.accreditation,
            'since_date': inst.since_date.isoformat() if inst.since_date else None,
            'website': inst.website,
            'email': inst.email,
            'phone': inst.phone,
            'address': inst.address,
            'state': inst.state,
            'district': inst.district,
            'postalPinCode': inst.postalPinCode,
            'logoPicture': inst.logoPicture,
            'created_at': inst.created_at.isoformat() if inst.created_at else None,
            'updated_at': inst.updated_at.isoformat() if inst.updated_at else None
        } for inst in paginated.items]

        return {
            'institutes': institutes_list,
            'total': total
        }
    except Exception as e:
        print(f"Error in get_all_institutes: {str(e)}")
        return {"error": str(e)}