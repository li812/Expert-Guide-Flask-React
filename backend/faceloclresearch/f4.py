import face_recognition
import cv2
import os
import pickle
import numpy as np
from mtcnn import MTCNN
from datetime import datetime, timedelta
import time
from skimage import exposure
from sklearn.decomposition import PCA
from sklearn.preprocessing import Normalizer
from keras_facenet import FaceNet
from skimage.feature import local_binary_pattern

# Security Configuration
SECURITY = {
    'MAX_LOGIN_ATTEMPTS': 3,
    'LOCKOUT_TIME': 30,
    'MIN_FACE_CONFIDENCE': 0.95,
    'MATCH_TOLERANCE': 0.40,
    'LIVENESS_CHECK': False,
    'REQUIRE_EYES_OPEN': True,
    'MIN_FACE_SIZE': 100,
    'MIN_REGISTRATION_VARIANCE': 0.02,
    'MAX_REGISTRATION_YAW': 25,
    'QUALITY_THRESHOLD': 45.0,
    'TEMP_WINDOW_SIZE': 15
}

login_attempts = {}

# Utility Functions
def load_encodings():
    if os.path.exists("user_encodings.pkl"):
        with open("user_encodings.pkl", "rb") as f:
            return pickle.load(f)
    return {}

def save_encodings(data):
    with open("user_encodings.pkl", "wb") as f:
        pickle.dump(data, f)

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

# Image Processing
class FaceProcessor:
    @staticmethod
    def enhance_image(image):
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_clahe = clahe.apply(l)
        lab_clahe = cv2.merge((l_clahe, a, b))
        enhanced = cv2.cvtColor(lab_clahe, cv2.COLOR_LAB2BGR)
        return cv2.GaussianBlur(enhanced, (5, 5), 0)

    @staticmethod
    def align_face(image, landmarks):
        left_eye = landmarks['left_eye']
        right_eye = landmarks['right_eye']
        eye_center = ((left_eye[0] + right_eye[0])/2, (left_eye[1] + right_eye[1])/2)
        dy = right_eye[1] - left_eye[1]
        dx = right_eye[0] - left_eye[0]
        angle = np.degrees(np.arctan2(dy, dx))
        M = cv2.getRotationMatrix2D(eye_center, angle, 1)
        return cv2.warpAffine(image, M, (image.shape[1], image.shape[0]))

# Face Quality Analysis
class FaceQualityAnalyzer:
    @staticmethod
    def estimate_sharpness(image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return cv2.Laplacian(gray, cv2.CV_64F).var()

    @staticmethod
    def estimate_quality(image):
        sharpness = FaceQualityAnalyzer.estimate_sharpness(image)
        hist = cv2.calcHist([image], [0], None, [256], [0, 256])
        contrast = cv2.compareHist(hist, hist, cv2.HISTCMP_CORREL)
        return (sharpness * 0.6) + (contrast * 40)

# Advanced Anti-Spoofing
class AntiSpoof:
    def __init__(self):
        self.blink_state = False
        self.last_blink_time = 0
        self.texture_history = []

    def check_texture(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        lbp = local_binary_pattern(gray, 8, 1, method='uniform')
        hist, _ = np.histogram(lbp, bins=np.arange(0, 10), density=True)
        return np.var(hist)

    def detect_blink(self, landmarks):
        """Calculate eye aspect ratio for MTCNN's 2-point eye landmarks"""
        def ear(eye_points):
            dy = abs(eye_points[1][1] - eye_points[0][1])
            dx = abs(eye_points[1][0] - eye_points[0][0])
            return dy / dx if dx != 0 else 0.0
        
        try:
            left_ear = ear(landmarks['left_eye'])
            right_ear = ear(landmarks['right_eye'])
            return (left_ear + right_ear) / 2.0 < 0.25
        except Exception as e:
            print(f"Blink detection error: {str(e)}")
            return False

    def check_liveness(self, frame, landmarks):
        texture = self.check_texture(frame)
        self.texture_history.append(texture)
        if len(self.texture_history) > 10:
            self.texture_history.pop(0)
        
        texture_var = np.var(self.texture_history)
        blink = self.detect_blink(landmarks)
        
        if blink and not self.blink_state:
            self.blink_state = True
            self.last_blink_time = time.time()
        elif not blink and self.blink_state:
            self.blink_state = False
            
        score = 0
        if texture_var < 0.01:
            score += 0.4
        if time.time() - self.last_blink_time < 2:
            score += 0.3
        if texture > 0.15:
            score += 0.3
            
        return score > 0.7

# Face Tracking
class FaceTracker:
    def __init__(self):
        self.faces = {}
        self.next_id = 0
        self.max_disappeared = 5

    def update(self, detections):
        current_ids = []
        for det in detections:
            centroid = np.array([det['box'][0]+det['box'][2]/2, 
                               det['box'][1]+det['box'][3]/2])
            min_dist, match_id = float('inf'), None
            
            for fid, data in self.faces.items():
                dist = np.linalg.norm(centroid - data['centroid'])
                if dist < min_dist and dist < 50:
                    min_dist, match_id = dist, fid
            
            if match_id is not None:
                self.faces[match_id] = {'centroid': centroid, 'disappeared': 0}
                current_ids.append(match_id)
            else:
                self.faces[self.next_id] = {'centroid': centroid, 'disappeared': 0}
                current_ids.append(self.next_id)
                self.next_id += 1

        for fid in list(self.faces.keys()):
            if fid not in current_ids:
                self.faces[fid]['disappeared'] += 1
                if self.faces[fid]['disappeared'] > self.max_disappeared:
                    del self.faces[fid]

        return current_ids

# Recognition Models
class RecognitionSystem:
    def __init__(self):
        self.normalizer = Normalizer(norm='l2')
        self.face_net = FaceNet()
        self.face_tracker = FaceTracker()
        self.anti_spoof = AntiSpoof()

    def print_progress(self, current, total, prefix="", suffix="", length=30):
        filled = int(length * current // total)
        bar = '█' * filled + '-' * (length - filled)
        print(f'\r{prefix} |{bar}| {current}/{total} {suffix}', end='\r')
        if current == total: 
            print()

    def register_user(self, username, video_path=None):
        print(f"\nStarting registration for {username}...")
        user_data = load_encodings()
        if username in user_data:
            print(f"Error: User {username} already exists!")
            return False

        detector = MTCNN()
        cap = cv2.VideoCapture(video_path) if video_path else cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Error: Could not access video source!")
            return False

        embeddings = []
        quality_check = FaceQualityAnalyzer()
        poses = []
        start_time = time.time()
        frame_count = 0
        success_count = 0

        print("Capturing samples (look directly at the camera):")
        while len(embeddings) < 20 and (time.time() - start_time < 60):
            ret, frame = cap.read()
            if not ret: 
                if video_path: break
                else: continue

            frame_count += 1
            if frame_count % 3 != 0: continue

            enhanced = FaceProcessor.enhance_image(frame)
            faces = detector.detect_faces(enhanced)
            
            if len(faces) != 1:
                print("\rNo face detected - please position face in frame", end='')
                continue

            face = faces[0]
            if face['confidence'] < SECURITY['MIN_FACE_CONFIDENCE']:
                print("\rLow confidence detection - adjusting lighting", end='')
                continue

            x,y,w,h = face['box']
            face_img = enhanced[y:y+h, x:x+w]
            quality = quality_check.estimate_quality(face_img)
            if quality < SECURITY['QUALITY_THRESHOLD']:
                print(f"\rLow quality sample ({quality:.1f}/45.0) - adjusting focus", end='')
                continue

            try:
                yaw = np.degrees(np.arctan2(
                    face['keypoints']['nose'][0] - (face['keypoints']['left_eye'][0] + face['keypoints']['right_eye'][0])/2,
                    face['keypoints']['nose'][1] - (face['keypoints']['left_eye'][1] + face['keypoints']['right_eye'][1])/2
                ))
                if abs(yaw) > SECURITY['MAX_REGISTRATION_YAW']:
                    print(f"\rHead angle too extreme ({yaw:.1f}°) - face forward", end='')
                    continue
            except Exception as e:
                print(f"\rPose estimation failed: {str(e)}", end='')
                continue

            if poses and np.min(np.abs(np.array(poses)-yaw)) < 5:
                print("\rSimilar pose detected - turn head slightly", end='')
                continue

            # Data augmentation
            for aug in [face_img, 
                       cv2.flip(face_img, 1),
                       exposure.adjust_gamma(face_img, 0.8),
                       exposure.adjust_gamma(face_img, 1.2)]:
                try:
                    aligned = FaceProcessor.align_face(aug, face['keypoints'])
                    encoding = face_recognition.face_encodings(aligned)
                    if encoding:
                        embeddings.append(encoding[0])
                        poses.append(yaw)
                        success_count += 1
                        self.print_progress(len(embeddings), 20, 
                                           prefix="Registration Progress:", 
                                           suffix=f"Quality: {quality:.1f} Yaw: {yaw:.1f}°")
                except Exception as e:
                    continue

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

        if len(embeddings) < 10:
            print(f"\nRegistration failed: Only {len(embeddings)} valid samples collected")
            return False

        print("\nProcessing facial features...")
        pca = PCA(n_components=0.95, svd_solver='full')
        reduced = pca.fit_transform(embeddings)
        
        if pca.n_components_ == 0:
            print("Feature extraction failed - insufficient variation")
            return False

        normalized = self.normalizer.transform(reduced)

        user_data[username] = {
            'embedding': np.mean(normalized, axis=0),
            'pca': pca,
            'variance': np.var(normalized, axis=0)
        }
        save_encodings(user_data)
        print(f"\nSuccessfully registered {username} with {len(embeddings)} samples")
        return True

    def verify_user(self, username, video_path=None):
        if not check_login_attempts(username):
            print(f"Account {username} is temporarily locked!")
            return False

        user_data = load_encodings()
        if username not in user_data:
            print(f"User {username} not registered!")
            return False

        print(f"\nStarting verification for {username}...")
        cap = cv2.VideoCapture(video_path) if video_path else cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Error: Could not access video source!")
            return False

        detector = MTCNN()
        embeddings = []
        start_time = time.time()
        last_print = start_time
        timeout = 10  # seconds

        print("Please look directly at the camera:")
        while time.time() - start_time < timeout:
            remaining = timeout - int(time.time() - start_time)
            if time.time() - last_print > 1:
                print(f"\rVerification time remaining: {remaining} seconds", end='')
                last_print = time.time()

            ret, frame = cap.read()
            if not ret: 
                if video_path: break
                else: continue

            enhanced = FaceProcessor.enhance_image(frame)
            faces = detector.detect_faces(enhanced)
            if not faces: 
                print("\rNo face detected - please position face in frame", end='')
                continue

            for face in faces:
                if face['confidence'] < SECURITY['MIN_FACE_CONFIDENCE']:
                    print("\rLow confidence detection - adjusting position", end='')
                    continue

                if SECURITY['LIVENESS_CHECK']:
                    if not self.anti_spoof.check_liveness(enhanced, face['keypoints']):
                        print("\rLiveness check failed - ensure you're real!", end='')
                        continue

                x,y,w,h = face['box']
                face_img = enhanced[y:y+h, x:x+w]
                try:
                    aligned = FaceProcessor.align_face(face_img, face['keypoints'])
                    vgg_enc = face_recognition.face_encodings(aligned)
                    fn_enc = self.face_net.embeddings([cv2.resize(aligned, (160, 160))])[0]
                    
                    if vgg_enc:
                        embeddings.append(vgg_enc[0])
                        embeddings.append(fn_enc)
                        print(f"\rCollected {len(embeddings)//2} valid samples", end='')
                except Exception as e:
                    continue

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()
        print()

        if not embeddings:
            print("Verification failed: No valid samples collected")
            login_attempts[username] = (login_attempts.get(username, (0, None))[0]+1, None)
            return False

        print("Analyzing collected samples...")
        user_emb = user_data[username]
        try:
            pca_embeddings = user_emb['pca'].transform(embeddings)
            normalized = self.normalizer.transform(pca_embeddings)
            mean_embedding = np.mean(normalized, axis=0)
            distance = np.linalg.norm(mean_embedding - user_emb['embedding'])
        except Exception as e:
            print(f"Analysis error: {str(e)}")
            return False

        match = distance < SECURITY['MATCH_TOLERANCE']
        print(f"Match confidence: {(1 - distance)*100:.1f}% (Threshold: {(1 - SECURITY['MATCH_TOLERANCE'])*100:.1f}%)")

        if match:
            login_attempts[username] = (0, None)
            print("Biometric verification successful!")
            return True
        else:
            login_attempts[username] = (login_attempts.get(username, (0, None))[0]+1, None)
            print("Biometric mismatch detected!")
            return False

# Main Interface
def main():
    try:
        system = RecognitionSystem()
    except Exception as e:
        print(f"System initialization failed: {str(e)}")
        return

    while True:
        try:
            print("\nFacial Recognition System")
            print("1. Register User (Webcam)")
            print("2. Register User (Video)")
            print("3. Verify User (Webcam)")
            print("4. Verify User (Video)")
            print("5. List Users")
            print("6. Delete User")
            print("7. Exit")
            
            choice = input("Select option: ")
            
            if choice == '1':
                user = input("Username: ").strip()
                if user:
                    system.register_user(user)
                else:
                    print("Invalid username!")
            elif choice == '2':
                user = input("Username: ").strip()
                path = input("Video path: ").strip()
                if user and os.path.exists(path):
                    system.register_user(user, path)
                else:
                    print("Invalid input!")
            elif choice == '3':
                user = input("Username: ").strip()
                if user:
                    result = system.verify_user(user)
                    print("Access Granted!" if result else "Access Denied!")
                else:
                    print("Invalid username!")
            elif choice == '4':
                user = input("Username: ").strip()
                path = input("Video path: ").strip()
                if user and os.path.exists(path):
                    try:
                        result = system.verify_user(user, path)
                        print("Access Granted!" if result else "Access Denied!")
                    except Exception as e:
                        print(f"Verification failed: {str(e)}")
                else:
                    print("Invalid input!")
                    
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"Error: {str(e)}")


if __name__ == "__main__":
    main()
    
    
    
(h_test) (base) li@Alis-MacBook-Pro HumanID-React %  cd /Users/li/GitHub/HumanID-React ; /usr/bin/env /opt/anacond
a3/envs/h_test/bin/python /Users/li/.vscode/extensions/ms-python.debugpy-2024.14.0-darwin-arm64/bundled/libs/debug
py/adapter/../../debugpy/launcher 61550 -- /Users/li/GitHub/HumanID-React/backend/faceloclresearch/f4.py 
2025-02-03 02:36:11.865453: I metal_plugin/src/device/metal_device.cc:1154] Metal device set to: Apple M1
2025-02-03 02:36:11.865493: I metal_plugin/src/device/metal_device.cc:296] systemMemory: 16.00 GB
2025-02-03 02:36:11.865499: I metal_plugin/src/device/metal_device.cc:313] maxCacheSize: 5.33 GB
2025-02-03 02:36:11.865514: I tensorflow/core/common_runtime/pluggable_device/pluggable_device_factory.cc:305] Could not identify NUMA node of platform GPU ID 0, defaulting to 0. Your kernel may not have been built with NUMA support.
2025-02-03 02:36:11.865525: I tensorflow/core/common_runtime/pluggable_device/pluggable_device_factory.cc:271] Created TensorFlow device (/job:localhost/replica:0/task:0/device:GPU:0 with 0 MB memory) -> physical PluggableDevice (device: 0, name: METAL, pci bus id: <undefined>)

Facial Recognition System
1. Register User (Webcam)
2. Register User (Video)
3. Verify User (Webcam)
4. Verify User (Video)
5. List Users
6. Delete User
7. Exit
Select option: 4
Username: u1
Video path: /Users/li/Desktop/face_test/test5.mov

Starting verification for u1...
Please look directly at the camera:
2025-02-03 02:36:30.838471: I tensorflow/core/grappler/optimizers/custom_graph_optimizer_registry.cc:117] Plugin optimizer for device_type GPU is enabled.
1/1 ━━━━━━━━━━━━━━━━━━━━ 6s 6s/step
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 69ms/steps
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 45ms/step
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 44ms/step
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 44ms/steps
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 44ms/step
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 44ms/step
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 44ms/step
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 44ms/steps
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 44ms/step
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 44ms/step
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 44ms/step
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 45ms/steps
1/1 ━━━━━━━━━━━━━━━━━━━━ 0s 44ms/step

Analyzing collected samples...
Analysis error: setting an array element with a sequence. The requested array has an inhomogeneous shape after 1 dimensions. The detected shape was (14,) + inhomogeneous part.
Access Denied!

Facial Recognition System
1. Register User (Webcam)
2. Register User (Video)
3. Verify User (Webcam)
4. Verify User (Video)
5. List Users
6. Delete User
7. Exit
Select option: 