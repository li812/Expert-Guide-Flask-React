from db.db_models import db, Questions
from datetime import datetime


def get_all_questions():
    try:
        questions = Questions.query.all()
        return [{
            'question_id': q.question_id,
            'question': q.question
        } for q in questions]
    except Exception as e:
        return {"error": str(e)}

def validate_question(question_text):
    """Validate question text"""
    if not question_text or len(question_text.strip()) == 0:
        return False, "Question text cannot be empty"
    if len(question_text) > 1000:  # Set a reasonable max length
        return False, "Question text is too long (max 1000 characters)"
    return True, None

def add_question(question_text):
    try:
        new_question = Questions(question=question_text)
        db.session.add(new_question)
        db.session.commit()
        
        return {
            'question_id': new_question.question_id,
            'question': new_question.question
        }
    except Exception as e:
        db.session.rollback()
        raise Exception(f"Error adding question: {str(e)}")

def update_question(question_id, question_text):
    try:
        question = Questions.query.get(question_id)
        if not question:
            return {"error": "Question not found"}
            
        question.question = question_text
        db.session.commit()
        
        return {
            'question_id': question.question_id,
            'question': question.question
        }
    except Exception as e:
        db.session.rollback()
        raise Exception(f"Error updating question: {str(e)}")

def delete_question(question_id):
    try:
        question = Questions.query.get(question_id)
        if not question:
            return {"error": "Question not found"}
            
        db.session.delete(question)
        db.session.commit()
        
        return {"message": "Question deleted successfully"}
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}