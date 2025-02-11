class FaceRegistrationSocket {
  constructor() {
    this.ws = null;
    this.stream = null;
    this.mediaRecorder = null;
    this.onProgress = null;
  }

  async connect(username) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`ws://localhost:5001/ws/face-register/${username}`);
        
        this.ws.onopen = async () => {
          try {
            this.stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: 640,
                height: 480,
                frameRate: { ideal: 10 }
              }
            });

            this.mediaRecorder = new MediaRecorder(this.stream, {
              mimeType: 'video/webm;codecs=vp9',
              videoBitsPerSecond: 1000000
            });

            this.mediaRecorder.ondataavailable = (e) => {
              if (e.data.size > 0 && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(e.data);
              }
            };

            this.mediaRecorder.start(100);
            resolve();
          } catch (err) {
            reject(err);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'progress') {
            this.onProgress?.(data.count);
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  stop() {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }
}

export default FaceRegistrationSocket;