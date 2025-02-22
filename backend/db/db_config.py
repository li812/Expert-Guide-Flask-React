from flask_sqlalchemy import SQLAlchemy
from .db_models import db, UserType, Login, Users, Complaints , Questions, Careers, CourseType, Course, InstitutionType, Institution, CourseMapping
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import time


DB_CONFIG_docker = {
        'host': 'db',
        'user': 'root',
        'password': 'root',
        'database': 'expert_guide_DB',
        'auth_plugin': 'mysql_native_password',
        'connect_timeout': 30
    }
DB_CONFIG_local = {
        'host': 'localhost',
        'user': 'root',
        'password': 'root',
        'database': 'expert_guide_DB',
        'auth_plugin': 'mysql_native_password',
        'connect_timeout': 30
    }

def get_db_config(run_env):
    return DB_CONFIG_docker if run_env == "docker" else DB_CONFIG_local

def init_db(app, run_env):
    """Initialize database and tables"""
    DB_CONFIG = get_db_config(run_env)
    print("Initializing database...")
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}/{DB_CONFIG['database']}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        # Create tables
        print("Creating tables...")
        db.create_all()
        
        # Add default user types if not exists
        if not UserType.query.first():
            print("Adding default user types...")
            user_types = [
                UserType(type_id=1, type='admin'),
                UserType(type_id=2, type='user')
            ]
            db.session.add_all(user_types)
            db.session.commit()
        
        # Add default users if not exists
        if not Login.query.first():
            print("Adding default users...")
            admin = Login(login_id=1, username='admin', type_id=1)
            admin.set_password('admin')
            db.session.add_all([admin])
            db.session.commit()
    print("Database initialization complete.")

def ensure_database(run_env):
    """Ensure database exists"""
    DB_CONFIG = get_db_config(run_env)
    print("Ensuring database exists...")
    retries = 10 
    while retries > 0:
        try:
            print(f"Attempting to connect to MySQL (retries left: {retries})...")
            conn = mysql.connector.connect(
                host=DB_CONFIG['host'],
                user=DB_CONFIG['user'],
                password=DB_CONFIG['password'],
                connect_timeout=DB_CONFIG['connect_timeout']
            )
            cursor = conn.cursor()
            
            # Create database if not exists
            print(f"Creating database {DB_CONFIG['database']} if not exists...")
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
            
            cursor.close()
            conn.close()
            print("Database ensured.")
            return
        
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            retries -= 1
            time.sleep(10)  # Increased delay
    
    raise Exception("Failed to connect to MySQL after several attempts")