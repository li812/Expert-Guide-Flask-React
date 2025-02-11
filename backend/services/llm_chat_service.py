import os
from pathlib import Path
import google.generativeai as genai

def load_api_key(api_key_path="backend/api_key.txt"):
    try:
        with open(api_key_path, 'r') as file:
            return file.read().strip()
    except FileNotFoundError:
        raise FileNotFoundError(f"API key file not found at {api_key_path}")

def configure_genai():
    # api_key = load_api_key()
    api_key = "AIzaSyCvKdLIkcZpN8gob5emotvqE7ioZJnQucQ"
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.0-flash")

def generate_content(prompt: str) -> str:
    try:
        model = configure_genai()
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating content: {str(e)}"

if __name__ == "__main__":
    test_prompt = "Hello, how are you?"
    print(generate_content(test_prompt))