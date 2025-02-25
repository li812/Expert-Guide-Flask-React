from db.db_models import db, CourseMapping, Institution, Course, CourseType

def get_course_mapping_details(mapping_id):
    """Get detailed information about a course mapping"""
    try:
        # Query the mapping with all related data
        mapping = CourseMapping.query\
            .join(Institution)\
            .join(Course)\
            .join(CourseType)\
            .filter(CourseMapping.course_mapping_id == mapping_id)\
            .first()

        if not mapping:
            return {"error": "Course mapping not found"}

        # Format the response
        mapping_details = {
            "course_mapping_id": mapping.course_mapping_id,
            "institution_id": mapping.institution_id,
            "course_type_id": mapping.course_type_id,
            "course_id": mapping.course_id,
            "description": mapping.description,
            "fees": mapping.fees,
            "website": mapping.website,
            "student_qualification": mapping.student_qualification,
            "course_affliation": mapping.course_affliation,
            "duration": mapping.duration,
            "status": mapping.status,
            "created_at": mapping.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "updated_at": mapping.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            
            # Institution details
            "institution": {
                "name": mapping.institution.institution,
                "email": mapping.institution.email,
                "phone": mapping.institution.phone,
                "address": mapping.institution.address,
                "state": mapping.institution.state,
                "district": mapping.institution.district,
                "postalPinCode": mapping.institution.postalPinCode,
                "website": mapping.institution.website,
                "logoPicture": mapping.institution.logoPicture
            },
            
            # Course details
            "course": {
                "name": mapping.course.course,
                "description": mapping.course.course_description,
                "type": mapping.course.course_type.course_type
            }
        }

        return mapping_details
    except Exception as e:
        print(f"Error in get_course_mapping_details: {str(e)}")
        return {"error": str(e)}