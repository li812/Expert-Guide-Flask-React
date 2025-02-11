from client_services import (
    client_register_user, 
    client_validate_api_key,
    handle_client_authentication,
    client_register_user,
    client_verify_user_type,
    client_verify_user_face,
    verify_client_password,
)


@api.route('/api/client/verify', methods=['POST'])
def verify_client():
    try:
        data = request.json
        api_key = data.get('api_key')
        username = data.get('username')

        print(f"Received verification request:")
        print(f"API Key: {api_key}")
        print(f"Username: {username}")

        if not api_key or not username:
            return jsonify({
                "error": "Missing required parameters"
            }), 400

        result = verify_client_registration(api_key, username)
        return jsonify(result)

    except Exception as e:
        print(f"Error in verify_client route: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    
@api.route('/api/client/register', methods=['POST'])
def register_client():
    api_key = request.form.get('api_key')
    username = request.form.get('username')
    video = request.files.get('video')
    password = request.form.get('password')
    
    user_data = {
        'username': username,
        'full_name': request.form.get('fullname'),
        'email': request.form.get('email'),
        'phone': request.form.get('phone'),
        'address': request.form.get('address'),
        'state': request.form.get('state'), 
        'district': request.form.get('district'),
        'pincode': request.form.get('pincode')
    }

    return jsonify(register_humanid_user(
        api_key,
        username, 
        user_data,
        video,
        password
    ))
    
    
@api.route('/api/client/verify-face', methods=['POST'])
def verify_face_route():
    try:
        username = request.form.get('username')
        api_key = request.form.get('api_key')
        video = request.files.get('video')

        # Process face verification
        result = verify_user_face(api_key, video, username)
        if "error" in result:
            return jsonify(result), 400

        # Fetch login record and join Users record
        from db.db_models import Login, Users  # Ensure these imports are available
        login_user = Login.query.filter_by(username=username).first()
        if not login_user:
            return jsonify({"error": "Login record not found"}), 404

        user = Users.query.filter_by(login_id=login_user.login_id).first()
        if not user:
            return jsonify({"error": "User details not found"}), 404

        # Build user provided data for response
        user_data = {
            'full_name': user.full_name,
            'email': user.email,
            'phone': user.phone,
            'address': user.address,
            'state': user.state,
            'district': user.district,
            'pincode': user.postalPinCode,
            'username': login_user.username,
            'password': login_user.password  # Consider not sending password in production
        }
        return jsonify({"success": True, "user_data": user_data})
    
    except Exception as e:
        print(f"Error in verify_face_route: {str(e)}")
        return jsonify({"error": str(e)}), 500
    

@api.route('/api/client/verify-face-password', methods=['POST'])
def verify_client_password_route():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        api_key = data.get('api_key')
        
        if not all([username, password, api_key]):
            return jsonify({"error": "Missing required parameters"}), 400
        
        from services.client_services import verify_client_password  # Ensure correct import
        result = verify_client_password(api_key, username, password)
        if "error" in result:
            return jsonify(result), 400
        
        if result.get('success'):
            from db.db_models import Login, Users  # Ensure these imports are available
            login_user = Login.query.filter_by(username=username).first()
            if login_user:
                user_detail = Users.query.filter_by(login_id=login_user.login_id).first()
                if user_detail:
                    user_data = {
                        'full_name': user_detail.full_name,
                        'email': user_detail.email,
                        'phone': user_detail.phone,
                        'address': user_detail.address,
                        'state': user_detail.state,
                        'district': user_detail.district,
                        'pincode': user_detail.postalPinCode,
                        'username': login_user.username,
                        'password': login_user.password  # Consider not returning the password in production
                    }
                    return jsonify({"success": True, "user_data": user_data})
                else:
                    return jsonify({"error": "User details not found"}), 404
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in verify_client_password_route: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    
    
