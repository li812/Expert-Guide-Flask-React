import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextInput,
  Button,
  Form,
  Stack,
  Grid,
  Column,
  Tile,
  PasswordInput,
  InlineLoading,
  ProgressIndicator,
  ProgressStep,
  InlineNotification,
  Loading,
  AspectRatio,
} from "@carbon/react";
import {
  UserAvatar,
  Password,
  FaceDissatisfied,
  FaceSatisfied,
  ArrowRight,
  Login as LoginIcon,
  Information,
} from "@carbon/icons-react";
import { Security } from "@carbon/pictograms-react";
import illustration from "../assets/illustration-final.svg";
import "./Login.css";

// Helper function to get supported MIME type
const getSupportedMimeType = () => {
  console.log("Checking supported MIME types...");
  const types = [
    "video/mp4", // Most widely supported
    "video/webm",
    "video/webm;codecs=vp8",
    "video/webm;codecs=vp9",
    "video/mp4;codecs=h264",
  ];

  const supported = types.find((type) => {
    const isSupported = MediaRecorder.isTypeSupported(type);
    console.log(`${type}: ${isSupported}`);
    return isSupported;
  });

  if (!supported) {
    throw new Error("No supported video format found");
  }

  return supported;
};

// Cleanup camera resources
const cleanupCamera = (streamRef, mediaRecorderRef, videoRef, chunksRef) => {
  try {
    console.log("Cleaning up camera resources...");

    // Stop media recorder if active
    if (mediaRecorderRef.current?.state === "recording") {
      console.log("Stopping media recorder");
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      console.log("Stopping stream tracks");
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear video element reference
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Reset references
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  } catch (error) {
    console.error("Error in cleanupCamera:", error);
  }
};

const LOGIN_STEPS = {
  IDENTIFIER: 1,
  FACE_VERIFY: 2,
  PASSWORD: 3,
};

const Login = () => {
  // Core states
  const [step, setStep] = useState(LOGIN_STEPS.IDENTIFIER);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Face verification states
  const videoRef = useRef(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(15);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const MAX_CAPTURES = 3;
  const [countdown, setCountdown] = useState(3);
  const [videoProcessing, setVideoProcessing] = useState(false);

  // Media references
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Handle identifier submission
  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    console.log("Identifier submitted:", identifier);
    try {
      const response = await fetch("http://localhost:5001/api/check-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();
      console.log("Identifier response data:", data);

      const face_lock = true;

      if (face_lock == true) {
        if (response.ok) {
          setUserType(data.type);
          if (data.type === 2) {
            setStep(LOGIN_STEPS.FACE_VERIFY);
          } else {
            setStep(LOGIN_STEPS.PASSWORD);
          }
        } else {
          setError(data.error);
        }
      }
      else {
        if (response.ok) {
          setUserType(data.type);
          setStep(LOGIN_STEPS.PASSWORD);


        } else {
          setError(data.error);
        }
      }
    } catch (err) {
      console.error("Failed to verify credentials:", err);
      setError("Failed to verify credentials");
    }
  };

  // Handle face verification
  const handleFaceVerification = async () => {
    try {
      // Immediately set states to show recording has started
      setIsVerifying(true);
      setVideoProcessing(true); // Add this to show immediate feedback
      console.log("Starting face verification...");
      chunksRef.current = [];

      const stream = videoRef.current.srcObject;
      console.log("Got video stream:", stream);

      const mimeType = getSupportedMimeType();
      console.log("Selected MIME type:", mimeType);

      if (!mimeType) {
        throw new Error("No supported video MIME type found");
      }

      // Set videoProcessing to false once we're about to start actual recording
      setVideoProcessing(false);

      console.log("Creating MediaRecorder...");
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 25000,
      });
      console.log("MediaRecorder created successfully");

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        console.log("Data available:", e.data.size, "bytes");
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          // Set processing state back to true during upload and processing
          setVideoProcessing(true);
          console.log("MediaRecorder stopped");
          const blob = new Blob(chunksRef.current, { type: mimeType });
          console.log("Created video blob:", blob.size, "bytes");

          const formData = new FormData();
          formData.append("video", blob, `${identifier}_${Date.now()}.webm`);
          formData.append("username", identifier);

          console.log("Sending video to server...");
          const response = await fetch("http://localhost:5001/api/verify-face", {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          console.log("Server response:", response.status);
          if (!response.ok) {
            throw new Error("Face verification failed");
          }

          const data = await response.json();
          console.log("Verification result:", data);

          if (data.success) {
            cleanupCamera(streamRef, mediaRecorderRef, videoRef, chunksRef);
            console.log("Face verification successful, navigating to user page");
            navigate("/user");
          } else {
            console.log("Face verification failed, falling back to password");
            setStep(LOGIN_STEPS.PASSWORD);
          }
        } catch (error) {
          console.error("Error in verification:", error);
          setError(error.message);
          setStep(LOGIN_STEPS.PASSWORD);
        } finally {
          // Make sure to reset processing state if there's an error
          setVideoProcessing(false);
        }
      };

      // Start recording
      console.log("Starting MediaRecorder...");
      mediaRecorder.start(1000);
      console.log("MediaRecorder started");

      // Record for 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          console.log("Stopping recording after 5s");
          mediaRecorderRef.current.stop();
        }
      }, 2500);
    } catch (error) {
      console.error("Error starting verification:", error);
      setError(error.message);
      setStep(LOGIN_STEPS.PASSWORD);
      setIsVerifying(false);
      setVideoProcessing(false);
    }
  };

  // Handle password verification
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    console.log("Password submitted for identifier:", identifier);
    console.log("Password value:", password);

    try {
      const response = await fetch("http://localhost:5001/api/verify-password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password: password.trim(),
        }),
      });

      const data = await response.json();
      console.log("Password verification response data:", data);

      if (response.ok && data.success) {
        switch (data.type) {
          case 1:
            navigate("/admin");
            break;
          case 2:
            navigate("/user");
            break;
          case 3:
            navigate("/developer");
            break;
          default:
            setError("Invalid user type");
        }
      } else {
        setError(data.error || "Invalid credentials");
        console.error("Login failed:", data.error);
      }
    } catch (err) {
      console.error("Password verification failed:", err);
      setError("Invalid credentials");
    }
  };

  // Initialize video when on face verification step
  useEffect(() => {
    if (step === LOGIN_STEPS.FACE_VERIFY) {
      let isMounted = true;

      const initializeCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (isMounted && videoRef.current) {
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            setIsVideoReady(true);
          }
        } catch (err) {
          if (isMounted) {
            console.error("Camera error:", err);
            setError("Camera access required for verification");
            setStep(LOGIN_STEPS.PASSWORD);
          }
        }
      };

      initializeCamera();

      return () => {
        isMounted = false;
        cleanupCamera(streamRef, mediaRecorderRef, videoRef, chunksRef);
      };
    }
  }, [step]);

  useEffect(() => {
    let timer;
    if (isVerifying) {
      timer = setInterval(() => {
        setCountdown(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVerifying]);

  return (
    <Grid className="login-page" fullWidth>
      {/* Progress Indicator */}
      <Column lg={16} md={8} sm={4}>
        <ProgressIndicator currentIndex={step - 1}>
          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              hideCloseButton
            />
          )}
          <ProgressStep
            label="Step 1"
            description="Enter Credentials"
            secondaryLabel="Username/Email"
          />
          <ProgressStep
            label="Step 2"
            description="Verification"
            // secondaryLabel="Face/Password"
            secondaryLabel="Password"
          />
          <ProgressStep
            label="Step 3"
            description="Complete"
            secondaryLabel="Login"
          />
        </ProgressIndicator>
      </Column>

      {/* Step 1: Identifier Input */}
      {step === LOGIN_STEPS.IDENTIFIER && (
        <>
          <Column lg={5} md={4} sm={4}>
            <Tile className="login-tile">
              <Stack gap={7}>
                <Security className="login-pictogram" />
                <h1>Welcome to Expert Guide</h1>
                <p>Enter your username or email to continue</p>
                <Form onSubmit={handleIdentifierSubmit}>
                  <Stack gap={6}>
                    <TextInput
                      id="identifier"
                      labelText="Username or Email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      helperText="Enter your registered email or username"
                      required
                    />
                    <Button
                      type="submit"
                      renderIcon={ArrowRight}
                      className="submit-button"
                      size="lg"
                    >
                      Continue
                    </Button>
                  </Stack>
                </Form>
                <div className="account-creation">
                  <Stack gap={4}>
                    <p>Don't have an account?</p>
                    <div className="button-container">
                      <Button
                        kind="tertiary"
                        renderIcon={ArrowRight}
                        onClick={() => navigate("/register-user")}
                        className="register-button"
                        size="lg"
                      >
                        Register as User
                      </Button>

                    </div>
                  </Stack>
                </div>
              </Stack>
            </Tile>
          </Column>
          <Column lg={11} md={4} sm={4} className="illustration-column">
            <AspectRatio ratio="16x9">
              <img src={illustration} alt="Login Illustration" className="login-illustration" />
            </AspectRatio>
          </Column>
        </>
      )}

      {/* Step 2: Face Verification */}
      {step === LOGIN_STEPS.FACE_VERIFY && (
        <Column lg={{ span: 8, offset: 4 }} md={{ span: 6, offset: 1 }} sm={4}>
          <Tile className="face-verify-tile">
            <Stack gap={5}>

              <h2>Face Verification</h2>
              <div className="video-container">
                {!isVideoReady && <Loading description="Initializing camera..." small />}
                <video ref={videoRef} autoPlay playsInline />
              </div>
              {isVideoReady && (
                <Stack gap={5} >
                  <div className="flex flex-col items-center justify-center min-h-screen space-y-4">

                    <Button kind="ghost" disabled>
                      Ensure your face is centered   and lited
                    </Button>
                    <Button
                      id="start-verification-button"
                      kind="primary"
                      onClick={handleFaceVerification}
                      disabled={isVerifying}
                      renderIcon={isVerifying ? FaceDissatisfied : FaceSatisfied}
                      className="verify-button"
                      size="lg"
                    >
                      {isVerifying ? (
                        videoProcessing ? (
                          <InlineLoading description="Anlysing your facial data..." />
                        ) : (
                          <InlineLoading description={`Starting facial verification...`} />
                        )
                      ) : (
                        "Start Verification"
                      )}
                    </Button>
                  </div>
                </Stack>
              )}
            </Stack>
          </Tile>
        </Column>
      )}

      {/* Step 3: Password Input */}
      {step === LOGIN_STEPS.PASSWORD && (
        <>
          <Column lg={5} md={4} sm={4}>
            <Tile className="login-tile">
              <Stack gap={7}>
                <Security className="login-pictogram" />
                <h1>Welcome to Expert Guide</h1>
                <p>Enter your password to continue</p>
                <Form onSubmit={handlePasswordSubmit}>
                  <Stack gap={6}>
                    <PasswordInput
                      id="password"
                      labelText="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      required
                    />
                    <Button type="submit" className="submit-button">
                      <LoginIcon /> Login
                    </Button>
                  </Stack>
                </Form>
                <div className="account-creation">
                  <p>Don't have an account?</p>
                  <div className="button-container">
                    <Button
                      kind="tertiary"
                      onClick={() => navigate("/register-user")}
                      className="register-button"
                    >
                      Register as User
                    </Button>
                  </div>
                </div>
              </Stack>
            </Tile>
          </Column>
          <Column lg={11} md={4} sm={4} className="illustration-column">
            <img src={illustration} alt="Login Illustration" className="login-illustration" />
          </Column>
        </>
      )}
    </Grid>
  );
};

export default Login;