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
    profilePicture = db.Column(db.String(200))


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
    
class Questions(db.Model):
    __tablename__ = 'questions'
    question_id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
class Careers(db.Model):
    __tablename__ = 'careers'
    career_id = db.Column(db.Integer, primary_key=True)
    career = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)