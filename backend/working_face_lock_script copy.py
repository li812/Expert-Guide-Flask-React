import face_recognition
import cv2
import os
import pickle
import numpy as np
from mtcnn import MTCNN

def enhance_image(image):
    # Convert image to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply histogram equalization
    equalized_image = cv2.equalizeHist(gray_image)
    
    # Apply Gaussian blur to reduce noise
    blurred_image = cv2.GaussianBlur(equalized_image, (5, 5), 0)
    
    # Convert back to BGR
    enhanced_image = cv2.cvtColor(blurred_image, cv2.COLOR_GRAY2BGR)
    
    return enhanced_image

def align_face(image, landmarks):
    # Calculate the center of the eyes
    left_eye = landmarks['left_eye']
    right_eye = landmarks['right_eye']
    eye_center = ((left_eye[0] + right_eye[0]) / 2, (left_eye[1] + right_eye[1]) / 2)

    # Calculate the angle to rotate the face
    dy = right_eye[1] - left_eye[1]
    dx = right_eye[0] - left_eye[0]
    angle = np.degrees(np.arctan2(dy, dx))

    # Rotate the image around the eye center
    M = cv2.getRotationMatrix2D(eye_center, angle, 1)
    aligned_image = cv2.warpAffine(image, M, (image.shape[1], image.shape[0]))

    return aligned_image

def register_user_face(user_name):
    # Load existing encodings if available
    if os.path.exists("user_encodings.pickle"):
        with open("user_encodings.pickle", "rb") as f:
            user_encodings = pickle.load(f)
    else:
        user_encodings = {}

    # Check if the username already exists
    if user_name in user_encodings:
        print(f"Username '{user_name}' is already registered. Please choose a different username.")
        return

    # Initialize the webcam and MTCNN detector
    video_capture = cv2.VideoCapture(0)
    detector = MTCNN()
    print("Capturing face for user:", user_name)
    
    captured_images = []
    num_captures = 10  # Changed from 5 to 10
    
    print(f"Please stay still. Capturing {num_captures} images...")
    while len(captured_images) < num_captures:  # Capture 5 different images
        ret, frame = video_capture.read()
        enhanced_frame = enhance_image(frame)
        detections = detector.detect_faces(enhanced_frame)
        
        if detections:
            # Align the detected face
            aligned_face = align_face(enhanced_frame, detections[0]['keypoints'])
            captured_images.append(aligned_face)
            # cv2.imshow('Captured Face', aligned_face)
            cv2.waitKey(500)  # Wait for 500ms between captures to get different images
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the webcam and close windows
    video_capture.release()
    cv2.destroyAllWindows()

    # Encode the faces
    if captured_images:
        encodings = []
        for img in captured_images:
            face_encodings = face_recognition.face_encodings(img)
            if face_encodings:
                encodings.append(face_encodings[0])

        # Average the encodings to get a single encoding
        user_encoding = np.mean(encodings, axis=0)

        # Save the new user encoding
        user_encodings[user_name] = user_encoding
        with open("user_encodings.pickle", "wb") as f:
            pickle.dump(user_encodings, f)

        print(f"{user_name} registered successfully.")
    else:
        print("No face detected. Registration failed.")

def check_user_face(username):
    # Load user face encodings
    with open("user_encodings.pickle", "rb") as f:
        user_encodings = pickle.load(f)
    
    # Check if the username exists in the database
    if username not in user_encodings:
        print("Username not found. Please register first.")
        return

    # Initialize the webcam and MTCNN detector
    video_capture = cv2.VideoCapture(0)
    detector = MTCNN()
    print("Looking for face...")

    while True:
        ret, frame = video_capture.read()
        if not ret:
            print("Failed to capture image from webcam. Please check your webcam.")
            break

        enhanced_frame = enhance_image(frame)
        detections = detector.detect_faces(enhanced_frame)
        
        if detections:
            # Align the detected face
            aligned_face = align_face(enhanced_frame, detections[0]['keypoints'])
            face_encodings = face_recognition.face_encodings(aligned_face)

            for face_encoding in face_encodings:
                # Check if the face encoding matches the stored encoding for the username
                match = face_recognition.compare_faces([user_encodings[username]], face_encoding, tolerance=0.6)
                
                if match[0]:
                    print(f"Login successful for user: {username}")
                    video_capture.release()
                    cv2.destroyAllWindows()
                    return username

        cv2.imshow('Video', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the webcam and close windows
    video_capture.release()
    cv2.destroyAllWindows()

    print("Face not recognized. Login failed.")
    return None


def show_registered_user_face():
    # Load existing encodings if available
    if os.path.exists("user_encodings.pickle"):
        with open("user_encodings.pickle", "rb") as f:
            user_encodings = pickle.load(f)
        print("List of registered users:")
        for user in user_encodings.keys():
            print(user)
    else:
        print("No registered users found.")
        
        
def delete_user_face(username):
    # Load existing encodings if available
    if os.path.exists("user_encodings.pickle"):
        with open("user_encodings.pickle", "rb") as f:
            user_encodings = pickle.load(f)
        
        # Check if the username exists
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
        print("\n1. Register new user")
        print("2. Login")
        print("3. Show registered faces")
        print("4. Delete face")
        print("5. Exit")
        choice = input("Enter your choice (1-5): ")

        if choice == '1':
            username = input("Enter username to register: ")
            register_user_face(username)
        elif choice == '2':
            username = input("Enter username to login: ")
            check_user_face(username)
        elif choice == '3':
            show_registered_user_face()
        elif choice == '4':
            username = input("Enter username to delete: ")
            delete_user_face(username)
        elif choice == '5':
            print("Exiting...")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()