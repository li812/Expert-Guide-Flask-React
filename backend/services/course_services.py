import logger, logging
from sqlalchemy.orm import joinedload
from sqlalchemy import func, case, text
from sqlalchemy.sql.expression import or_, and_

from db.db_models import (
    db, 
    CourseMapping,
    Institution,
    Course,
    CourseType, 
    CourseLikesDislikes,
    Careers
)

logger = logging.getLogger(__name__)

def get_course_mapping_details(mapping_id):
    try:
        mapping = CourseMapping.query\
            .join(Institution)\
            .join(Course)\
            .join(CourseType)\
            .filter(CourseMapping.course_mapping_id == mapping_id)\
            .first()

        if not mapping:
            return {"error": "Course mapping not found"}

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
    try:
        if not isinstance(page, int) or page < 1:
            return {"error": "Invalid page number"}
        if not isinstance(per_page, int) or per_page < 1 or per_page > 48:
            return {"error": "Invalid page size"}

        query = CourseMapping.query\
            .join(Institution)\
            .join(Course)\
            .join(CourseType)\
            .options(
                joinedload(CourseMapping.institution),
                joinedload(CourseMapping.course),
                joinedload(CourseMapping.course_type)
            )

        if filters.get('search'):
            search_term = filters['search'].strip()
            if len(search_term) < 2:
                return {"error": "Search term too short"}
            search_term = f"%{search_term}%"
            query = query.filter(
                or_(
                    Course.course.ilike(search_term),
                    Institution.institution.ilike(search_term),
                    CourseMapping.description.ilike(search_term)
                )
            )

        if filters.get('course_types'):
            try:
                course_type_ids = [
                    int(ct_id) for ct_id in filters['course_types'] 
                    if str(ct_id).isdigit()
                ]
                if course_type_ids:
                    query = query.filter(Course.course_type_id.in_(course_type_ids))
            except (ValueError, AttributeError) as e:
                logger.error(f"Error processing course types: {str(e)}")

        if filters.get('careers'):
            try:
                career_ids = [
                    int(c_id) for c_id in filters['careers'] 
                    if str(c_id).isdigit()
                ]
                if career_ids:
                    query = query.filter(Course.career_id.in_(career_ids))
            except (ValueError, AttributeError) as e:
                logger.error(f"Error processing careers: {str(e)}")

        if filters.get('state'):
            query = query.filter(Institution.state == filters['state'])
            if filters.get('district'):
                query = query.filter(Institution.district == filters['district'])

        try:
            min_fees = float(filters.get('min_fees', 0))
            max_fees = float(filters.get('max_fees', 5000000))
            if min_fees < 0 or max_fees < min_fees:
                return {"error": "Invalid fees range"}
            query = query.filter(
                and_(
                    CourseMapping.fees >= min_fees,
                    CourseMapping.fees <= max_fees
                )
            )
        except ValueError:
            return {"error": "Invalid fees values"}

        sort_by = filters.get('sort_by', 'relevance')
        if sort_by not in ['relevance', 'fees_low', 'fees_high', 'rating']:
            return {"error": "Invalid sort option"}

        if sort_by == 'fees_low':
            query = query.order_by(CourseMapping.fees.asc())
        elif sort_by == 'fees_high':
            query = query.order_by(CourseMapping.fees.desc())
        elif sort_by == 'rating':
            # Calculate Wilson Score using a subquery for better SQL syntax
            wilson_score = text("""
                (
                    (COUNT(CASE WHEN course_likes_dislikes.is_like = 1 THEN 1 END) + 1.9208) / 
                    NULLIF((COUNT(course_likes_dislikes.id) + 3.8416), 0) -
                    1.96 * SQRT(
                        ((COUNT(CASE WHEN course_likes_dislikes.is_like = 1 THEN 1 END) * 
                        COUNT(CASE WHEN course_likes_dislikes.is_like = 0 THEN 1 END)) / 
                        NULLIF((COUNT(course_likes_dislikes.id) + 3.8416), 0) + 0.9604) /
                        NULLIF((COUNT(course_likes_dislikes.id) + 3.8416), 0)
                    )
                )
            """)
            
            query = query.outerjoin(CourseLikesDislikes)\
                .group_by(CourseMapping.course_mapping_id)\
                .order_by(wilson_score.desc())

        total = query.count()
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        if not paginated.items:
            return {
                "courses": [],
                "total": 0,
                "pages": 0,
                "current_page": page,
                "message": "No courses found matching the criteria"
            }

        return {
            "courses": [format_course_mapping(m) for m in paginated.items],
            "total": total,
            "pages": paginated.pages,
            "current_page": page
        }

    except Exception as e:
        logger.error(f"Error in get_filtered_courses: {str(e)}")
        if "MySQL" in str(e):
            return {"error": "Database error while sorting courses"}
        return {"error": "Failed to fetch courses"}

def highlight_text(text, search_term):
    """Helper function to highlight search terms in text"""
    if not text or not search_term:
        return text
    
    try:
        parts = text.lower().split(search_term.lower())
        if len(parts) == 1:
            return text
            
        result = []
        last_end = 0
        
        for i in range(len(parts) - 1):
            start = text.lower().find(search_term.lower(), last_end)
            end = start + len(search_term)
            result.append(text[last_end:start])
            result.append('<mark>')
            result.append(text[start:end])
            result.append('</mark>')
            last_end = end
            
        result.append(text[last_end:])
        return ''.join(result)
    except Exception:
        return text

def format_course_mapping(mapping):
    """Helper function to format course mapping data"""
    try:
        total_ratings = CourseLikesDislikes.query.filter_by(
            course_mapping_id=mapping.course_mapping_id
        ).count()
        
        likes = get_course_likes(mapping.course_mapping_id)
        rating = likes / total_ratings if total_ratings > 0 else 0
        
        return {
            "course_mapping_id": mapping.course_mapping_id,
            "institution": {
                "institution_id": mapping.institution.institution_id,
                "institution": mapping.institution.institution,
                "type_id": mapping.institution.institution_type_id,
                "type": mapping.institution.institution_type.institution_type,
                "description": mapping.institution.description,
                "accreditation": mapping.institution.accreditation,
                "since_date": mapping.institution.since_date.strftime('%Y-%m-%d') if mapping.institution.since_date else None,
                "website": mapping.institution.website,
                "email": mapping.institution.email,
                "phone": mapping.institution.phone,
                "address": mapping.institution.address,
                "state": mapping.institution.state,
                "district": mapping.institution.district,
                "postalPinCode": mapping.institution.postalPinCode,
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
            "website": mapping.website,
            "student_qualification": mapping.student_qualification,
            "course_affliation": mapping.course_affliation,
            "likes": get_course_likes(mapping.course_mapping_id),
            "dislikes": get_course_dislikes(mapping.course_mapping_id),
            "status": mapping.status,
            "rating": rating,
            "total_ratings": total_ratings,
            "dislikes": total_ratings - likes
        }
    except Exception as e:
        print(f"Error formatting course mapping: {str(e)}")
        return {} 

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
        mapping = CourseMapping.query.get(mapping_id)
        if not mapping:
            return {"error": "Course mapping not found"}
        existing_rating = CourseLikesDislikes.query.filter_by(
            course_mapping_id=mapping_id,
            user_id=user_id
        ).first()

        if existing_rating:
            if existing_rating.is_like == is_like:
                db.session.delete(existing_rating)
            else:
                existing_rating.is_like = is_like
        else:
            new_rating = CourseLikesDislikes(
                course_mapping_id=mapping_id,
                user_id=user_id,
                is_like=is_like
            )
            db.session.add(new_rating)

        db.session.commit()
        
        return {
            "likes": get_course_likes(mapping_id),
            "dislikes": get_course_dislikes(mapping_id)
        }

    except Exception as e:
        db.session.rollback()
        print(f"Error updating course rating: {str(e)}")
        return {"error": str(e)}


def apply_course_type_filter(query, course_types):
    """Apply course type filter with validation and error handling"""
    try:
        if not course_types:
            return query

        # Validate course type IDs
        course_type_ids = []
        for ct_id in course_types.split(','):
            try:
                ct_id = int(ct_id)
                if CourseType.query.get(ct_id):
                    course_type_ids.append(ct_id)
            except ValueError:
                continue

        if course_type_ids:
            query = query.filter(CourseType.course_type_id.in_(course_type_ids))

        return query

    except Exception as e:
        logger.error(f"Error applying course type filter: {str(e)}")
        raise FilterError("Failed to apply course type filter")