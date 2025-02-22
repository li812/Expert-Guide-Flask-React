from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password):
    """Generate password hash"""
    return generate_password_hash(password, method='pbkdf2:sha256')

def verify_password_hash(password_hash, password):
    """Verify password against hash"""
    return check_password_hash(password_hash, password)