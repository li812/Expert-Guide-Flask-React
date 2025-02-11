from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import relationship
from datetime import datetime

db = SQLAlchemy()

class UserType(db.Model):
    __tablename__ = 'user_type'
    
    type_id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    users = relationship('Login', backref='user_type', lazy=True)

class Login(db.Model):
    __tablename__ = 'login'
    
    login_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    type_id = db.Column(db.Integer, db.ForeignKey('user_type.type_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    login_count = db.Column(db.Integer, default=0)
    
    
class Users(db.Model):
    __tablename__ = 'users'
    login_id = db.Column(db.Integer, db.ForeignKey('login.login_id'), primary_key=True)
    full_name = db.Column(db.String(80), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    dateOfBirth = db.Column(db.Date, nullable=False)
    address = db.Column(db.String(200), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    district = db.Column(db.String(50), nullable=False)
    postalPinCode = db.Column(db.String(10), nullable=False)
    aadhaar = db.Column(db.String(12), unique=True, nullable=True)
    pan = db.Column(db.String(10), unique=True, nullable=True)
    passport = db.Column(db.String(8), unique=True, nullable=True)
    profilePicture = db.Column(db.String(200))


    
class Developers(db.Model):
    __tablename__ = 'developers'
    login_id = db.Column(db.Integer, db.ForeignKey('login.login_id'), primary_key=True)  # Unique by default due to being a primary key
    full_name = db.Column(db.String(80), nullable=False)  # Removed unique=True, as multiple developers can share the same name
    email = db.Column(db.String(120), unique=True, nullable=False)  # Email should be unique
    phone = db.Column(db.String(20), unique=True, nullable=False)  # Consider adding unique=True if phone numbers must be unique
    dateOfBirth = db.Column(db.Date, nullable=False)
    gitHubUsername = db.Column(db.String(100), unique=True, nullable=False)  # GitHub usernames should be unique
    linkedInUsername = db.Column(db.String(100), unique=True, nullable=False)  # LinkedIn usernames should be unique
    typeOfDeveloper = db.Column(db.String(50), nullable=False)  # Removed unique=True, as multiple developers can have the same type
    companyName = db.Column(db.String(100), nullable=False)  # Removed unique=True, as multiple developers can work for the same company
    address = db.Column(db.String(200), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    district = db.Column(db.String(50), nullable=False)
    postalPinCode = db.Column(db.String(10), nullable=False)
    profilePicture = db.Column(db.String(200))  # No unique constraint needed here
    
    # Add settings relationship (optional since we already defined it in DeveloperSettings)
    # settings = db.relationship("DeveloperSettings", back_populates="developer", uselist=False)

class APIs(db.Model):
    __tablename__ = 'APIs'
    api_id = db.Column(db.Integer, primary_key=True)
    login_id = db.Column(db.Integer, db.ForeignKey('login.login_id'))
    api_key = db.Column(db.String(80), nullable=False)
    api_name = db.Column(db.String(80), nullable=False)
    website_app = db.Column(db.String(80), nullable=False)
    website_app_logo = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(80), nullable=False)



class Complaints(db.Model):
    __tablename__ = 'complaints'
    complaint_id = db.Column(db.Integer, primary_key=True)
    sender_login_id = db.Column(db.Integer, db.ForeignKey('login.login_id'), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    send_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    reply = db.Column(db.Text, nullable=True)
    reply_time = db.Column(db.DateTime, nullable=True)
    replier_login_id = db.Column(db.Integer, db.ForeignKey('login.login_id'), nullable=True)
    status = db.Column(db.String(50), nullable=False, default='pending')

    sender = db.relationship('Login', foreign_keys=[sender_login_id], backref='sent_complaints')
    replier = db.relationship('Login', foreign_keys=[replier_login_id], backref='replied_complaints')