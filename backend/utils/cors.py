from flask import request
from flask_cors import CORS

def configure_cors(app):
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5000"
    ]
    
    CORS(app, 
         supports_credentials=True,
         resources={
             r"/*": {
                 "origins": ALLOWED_ORIGINS,
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                 "allow_headers": [
                     "Content-Type",
                     "Authorization",
                     "Cookie",
                     "X-CSRF-Token"
                 ],
                 "expose_headers": [
                     "Set-Cookie",
                     "Authorization"
                 ],
                 "supports_credentials": True,
                 "max_age": 3600
             }
         })

    @app.after_request 
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin in ALLOWED_ORIGINS:
            response.headers.update({
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-CSRF-Token',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Expose-Headers': 'Set-Cookie, Authorization',
                'Access-Control-Max-Age': '3600',
                'Vary': 'Origin, Cookie, Accept-Encoding',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            })
            
            user_agent = request.headers.get('User-Agent', '').lower()
            if 'safari' in user_agent:
                response.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
            
        return response


