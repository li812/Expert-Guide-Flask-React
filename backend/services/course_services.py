from sqlalchemy import or_, and_, desc
from db.db_models import (
    db, CourseMapping, Institution, Course, CourseType, 
    CourseLikesDislikes, InstitutionLikesDislikes, Careers, InstitutionType
)


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
    
    


def get_filtered_courses(filters, page=1, per_page=12):
    """Get filtered and paginated course mappings"""
    try:
        query = CourseMapping.query\
            .join(Institution)\
            .join(Course)\
            .join(CourseType)

        # Apply filters
        if filters.get('search'):
            search = f"%{filters['search']}%"
            query = query.filter(
                or_(
                    Course.course.ilike(search),
                    Institution.institution.ilike(search),
                    CourseMapping.description.ilike(search)
                )
            )

        if filters.get('course_types'):
            query = query.filter(CourseType.course_type_id.in_(filters['course_types']))

        if filters.get('careers'):
            query = query.filter(Course.career_id.in_(filters['careers']))

        if filters.get('state'):
            query = query.filter(Institution.state == filters['state'])
            
        if filters.get('district'):
            query = query.filter(Institution.district == filters['district'])

        if filters.get('min_fees') is not None:
            query = query.filter(CourseMapping.fees >= filters['min_fees'])

        if filters.get('max_fees') is not None:
            query = query.filter(CourseMapping.fees <= filters['max_fees'])

        # Apply sorting
        sort_by = filters.get('sort_by', 'relevance')
        if sort_by == 'fees_low':
            query = query.order_by(CourseMapping.fees.asc())
        elif sort_by == 'fees_high':
            query = query.order_by(CourseMapping.fees.desc())
        elif sort_by == 'rating':
            # Join with likes table and order by likes ratio
            query = query.outerjoin(CourseLikesDislikes)\
                .group_by(CourseMapping.course_mapping_id)\
                .order_by(
                    db.func.count(db.case([(CourseLikesDislikes.is_like == True, 1)])).desc()
                )

        # Get total count and paginate
        total = query.count()
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        # Format response
        mappings = []
        for mapping in paginated.items:
            mappings.append({
                "course_mapping_id": mapping.course_mapping_id,
                "institution": {
                    "name": mapping.institution.institution,
                    "type": mapping.institution.institution_type.institution_type,
                    "logoPicture": mapping.institution.logoPicture
                },
                "course": {
                    "name": mapping.course.course,
                    "type": mapping.course_type.course_type,
                    "description": mapping.course.course_description
                },
                "description": mapping.description,
                "fees": mapping.fees,
                "duration": mapping.duration,
                "likes": get_course_likes(mapping.course_mapping_id),
                "dislikes": get_course_dislikes(mapping.course_mapping_id),
                "website": mapping.website,
                "student_qualification": mapping.student_qualification,
                "course_affliation": mapping.course_affliation
            })

        return {
            "courses": mappings,
            "total": total,
            "pages": paginated.pages,
            "current_page": page
        }

    except Exception as e:
        print(f"Error in get_filtered_courses: {str(e)}")
        return {"error": str(e)}

def get_course_filters():
    """Get all available filter options"""
    try:
        course_types = CourseType.query.all()
        careers = Careers.query.all()
        states = db.session.query(Institution.state).distinct().all()

        return {
            "course_types": [{"id": ct.course_type_id, "course_type": ct.course_type} for ct in course_types],
            "careers": [{"id": c.career_id, "career": c.career} for c in careers],
            "states": [state[0] for state in states]
        }
    except Exception as e:
        print(f"Error in get_course_filters: {str(e)}")
        return {"error": str(e)}

def calculate_institution_rating(institution_id):
    """Calculate institution rating based on likes/dislikes"""
    try:
        likes_data = InstitutionLikesDislikes.query\
            .filter_by(institution_id=institution_id)\
            .first()
        
        if likes_data:
            total = likes_data.likes + likes_data.dis_likes
            if total > 0:
                return round((likes_data.likes / total) * 5, 1)
        return 0
    except Exception as e:
        print(f"Error calculating institution rating: {str(e)}")
        return 0

def get_course_likes(course_mapping_id):
    """Get number of likes for a course"""
    try:
        return CourseLikesDislikes.query.filter_by(
            course_mapping_id=course_mapping_id,
            is_like=True
        ).count()
    except Exception as e:
        print(f"Error getting course likes: {str(e)}")
        return 0

def get_course_dislikes(course_mapping_id):
    """Get number of dislikes for a course"""
    try:
        return CourseLikesDislikes.query.filter_by(
            course_mapping_id=course_mapping_id,
            is_like=False
        ).count()
    except Exception as e:
        print(f"Error getting course dislikes: {str(e)}")
        return 0

def update_course_rating(mapping_id, user_id, is_like):
    """Update course rating (like/dislike)"""
    try:
        # Verify course mapping exists
        mapping = CourseMapping.query.get(mapping_id)
        if not mapping:
            return {"error": "Course mapping not found"}

        # Check for existing rating
        existing_rating = CourseLikesDislikes.query.filter_by(
            course_mapping_id=mapping_id,
            user_id=user_id
        ).first()

        if existing_rating:
            if existing_rating.is_like == is_like:
                # Remove rating if same type
                db.session.delete(existing_rating)
            else:
                # Update rating if different type
                existing_rating.is_like = is_like
        else:
            # Create new rating
            new_rating = CourseLikesDislikes(
                course_mapping_id=mapping_id,
                user_id=user_id,
                is_like=is_like
            )
            db.session.add(new_rating)

        db.session.commit()
        
        # Return updated counts
        return {
            "likes": get_course_likes(mapping_id),
            "dislikes": get_course_dislikes(mapping_id)
        }

    except Exception as e:
        db.session.rollback()
        print(f"Error updating course rating: {str(e)}")
        return {"error": str(e)}

def get_institution_details(institution_id):
    """Get detailed information about an institution"""
    try:
        institution = Institution.query\
            .join(InstitutionType)\
            .filter(Institution.institution_id == institution_id)\
            .first()

        if not institution:
            return {"error": "Institution not found"}

        return {
            "institution_id": institution.institution_id,
            "name": institution.institution,
            "type": institution.institution_type.institution_type,
            "description": institution.description,
            "accreditation": institution.accreditation,
            "since_date": institution.since_date.strftime('%Y-%m-%d'),
            "website": institution.website,
            "email": institution.email,
            "phone": institution.phone,
            "address": institution.address,
            "state": institution.state,
            "district": institution.district,
            "postalPinCode": institution.postalPinCode,
            "logoPicture": institution.logoPicture,
            "rating": calculate_institution_rating(institution.institution_id)
        }
    except Exception as e:
        print(f"Error in get_institution_details: {str(e)}")
        return {"error": str(e)}