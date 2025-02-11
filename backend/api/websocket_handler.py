from flask_sockets import Sockets
from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer
from services.face_lock import register_user_face
import cv2
import numpy as np
import base64

class FaceRegistrationHandler:
    def handle_connection(self, ws, username):
        try:
            frames = []
            while not ws.closed:
                message = ws.receive()
                if message is None:
                    break
                    
                # Process received frame data
                frames.append(message)
                if len(frames) >= 10:  # Collect 10 frames
                    try:
                        # Process frames and register face
                        success = register_user_face(username, frames)
                        ws.send(json.dumps({
                            'type': 'complete',
                            'success': success
                        }))
                        break
                    except Exception as e:
                        ws.send(json.dumps({
                            'type': 'error',
                            'message': str(e)
                        }))
                        break
                else:
                    # Send progress update
                    ws.send(json.dumps({
                        'type': 'progress',
                        'count': len(frames)
                    }))
        except Exception as e:
            print(f"WebSocket error: {str(e)}")

def init_websocket(app):
    sockets = Sockets(app)
    
    @sockets.route('/ws/face-register/<username>')
    def face_register(ws, username):
        handler = FaceRegistrationHandler()
        handler.handle_connection(ws, username)
    
    return sockets

def create_websocket_server(app, port=5001):
    server = WSGIServer(('0.0.0.0', port), 
                       app,
                       handler_class=WebSocketHandler)
    return server