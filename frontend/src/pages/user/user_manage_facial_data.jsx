import React, { useState, useRef, useEffect } from 'react';
import {
    Grid,
    Column,
    ContentSwitcher,
    Switch,
    Button,
    Modal,
    ProgressIndicator,
    ProgressStep,
    InlineNotification,
    Tile,
    Stack
} from '@carbon/react';
import {
    FaceDissatisfied,
    FaceSatisfied,
    TrashCan,
    Reset
} from '@carbon/icons-react';

const getSupportedMimeType = () => {
    const types = [
        'video/webm',
        'video/webm;codecs=vp8',
        'video/webm;codecs=vp9',
        'video/mp4',
        'video/mp4;codecs=h264'
    ];
    
    return types.find(type => MediaRecorder.isTypeSupported(type));
};

const UserManageFacialData = () => {
    const [selectedSection, setSelectedSection] = useState(0);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(10);
    const [progress, setProgress] = useState(0);
    
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const chunksRef = useRef([]);

    // Cleanup function for camera resources
    const cleanupCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    // Initialize camera when updating facial data
    useEffect(() => {
        if (selectedSection === 1) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    streamRef.current = stream;
                    videoRef.current.srcObject = stream;
                    setIsVideoReady(true);
                })
                .catch(err => {
                    setError("Failed to access camera: " + err.message);
                });
        }
        return cleanupCamera;
    }, [selectedSection]);

    // Handle delete facial data
    const handleDeleteFacialData = async () => {
        try {
            setIsProcessing(true);
            const response = await fetch('http://localhost:5001/api/user/facial-data', {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to delete facial data');
            
            setSuccess('Facial data deleted successfully');
            setShowDeleteModal(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle update facial data
    const handleUpdateFacialData = async () => {
        try {
            setIsRecording(true);
            setProgress(0);
            chunksRef.current = [];

            const stream = videoRef.current.srcObject;
            const mimeType = getSupportedMimeType();
            
            if (!mimeType) {
                throw new Error('No supported video format found');
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: 2500000
            });

            mediaRecorderRef.current = mediaRecorder;

            // Rest of the function remains the same
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const formData = new FormData();
                formData.append('video', blob);

                const response = await fetch('http://localhost:5001/api/user/facial-data', {
                    method: 'PUT',
                    credentials: 'include',
                    body: formData
                });

                if (!response.ok) throw new Error('Failed to update facial data');
                
                setSuccess('Facial data updated successfully');
                cleanupCamera();
            };

            mediaRecorder.start(1000);

            // Record for 10 seconds
            const timer = setInterval(() => {
                setRecordingTime(prev => {
                    const newTime = prev - 1;
                    setProgress((10 - newTime) * 10);
                    return newTime;
                });
            }, 1000);

            setTimeout(() => {
                clearInterval(timer);
                if (mediaRecorderRef.current?.state === "recording") {
                    mediaRecorderRef.current.stop();
                }
                setIsRecording(false);
                setRecordingTime(10);
            }, 10000);

        } catch (err) {
            setError(err.message);
            setIsRecording(false);
        }
    };

    return (
        <Grid className="facial-data-page">
            <Column lg={16} md={8} sm={4}>
                <ContentSwitcher onChange={({index}) => setSelectedSection(index)} selectedIndex={selectedSection}>
                    <Switch name="delete" text="Delete Facial Data" />
                    <Switch name="update" text="Update Facial Data" />
                </ContentSwitcher>

                <Tile className="facial-data-section">
                    {selectedSection === 0 ? (
                        <Stack gap={7}>
                            <h2>Delete Facial Data</h2>
                            <p>Warning: This will remove your facial recognition data. You'll need to set it up again for face login.</p>
                            <Button
                                kind="danger"
                                renderIcon={TrashCan}
                                onClick={() => setShowDeleteModal(true)}
                                disabled={isProcessing}
                            >
                                Delete Facial Data
                            </Button>
                        </Stack>
                    ) : (
                        <Stack gap={7}>
                            <h2>Update Facial Data</h2>
                            <div className="video-container">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    style={{
                                        width: '100%',
                                        maxWidth: '500px',
                                        borderRadius: '8px'
                                    }}
                                />
                            </div>
                            
                            <ProgressIndicator
                                currentIndex={isRecording ? 1 : 0}
                                spaceEqually
                            >
                                <ProgressStep
                                    label="Ready"
                                    secondaryLabel="Position your face"
                                />
                                <ProgressStep
                                    label="Recording"
                                    secondaryLabel={`${recordingTime}s remaining`}
                                />
                                <ProgressStep
                                    label="Complete"
                                    secondaryLabel="Processing"
                                />
                            </ProgressIndicator>

                            <Button
                                renderIcon={isRecording ? FaceDissatisfied : FaceSatisfied}
                                onClick={handleUpdateFacialData}
                                disabled={!isVideoReady || isRecording}
                            >
                                {isRecording ? `Recording: ${recordingTime}s` : 'Start Recording'}
                            </Button>
                        </Stack>
                    )}
                </Tile>

                {error && (
                    <InlineNotification
                        kind="error"
                        title="Error"
                        subtitle={error}
                        onCloseButtonClick={() => setError(null)}
                    />
                )}
                
                {success && (
                    <InlineNotification
                        kind="success"
                        title="Success"
                        subtitle={success}
                        onCloseButtonClick={() => setSuccess(null)}
                    />
                )}

                <Modal
                    open={showDeleteModal}
                    modalHeading="Delete Facial Data"
                    primaryButtonText="Delete"
                    secondaryButtonText="Cancel"
                    danger
                    onRequestSubmit={handleDeleteFacialData}
                    onRequestClose={() => setShowDeleteModal(false)}
                >
                    <p>Are you sure you want to delete your facial recognition data? This action cannot be undone.</p>
                </Modal>
            </Column>
        </Grid>
    );
};

export default UserManageFacialData;