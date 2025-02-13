import requests
import json

# Replace with your actual Gemini API Key
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"

# List of career guidance questions
questions = [
    "Do you enjoy solving mathematical problems?",
    "Are you interested in understanding how machines or technology work?",
    "Do you like studying human biology and diseases?",
    "Are you fascinated by space, physics, or scientific research?",
    "Do you enjoy reading about history, politics, or philosophy?",
    "Are you good at public speaking or debating?",
    "Do you find it easy to analyze numbers and financial data?",
    "Are you comfortable designing graphics, fashion, or digital art?",
    "Do you enjoy planning and organizing events or projects?",
    "Are you good at teaching or explaining concepts to others?",
    "Would you like a career where you help people with their health?",
    "Are you comfortable working long hours under pressure?",
    "Do you like traveling and exploring new places as part of your job?",
    "Would you enjoy working in a disciplined and physically demanding environment?",
    "Do you like solving real-world problems using technology?",
    "Are you interested in helping businesses grow through marketing and management?",
    "Do you enjoy writing, storytelling, or journalism?",
    "Are you interested in understanding human psychology and behavior?",
    "Do you enjoy debating laws, ethics, or legal issues?",
    "Do you prefer working independently rather than in a team?",
    "Do you want to start your own business or startup?",
    "Would you like a government job with stability and social impact?",
    "Are you interested in flying planes or working in aviation?",
    "Do you want to work in a hospital or healthcare setting?",
    "Would you like to contribute to new scientific discoveries?",
    "Do you enjoy collaborating with diverse teams to solve complex challenges?",
    "Are you comfortable with uncertainty and adapting to rapidly changing environments?",
    "Do you thrive when given leadership responsibilities and decision-making authority?",
    "Do you enjoy leveraging emerging technologies to drive innovative solutions?",
    "Do you find satisfaction in mentoring or coaching others to achieve their goals?"
]

# Mapping of user inputs
answer_map = {0: "High", 1: "Yes", 2: "Low", 3: "No"}
answers = {}

# Ask the questions and get user input
print("Please answer each question with:\n 0 = High\n 1 = Yes\n 2 = Low\n 3 = No\n")

for i, question in enumerate(questions, 1):
    while True:
        try:
            response = int(input(f"{i}: {question} "))
            if response in answer_map:
                answers[i] = answer_map[response]
                break
            else:
                print("Invalid input. Please enter 0, 1, 2, or 3.")
        except ValueError:
            print("Invalid input. Please enter a number (0-3).")

# Format the answers for API request
answers_text = "\n".join([f"{i}: {q} {answers[i]}" for i, q in enumerate(questions, 1)])

# Append instructions for Gemini API
prompt = (
    f"{answers_text}\n\n"
    "You are a great career guider and a psychologist. Deeply analyze these career guidance questions and answers "
    "(no, low, yes, high) and choose one of the best-matching careers from this list:\n"
    "Careers = {\"Engineering & Technology\", \"Medical & Healthcare\", \"Pure Sciences & Research\", "
    "\"Commerce, Finance & Business\", \"Law & Government Services\", \"Media, Design & Communication\", "
    "\"Hotel Management & Tourism\", \"Defence & Aviation\", \"Education & Teaching\", \"Business & Entrepreneurship\"}\n\n"
    "Give the response as just one of the careers. Don’t generate a paragraph or sentence."
)

# API request payload
payload = {
    "contents": [{
        "parts": [{"text": prompt}]
    }]
}

# Send request to Gemini API
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
headers = {"Content-Type": "application/json"}

response = requests.post(url, headers=headers, json=payload)

# Parse response
if response.status_code == 200:
    result = response.json()
    try:
        career = result["candidates"][0]["content"]["parts"][0]["text"]
        print("\nRecommended Career Path:", career)
    except (KeyError, IndexError):
        print("\nError: Unexpected response format:", result)
else:
    print("\nError:", response.status_code, response.text)




# deeply analyse this code and make the caree