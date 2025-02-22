from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import relationship
from datetime import datetime
from utils.password_utils import hash_password, verify_password_hash

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
    
    def set_password(self, password):
        """Hash and set password"""
        self.password = hash_password(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return verify_password_hash(self.password, password)
    
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
    career = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Remove the backref here since it's defined in Course
    courses = db.relationship('Course', back_populates='career', lazy=True)

class CourseType(db.Model):
    __tablename__ = 'course_type'
    course_type_id = db.Column(db.Integer, primary_key=True)
    course_type = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    courses = db.relationship('Course', back_populates='course_type', lazy=True)

class Course(db.Model):
    __tablename__ = 'course'
    course_id = db.Column(db.Integer, primary_key=True)
    course = db.Column(db.String(120), unique=True, nullable=False)
    course_description = db.Column(db.Text, nullable=False)
    course_type_id = db.Column(db.Integer, db.ForeignKey('course_type.course_type_id'), nullable=False, index=True)
    career_id = db.Column(db.Integer, db.ForeignKey('careers.career_id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Update the relationship definition here
    career = db.relationship('Careers', back_populates='courses', lazy=True)
    course_type = db.relationship('CourseType', back_populates='courses', lazy=True)

class InstitutionType(db.Model):
    __tablename__ = 'institution_type'
    institution_type_id = db.Column(db.Integer, primary_key=True)
    institution_type = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

class Institution(db.Model):
    __tablename__ = 'institution'  # Fixed tablename
    institution_id = db.Column(db.Integer, primary_key=True)
    institution = db.Column(db.String(120), unique=True, nullable=False)
    institution_type_id = db.Column(db.Integer, db.ForeignKey('institution_type.institution_type_id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    accreditation = db.Column(db.String(100))
    since_date = db.Column(db.Date, nullable=False)
    website = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    address = db.Column(db.String(200), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    district = db.Column(db.String(50), nullable=False)
    postalPinCode = db.Column(db.String(10), nullable=False)
    logoPicture = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

class CourseMapping(db.Model):
    __tablename__ = 'course_mapping'
    course_mapping_id = db.Column(db.Integer, primary_key=True)
    institution_id = db.Column(db.Integer, db.ForeignKey('institution.institution_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.course_id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    fees = db.Column(db.Float, nullable=False)
    student_qualification = db.Column(db.String(200), nullable=False)
    course_affliation = db.Column(db.String(200), nullable=False)
    duration = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='active', server_default='active')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    institution = db.relationship('Institution', backref='course_mappings')
    course = db.relationship('Course', backref='institution_mappings')
    
    __table_args__ = (
        db.UniqueConstraint('institution_id', 'course_id', name='uix_institution_course'),
    )