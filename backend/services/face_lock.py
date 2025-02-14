import face_recognition
import cv2
import os
import pickle
import numpy as np
from mtcnn import MTCNN
from datetime import datetime, timedelta
import time

# Update security settings
SECURITY = {
    'MAX_LOGIN_ATTEMPTS': 3,
    'LOCKOUT_TIME': 30,
    'MIN_FACE_CONFIDENCE': 0.95,
    'MATCH_TOLERANCE': 0.40,  
    'LIVENESS_CHECK': False,   
    'REQUIRE_EYES_OPEN': True,
    'MIN_FACE_SIZE': 100,
}

# Add login attempt tracking
login_attempts = {}

def check_login_attempts(username):
    now = datetime.now()
    if username in login_attempts:
        attempts, lockout_time = login_attempts[username]
        if lockout_time and now < lockout_time:
            return False
        if attempts >= SECURITY['MAX_LOGIN_ATTEMPTS']:
            login_attempts[username] = (0, now + timedelta(seconds=SECURITY['LOCKOUT_TIME']))
            return False
    return True

class AntiSpoofing:
    @staticmethod 
    def check_liveness(frame, landmarks):
        # MTCNN returns landmarks as [x,y] coordinates
        left_eye = np.array([[landmarks['left_eye'][0], landmarks['left_eye'][1]]])
        right_eye = np.array([[landmarks['right_eye'][0], landmarks['right_eye'][1]]])
        
        # Simplified liveness check for video
        if left_eye[0][0] == 0 or right_eye[0][0] == 0:
            return False
        return True

def align_face(image, landmarks):
    left_eye = landmarks['left_eye']
    right_eye = landmarks['right_eye']
    eye_center = ((left_eye[0] + right_eye[0]) / 2, (left_eye[1] + right_eye[1]) / 2)

    dy = right_eye[1] - left_eye[1]
    dx = right_eye[0] - left_eye[0]
    angle = np.degrees(np.arctan2(dy, dx))

    M = cv2.getRotationMatrix2D(eye_center, angle, 1)
    aligned_image = cv2.warpAffine(image, M, (image.shape[1], image.shape[0]))
    return aligned_image

def enhance_image(image):
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_clahe = clahe.apply(l)
    
    lab_clahe = cv2.merge((l_clahe, a, b))
    
    enhanced_image = cv2.cvtColor(lab_clahe, cv2.COLOR_LAB2BGR)
    
    blurred_image = cv2.GaussianBlur(enhanced_image, (5, 5), 0)
    
    return blurred_image

def register_user_face(user_name):
    if os.path.exists("user_encodings.pickle"):
        with open("user_encodings.pickle", "rb") as f:
            user_encodings = pickle.load(f)
    else:
        user_encodings = {}

    if user_name in user_encodings:
        print(f"Username '{user_name}' is already registered. Please choose a different username.")
        return

    video_capture = cv2.VideoCapture(0)
    detector = MTCNN()
    print("Capturing face for user:", user_name)
    
    captured_images = []
    num_captures = 10
    
    print(f"Please ensure only your face is visible and well-lit. Capturing {num_captures} images...")
    while len(captured_images) < num_captures:
        ret, frame = video_capture.read()
        if not ret:
            print("Failed to capture image from webcam. Please check your webcam.")
            break

        enhanced_frame = enhance_image(frame)
        detections = detector.detect_faces(enhanced_frame)
        
        if detections and len(detections) == 1:
            detection = detections[0]
            
            if detection['confidence'] < SECURITY['MIN_FACE_CONFIDENCE']:
                print("Low confidence face detected. Skipping...")
                continue
                
            if SECURITY['LIVENESS_CHECK'] and not AntiSpoofing.check_liveness(enhanced_frame, detection['keypoints']):
                print("Liveness check failed! Please ensure your eyes are open.")
                continue

            aligned_face = align_face(enhanced_frame, detection['keypoints'])
            x, y, w, h = detection['box']
            cropped_face = aligned_face[y:y+h, x:x+w]
            resized_face = cv2.resize(cropped_face, (150, 150))
            captured_images.append(resized_face)
            
            cv2.putText(enhanced_frame, f"Captures: {len(captured_images)}/{num_captures}", 
                        (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.imshow('Registration - Keep Face in Frame', enhanced_frame)
            cv2.waitKey(500)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    video_capture.release()
    cv2.destroyAllWindows()

    if captured_images:
        encodings = []
        for img in captured_images:
            face_encodings = face_recognition.face_encodings(img)
            if face_encodings:
                encodings.append(face_encodings[0])

        user_encoding = np.mean(encodings, axis=0)

        user_encodings[user_name] = user_encoding
        with open("user_encodings.pickle", "wb") as f:
            pickle.dump(user_encodings, f)

        print(f"{user_name} registered successfully.")
    else:
        print("No face detected. Registration failed.")

def register_user_face_video(username, video_path):
    if os.path.exists("user_encodings.pickle"):
        with open("user_encodings.pickle", "rb") as f:
            user_encodings = pickle.load(f)
    else:
        user_encodings = {}

    if username in user_encodings:
        print(f"Username '{username}' already exists.")
        return False

    detector = MTCNN()
    video = cv2.VideoCapture(video_path)
    captured_images = []
    num_captures = 10
    frame_interval = 15  # Capture every 15th frame
    frame_count = 0

    while len(captured_images) < num_captures:
        ret, frame = video.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % frame_interval != 0:
            continue

        enhanced_frame = enhance_image(frame)
        detections = detector.detect_faces(enhanced_frame)
        
        if detections and len(detections) == 1:
            detection = detections[0]
            if detection['confidence'] >= SECURITY['MIN_FACE_CONFIDENCE']:
                aligned_face = align_face(enhanced_frame, detection['keypoints'])
                x, y, w, h = detection['box']
                if w >= SECURITY['MIN_FACE_SIZE'] and h >= SECURITY['MIN_FACE_SIZE']:
                    cropped_face = aligned_face[y:y+h, x:x+w]
                    resized_face = cv2.resize(cropped_face, (150, 150))
                    captured_images.append(resized_face)
                    print(f"Captured face {len(captured_images)}/{num_captures}")

    video.release()

    if len(captured_images) < num_captures:
        print("Not enough valid faces captured from video.")
        return False

    # Process and save encodings
    encodings = []
    for img in captured_images:
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        face_encodings = face_recognition.face_encodings(rgb_img)
        if face_encodings:
            encodings.append(face_encodings[0])

    if encodings:
        user_encoding = np.mean(encodings, axis=0)
        user_encodings[username] = user_encoding
        with open("user_encodings.pickle", "wb") as f:
            pickle.dump(user_encodings, f)
        print(f"{username} registered successfully.")
        return True
    return False

def process_video_for_login(video_path):
    detector = MTCNN()
    video_capture = cv2.VideoCapture(video_path)
    face_encodings = []
    frame_count = 0
    
    # Get video properties
    total_frames = int(video_capture.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = int(video_capture.get(cv2.CAP_PROP_FPS))
    
    # Sample frames at regular intervals
    sample_interval = max(1, total_frames // 30)  # Get ~30 samples
    
    while video_capture.isOpened():
        ret, frame = video_capture.read()
        if not ret:
            break
            
        frame_count += 1
        if frame_count % sample_interval != 0:
            continue
            
        enhanced_frame = enhance_image(frame)
        detections = detector.detect_faces(enhanced_frame)
        
        if detections:
            detection = detections[0]
            
            if detection['confidence'] < SECURITY['MIN_FACE_CONFIDENCE']:
                continue
            
            # Optional liveness check
            if SECURITY['REQUIRE_EYES_OPEN']:
                if not AntiSpoofing.check_liveness(enhanced_frame, detection['keypoints']):
                    continue
                    
            aligned_face = align_face(enhanced_frame, detection['keypoints'])
            encodings = face_recognition.face_encodings(aligned_face)
            if encodings:
                face_encodings.append(encodings[0])
                
        # Display progress
        print(f"\rProcessing video: {frame_count/total_frames*100:.1f}%", end="")
        
        if len(face_encodings) >= 10:  # Stop after collecting enough samples
            break
            
    video_capture.release()
    print("\nVideo processing complete")
    return face_encodings

def process_face_for_encoding(frame):
    # Convert to RGB for face_recognition library
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    enhanced_frame = enhance_image(rgb_frame)
    detections = detector.detect_faces(enhanced_frame)
    
    if not detections:
        return None
        
    detection = detections[0]
    if detection['confidence'] < SECURITY['MIN_FACE_CONFIDENCE']:
        return None
        
    # Get face size
    x, y, w, h = detection['box']
    if w < SECURITY['MIN_FACE_SIZE'] or h < SECURITY['MIN_FACE_SIZE']:
        return None
        
    aligned_face = align_face(enhanced_frame, detection['keypoints'])
    return face_recognition.face_encodings(aligned_face)[0] if face_recognition.face_encodings(aligned_face) else None

def check_user_face(username, video_path=None):
    if not check_login_attempts(username):
        print("Account temporarily locked. Please try again later.")
        return False

    try:
        with open("user_encodings.pickle", "rb") as f:
            user_encodings = pickle.load(f)
    except FileNotFoundError:
        print("Error: No registered users found. Please register first.")
        return False
    except Exception as e:
        print(f"Error loading user encodings: {e}")
        return False

    if username not in user_encodings:
        print("Username not registered.")
        return False

    face_encodings = []
    if video_path:
        face_encodings = process_video_for_login(video_path)
    else:
        face_encodings = process_webcam_for_login()

    if not face_encodings:
        login_attempts[username] = (login_attempts.get(username, (0, None))[0] + 1, None)
        return False

    match = face_recognition.compare_faces(
        [user_encodings[username]], 
        np.mean(face_encodings, axis=0), 
        tolerance=SECURITY['MATCH_TOLERANCE']
    )

    if not match[0]:
        login_attempts[username] = (login_attempts.get(username, (0, None))[0] + 1, None)
    else:
        login_attempts[username] = (0, None)

    return match[0]

def process_webcam_for_login():
    detector = MTCNN()
    video_capture = cv2.VideoCapture(0)
    face_encodings = []
    start_time = time.time()
    timeout = 5

    while time.time() - start_time < timeout:
        ret, frame = video_capture.read()
        if not ret:
            break

        enhanced_frame = enhance_image(frame)
        detections = detector.detect_faces(enhanced_frame)
        
        remaining_time = int(timeout - (time.time() - start_time))
        cv2.putText(frame, f"Time remaining: {remaining_time}s", 
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.imshow('Verification - Keep Face in Frame', frame)
        
        if detections:
            detection = detections[0]
            if detection['confidence'] >= SECURITY['MIN_FACE_CONFIDENCE']:
                aligned_face = align_face(enhanced_frame, detection['keypoints'])
                encodings = face_recognition.face_encodings(aligned_face)
                if encodings:
                    face_encodings.append(encodings[0])

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    video_capture.release()
    cv2.destroyAllWindows()
    return face_encodings

def show_registered_user_face():
    if os.path.exists("user_encodings.pickle"):
        with open("user_encodings.pickle", "rb") as f:
            user_encodings = pickle.load(f)
        print("List of registered users:")
        for user in user_encodings.keys():
            print(user)
    else:
        print("No registered users found.")

def delete_user_face(username):
    if os.path.exists("user_encodings.pickle"):
        with open("user_encodings.pickle", "rb") as f:
            user_encodings = pickle.load(f)
        
        if username in user_encodings:
            del user_encodings[username]
            with open("user_encodings.pickle", "wb") as f:
                pickle.dump(user_encodings, f)
            print(f"Deleted {username}'s facial encodings.")
        else:
            print(f"Username '{username}' not found.")
    else:
        print("No registered users found.")

def main():
    while True:
        print("\n1. Register new user (Webcam)")
        print("2. Register new user (Video)")
        print("3. Login (Webcam)")
        print("4. Login (Video)")
        print("5. Show registered faces")
        print("6. Delete face")
        print("7. Exit")
        
        choice = input("Enter your choice (1-7): ")
        
        if choice == '1':
            username = input("Enter username to register: ")
            register_user_face(username)
        elif choice == '2':
            username = input("Enter username to register: ")
            video_path = input("Enter path to video file: ")
            register_user_face_video(username, video_path)
        elif choice == '3' or choice == '4':
            username = input("Enter username to login: ")
            if choice == '4':
                video_path = input("Enter path to video file: ")
                success = check_user_face(username, video_path)
            else:
                success = check_user_face(username)
                
            if success:
                print("Login successful!")
            else:
                attempts = login_attempts.get(username, (0, None))[0]
                remaining = SECURITY['MAX_LOGIN_ATTEMPTS'] - attempts
                print(f"Login failed. {remaining} attempts remaining.")
        elif choice == '5':
            show_registered_user_face()
        elif choice == '6':
            username = input("Enter username to delete: ")
            delete_user_face(username)
        elif choice == '7':
            print("Exiting...")
            break
        else:
            print("Invalid choice. Please try again.")
            
            


if __name__ == "__main__":
    main()

