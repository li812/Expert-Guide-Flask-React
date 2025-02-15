from db.db_models import Questions, Careers
import requests
import json

# Replace with your actual Gemini API Key
GEMINI_API_KEY = "AIzaSyCvKdLIkcZpN8gob5emotvqE7ioZJnQucQ"

def get_assessment_questions():
    """Fetch questions from database"""
    try:
        questions = Questions.query.order_by(Questions.question_id).all()
        return {
            'questions': [{
                'id': q.question_id,
                'text': q.question
            } for q in questions]
        }
    except Exception as e:
        return {"error": str(e)}

def process_assessment(answers):
    """Process assessment answers and return career recommendation"""
    try:
        # Get all careers from database
        careers = Careers.query.all()
        career_options = [c.career for c in careers]
        
        # Format answers in the required format
        formatted_answers = []
        for qid, answer_data in answers.items():
            formatted_answers.append(f"{qid}: {answer_data['text']} {answer_data['answer']}")
        
        answers_text = "\n".join(formatted_answers)
        
        # Construct the prompt
        prompt = (
            f"{answers_text}\n\n"
            "You are a great career guider and a psychologist. "
            "Deeply analyze these career guidance questions and answers (no, low, yes, high) "
            "and choose one of the best-matching careers from this list:\n"
            f"Careers = {json.dumps(career_options)}\n\n"
            "Give the response as just one of the careers. Don't generate a paragraph or sentence."
        )
        
        
        
        print(f"prompt:\n\n\n{prompt}")



        # API request payload
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }

        # Make API request
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            # Extract just the career name from response
            career = result["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            # Verify the career is in our options
            if career in career_options:
                return {"career": career}
            else:
                return {"error": "Invalid career recommendation received"}
        else:
            return {"error": f"API request failed with status {response.status_code}"}
            
    except Exception as e:
        return {"error": str(e)}