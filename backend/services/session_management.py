from flask import session
from functools import wraps
from flask import jsonify, request
import time

def init_session(login_id, type_id):
    """Initialize a new session"""
    try:
        session.permanent = True  # Make session persistent
        session['login_id'] = login_id
        session['type_id'] = type_id
        session['created_at'] = time.time()
        session['user_agent'] = request.headers.get('User-Agent', '')
        session['browser_type'] = 'safari' if 'safari' in request.headers.get('User-Agent', '').lower() else 'other'
        session.modified = True
        
        # print(f"Session initialized with data: {dict(session)}")
        # print(f"Request headers: {dict(request.headers)}")
        return True
    except Exception as e:
        print(f"Error initializing session: {e}")
        return False

def clear_session():
    """Clear the current session"""
    print("Clearing session")
    session.clear()

def check_session(required_type=None):
    """Decorator to check session validity"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.method == 'OPTIONS':
                return '', 204
                
            # print(f"Checking session: {dict(session)}")
            # print(f"Headers: {dict(request.headers)}")
            # print(f"Cookies: {dict(request.cookies)}")
            
            if 'login_id' not in session:
                return jsonify({
                    'error': 'Not authenticated',
                    'session_data': dict(session),
                    'cookies': dict(request.cookies)
                }), 401
            
            if required_type and session.get('type_id') != required_type:
                return jsonify({'error': 'Not authorized'}), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator