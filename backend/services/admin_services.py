from db.db_models import db, Users, Login, Developers, APIs, Complaints
import platform
import psutil
import socket
import uuid
from datetime import datetime

def get_all_users():
    users = Users.query.join(Login, Users.login_id == Login.login_id).all()
    return [{
        'login_id': user.login_id,
        'full_name': user.full_name,
        'email': user.email,
        'phone': user.phone,
        'state': user.state,
        'profilePicture': f"/user_data/user_profile_picture/{user.login_id}.jpg" if user.profilePicture else None,
        'username': Login.query.get(user.login_id).username
    } for user in users]

def delete_user(login_id):
    user = Users.query.filter_by(login_id=login_id).first()
    login = Login.query.filter_by(login_id=login_id).first()
    if user:
        db.session.delete(user)
    if login:
        db.session.delete(login)
    db.session.commit()

def get_all_developers():
    try:
        developers = db.session.query(
            Developers,
            Login
        ).join(
            Login,
            Developers.login_id == Login.login_id
        ).all()
        
        result = [{
            'login_id': dev[0].login_id,
            'full_name': dev[0].full_name,
            'email': dev[0].email,
            'phone': dev[0].phone,
            'github': dev[0].gitHubUsername,
            'linkedin': dev[0].linkedInUsername,
            'type': dev[0].typeOfDeveloper,
            'company': dev[0].companyName,
            'state': dev[0].state,
            'profilePicture': f"/developer_data/developer_profile_picture/{dev[0].login_id}.jpg" if dev[0].profilePicture else None,
            'username': dev[1].username,
            'created_at': dev[1].created_at.strftime('%Y-%m-%d %H:%M:%S') if dev[1].created_at else None
        } for dev in developers]
        
        return result
        
    except Exception as e:
        print(f"Error in get_all_developers: {str(e)}")
        raise

def delete_developer(login_id):
    developer = Developers.query.filter_by(login_id=login_id).first()
    login = Login.query.filter_by(login_id=login_id).first()
    if developer:
        db.session.delete(developer)
    if login:
        db.session.delete(login)
    db.session.commit()

def get_all_apis():
    try:
        print("Fetching APIs from database...")
        apis = (
            db.session.query(APIs, Developers)
            .outerjoin(Developers, Developers.login_id == APIs.login_id)
            .order_by(APIs.created_at.desc())
            .all()
        )
        
        print(f"Found {len(apis)} APIs in database")
        
        result = [{
            'api_id': api.api_id,
            'api_name': api.api_name or '',
            'website_app': api.website_app or '',
            'website_app_logo': api.website_app_logo,
            'api_key': api.api_key,
            'created_at': api.created_at.strftime('%Y-%m-%d %H:%M:%S') if api.created_at else None,
            'status': api.status or 'inactive',
            'developer_name': dev.full_name if dev else 'Unknown',
            'company_name': dev.companyName if dev else '',
            'developer_type': dev.typeOfDeveloper if dev else 'Unknown',
            'login_id': api.login_id
        } for api, dev in apis]
        
        print("API details:")
        for item in result:
            print(f"API ID: {item['api_id']}, Website: {item['website_app']}, Developer: {item['developer_name']}, Developer Type: {item['developer_type']}")
        
        return result
        
    except Exception as e:
        print(f"Error in get_all_apis: {str(e)}")
        raise

def delete_api(api_id):
    api = APIs.query.filter_by(api_id=api_id).first()
    if api:
        db.session.delete(api)
        db.session.commit()

def update_api_status(api_id, new_status):
    api = APIs.query.filter_by(api_id=api_id).first()
    if api:
        api.status = new_status
        db.session.commit()
        return {
            'api_id': api.api_id,
            'website_app': api.website_app,
            'website_app_logo': api.website_app_logo,
            'api_key': api.api_key,
            'created_at': api.created_at,
            'status': api.status,
            'developer_name': Developers.query.filter_by(login_id=api.login_id).first().full_name,
            'company_name': Developers.query.filter_by(login_id=api.login_id).first().companyName
        }
    return None

def get_server_info():
    try:
        uptime = psutil.boot_time()
        cpu_usage = psutil.cpu_percent(interval=1)
        memory_info = psutil.virtual_memory()
        disk_info = psutil.disk_usage('/')
        net_io = psutil.net_io_counters()
        ip_address = socket.gethostbyname(socket.gethostname())
        mac_address = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) for elements in range(0, 2*6, 2)][::-1])
        
        # Get OS, processor, and GPU information
        os_info = platform.system() + " " + platform.release()
        processor_info = platform.processor()
        gpu_info = "N/A"  # Placeholder for GPU info, as psutil does not provide GPU info

        return {
            'uptime': uptime,
            'cpu_usage': cpu_usage * 10,
            'memory_usage': memory_info.percent,
            'total_memory': memory_info.total,
            'used_memory': memory_info.used,
            'free_memory': memory_info.free,
            'total_storage': disk_info.total,
            'used_storage': disk_info.used,
            'free_storage': disk_info.free,
            'ip_address': ip_address,
            'mac_address': mac_address,
            'network_sent': net_io.bytes_sent,
            'network_received': net_io.bytes_recv,
            'timestamp': datetime.utcnow().isoformat(),
            'os_info': os_info,
            'processor_info': processor_info,
            'gpu_info': gpu_info
        }
    except Exception as e:
        print(f"Error fetching server info: {str(e)}")
        return {'error': str(e)}

def get_all_developer_complaints():
    try:
        complaints = Complaints.query.join(
            Login, 
            Complaints.sender_login_id == Login.login_id
        ).filter(Login.type_id == 3).all()
        
        return [{
            'id': complaint.complaint_id,
            'subject': complaint.subject,
            'message': complaint.message,
            'send_time': complaint.send_time.strftime('%Y-%m-%d %H:%M:%S'),
            'reply': complaint.reply,
            'reply_time': complaint.reply_time.strftime('%Y-%m-%d %H:%M:%S') if complaint.reply_time else None,
            'status': complaint.status,
            'sender_username': Login.query.filter_by(login_id=complaint.sender_login_id).first().username
        } for complaint in complaints]
    except Exception as e:
        print(f"Error in get_all_developer_complaints: {str(e)}")
        return {"error": str(e)}

def reply_to_developer_complaints(complaint_id, reply, replier_login_id):
    try:
        complaint = Complaints.query.filter_by(complaint_id=complaint_id).first()
        if not complaint:
            return {"error": "Complaint not found"}

        complaint.reply = reply
        complaint.reply_time = datetime.utcnow()
        complaint.replier_login_id = replier_login_id
        complaint.status = 'solved'  # Auto-set to solved when replied
        db.session.commit()

        return {
            'id': complaint.complaint_id,
            'subject': complaint.subject,
            'message': complaint.message,
            'send_time': complaint.send_time.strftime('%Y-%m-%d %H:%M:%S'),
            'reply': complaint.reply,
            'reply_time': complaint.reply_time.strftime('%Y-%m-%d %H:%M:%S'),
            'status': complaint.status,
            'sender_username': Login.query.filter_by(login_id=complaint.sender_login_id).first().username
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def get_all_user_complaints():
    try:
        complaints = Complaints.query.join(
            Login,
            Complaints.sender_login_id == Login.login_id
        ).filter(Login.type_id == 2).all()  # User type_id = 2
        
        return [{
            'id': complaint.complaint_id,
            'subject': complaint.subject,
            'message': complaint.message,
            'send_time': complaint.send_time.strftime('%Y-%m-%d %H:%M:%S'),
            'reply': complaint.reply,
            'reply_time': complaint.reply_time.strftime('%Y-%m-%d %H:%M:%S') if complaint.reply_time else None,
            'status': complaint.status,
            'sender_username': Login.query.filter_by(login_id=complaint.sender_login_id).first().username
        } for complaint in complaints]
    except Exception as e:
        return {"error": str(e)}

def reply_to_user_complaints(complaint_id, reply, replier_login_id):
    try:
        complaint = Complaints.query.filter_by(complaint_id=complaint_id).first()
        if not complaint:
            return {"error": "Complaint not found"}

        complaint.reply = reply
        complaint.reply_time = datetime.utcnow()
        complaint.replier_login_id = replier_login_id
        complaint.status = 'solved'
        db.session.commit()

        return {
            'id': complaint.complaint_id,
            'subject': complaint.subject,
            'message': complaint.message,
            'send_time': complaint.send_time.strftime('%Y-%m-%d %H:%M:%S'),
            'reply': complaint.reply,
            'reply_time': complaint.reply_time.strftime('%Y-%m-%d %H:%M:%S'),
            'status': complaint.status,
            'sender_username': Login.query.filter_by(login_id=complaint.sender_login_id).first().username
        }
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}

def update_admin_password(login_id, current_password, new_password):
    try:
        admin = Login.query.filter_by(login_id=login_id, type_id=1).first()
        if not admin:
            return {"error": "Admin not found"}
            
        if admin.password != current_password:
            return {"error": "Current password is incorrect"}
            
        admin.password = new_password
        db.session.commit()
        
        return {"message": "Password updated successfully"}
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}
    
    
    
    
