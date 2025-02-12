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
  ProgressIndicator,
  ProgressStep,
  FileUploader,
  DatePicker,
  DatePickerInput,
  Dropdown,
  TextArea,
  PasswordInput,
  RadioButtonGroup,
  RadioButton,
  ProgressBar
} from "@carbon/react";
import illustration from "../assets/illustration-final.svg";
import "./RegisterUser.css";
import statesAndDistricts from "../components/StatesAndDistricts.jsx";

// Add these constants at the top
const FACE_REGISTRATION_STEPS = {
  READY: 'Ready to start',
  CAPTURING: 'Capturing video frames',
  PROCESSING: 'Processing video',
  TRAINING: 'Training facial recognition',
  FINISHED: 'Registration complete'
};

// Update validation rules
const VALIDATION_RULES = {
  aadhaar: {
    length: 12,
    pattern: /^(\d{12})?$/,
    message: "Must be 12 digits (e.g., 444433332222)",
    format: "444433332222",
  },
  pan: {
    length: 10,
    pattern: /^([A-Z]{5}[0-9]{4}[A-Z])?$/,
    message: "Format: XXXXX9999X (e.g., ABCDE1234F)",
    format: "ABCDE1234F",
  },
  passport: {
    length: 8,
    pattern: /^([A-Z][0-9]{7})?$/,
    message: "Format: A9999999 (e.g., M1234567)",
    format: "M1234567",
  },
};

// 1. Update DATE_CONFIG
const DATE_CONFIG = {
  MIN_AGE: 18,
  MAX_AGE: 100,
  DATE_FORMAT: "Y-m-d",

  getMaxDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - this.MIN_AGE);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  },

  getMinDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - this.MAX_AGE);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  },
};

// Add helper functions
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const formatDateLocal = (dateObj) => {
  if (!dateObj) return "";
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // YYYY-MM-DD local
};

// Add this helper function after imports
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

function RegisterUser() {
  // Add these states
  const [registrationStep, setRegistrationStep] = useState(FACE_REGISTRATION_STEPS.READY);
  const [currentProgressStep, setCurrentProgressStep] = useState(0);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    username: "",
    password: "",
    confirmPassword: "",
    address: "",
    state: "",
    district: "",
    postalPinCode: "",
    aadhaar: "",
    pan: "",
    passport: "",
    profilePicture: null,
    gender: "",
  });
  const [videoBlurred, setVideoBlurred] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [dateError, setDateError] = useState("");
  const [faceRegistration, setFaceRegistration] = useState(null);
  const [progress, setProgress] = useState(0);
  const MAX_CAPTURES = 10;
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(10);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [videoProcessing, setVideoProcessing] = useState(false);
  const streamRef = useRef(null);

  // Add cleanup function
  const cleanupCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (step === 6) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream; // Store stream reference
            setIsVideoReady(true);
          }
        })
        .catch((err) => {
          console.error('Error accessing camera:', err);
          setError('Could not access camera');
        });
    }

    // Cleanup on unmount or step change
    return () => {
      cleanupCamera();
    };
  }, [step]);

  // Add date validation helper
  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  // Add new date validation function
  const validateDate = (date) => {
    if (!date) {
      setDateError("Date is required");
      return false;
    }

    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < DATE_CONFIG.MIN_AGE) {
      setDateError(`Must be at least ${DATE_CONFIG.MIN_AGE} years old`);
      return false;
    }

    if (age > DATE_CONFIG.MAX_AGE) {
      setDateError(`Must be less than ${DATE_CONFIG.MAX_AGE} years old`);
      return false;
    }

    setDateError("");
    return true;
  };

  // Update handleNextStep
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.dateOfBirth || !validateDate(formData.dateOfBirth)) {
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = (e) => {
    e.preventDefault();
    setStep(step - 1);
  };

  // Update validation function
  const validateField = (name, value) => {
    const rule = VALIDATION_RULES[name];
    if (!rule || !value) return true; // Skip validation if empty

    if (value && !rule.pattern.test(value)) {
      setError(rule.message);
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate length and pattern for specific fields
    if (VALIDATION_RULES[name]) {
      if (value.length > VALIDATION_RULES[name].length) {
        return; // Don't update if exceeds max length
      }
      validateField(name, value);
    }

    setFormData({ ...formData, [name]: value });
  };

  // Inside RegisterUser component, before return statement
  const handleDateChange = (dates) => {
    if (dates && dates.length > 0) {
      const selectedDate = dates[0];
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${yyyy}-${mm}-${dd}`;

      console.log("Selected Date:", selectedDate);
      console.log("Formatted Date:", formattedDate);

      if (validateDate(formattedDate)) {
        setFormData((prev) => ({
          ...prev,
          dateOfBirth: formattedDate,
        }));
        setDateError("");
      }
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg");
  };

  // 1. Update handleCapture function
  const handleCapture = async () => {
    try {
      setError(null);
      setVideoBlurred(false);
      setIsCapturing(true);
      const frames = [];

      // Capture multiple frames with better quality
      for (let i = 0; i < MAX_CAPTURES; i++) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay
        const frame = captureFrame();
        frames.push(frame);
        setCaptureCount(i + 1);
      }

      // Improved error handling
      const response = await fetch("http://localhost:5001/api/register-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          frames: frames
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Face registration failed');
      }

      // Success handling
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      alert("Face registration successful!");
      navigate("/login");

    } catch (error) {
      console.error("Capture error:", error);
      setError(error.message);
    } finally {
      setIsCapturing(false);
      setCaptureCount(0);
    }
  };

  const handleStateChange = ({ selectedItem }) => {
    setFormData({ ...formData, state: selectedItem, district: "" });
  };

  const handleDistrictChange = ({ selectedItem }) => {
    setFormData({ ...formData, district: selectedItem });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create FormData object
      const formDataToSend = new FormData();

      // Map field names to match backend expectations
      const fieldMapping = {
        fullName: 'full_name',
        dateOfBirth: 'dateOfBirth',
      };

      // Add all form fields
      Object.keys(formData).forEach(key => {
        const backendKey = fieldMapping[key] || key;
        // Handle profile picture separately
        if (key === 'profilePicture' && formData[key]) {
          formDataToSend.append('profilePicture', formData[key]);
        } else {
          formDataToSend.append(backendKey, formData[key]);
        }
      });

      // Add user type
      formDataToSend.append('type_id', 2);

      const response = await fetch('http://localhost:5001/api/register-user', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend  // Send as FormData
      });

      const data = await response.json();

      if (response.ok) {
        setStep(6);  // Move to step 6
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      setError('Error registering user: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Improved validation function
  const validateIdentification = (formData) => {
    // Return true if at least one valid ID is provided
    if (!formData.aadhaar && !formData.pan && !formData.passport) {
      return true; // All fields empty is valid
    }

    const validations = {
      aadhaar:
        !formData.aadhaar ||
        VALIDATION_RULES.aadhaar.pattern.test(formData.aadhaar),
      pan: !formData.pan || VALIDATION_RULES.pan.pattern.test(formData.pan),
      passport:
        !formData.passport ||
        VALIDATION_RULES.passport.pattern.test(formData.passport),
    };

    return validations.aadhaar && validations.pan && validations.passport;
  };

  // Update date validation
  const validateDateOfBirth = (dateString) => {
    const date = new Date(dateString);
    const age = calculateAge(date);

    if (age < MIN_AGE) {
      setError(`You must be at least ${MIN_AGE} years old`);
      return false;
    }
    if (age > MAX_AGE) {
      setError(`Age cannot be more than ${MAX_AGE} years`);
      return false;
    }
    setError(null);
    return true;
  };

  // Update startFaceRegistration function
  const startFaceRegistration = async () => {
    try {
      // Remove blur when starting registration
      setVideoBlurred(false);
      setProgress(0);
      setRegistrationStep(FACE_REGISTRATION_STEPS.CAPTURING);
      setCurrentProgressStep(0);
      setIsRecording(true);
      setRecordingTime(10);
      chunksRef.current = [];

      const stream = videoRef.current.srcObject;
      const mimeType = getSupportedMimeType();

      if (!mimeType) {
        throw new Error('No supported video MIME type found');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          // Update progress during recording
          const recordingProgress = (10 - recordingTime) * 10;
          setProgress(recordingProgress);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          setRegistrationStep(FACE_REGISTRATION_STEPS.PROCESSING);
          setCurrentProgressStep(1);
          setProgress(40);

          // Process and upload video
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const formDataToSend = new FormData();
          formDataToSend.append('video', blob, `${formData.username}_${Date.now()}.webm`);
          formDataToSend.append('username', formData.username);

          const response = await fetch('http://localhost:5001/api/save-face-video', {
            method: 'POST',
            body: formDataToSend,
            credentials: 'include'
          });

          setRegistrationStep(FACE_REGISTRATION_STEPS.TRAINING);
          setCurrentProgressStep(2);
          setProgress(70);

          if (!response.ok) {
            throw new Error('Failed to save video');
          }

          const data = await response.json();

          if (data.message === 'Video saved and processed successfully') {
            setRegistrationStep(FACE_REGISTRATION_STEPS.FINISHED);
            setCurrentProgressStep(3);
            setProgress(100);

            setTimeout(() => {
              cleanupCamera();
              navigate('/login');
            }, 2000);
          }

        } catch (error) {
          console.error('Error:', error);
          setError(error.message);
          cleanupCamera();
        }
      };

      // Start recording
      mediaRecorder.start(1000);

      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 10000);

      const timer = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setIsRecording(false);
      cleanupCamera();
    }
  };

  const validateForm = () => {
    if (!formData.fullName) return false;
    if (!formData.gender) return false;
    if (!formData.dateOfBirth) return false;
    if (!formData.email) return false;
    if (!formData.phone) return false;
    if (!formData.address) return false;
    if (!formData.state) return false;
    if (!formData.district) return false;
    if (!formData.postalPinCode) return false;
    if (!formData.username) return false;
    if (!formData.password) return false;
    if (formData.password !== formData.confirmPassword) return false;
    if (!formData.profilePicture) return false;
    return true;
  };

  return (
    <Grid className="register-page">
      <Column lg={9} md={9} sm={4} id="illu">
        <h1>Register to Expert_Guide</h1>
        <br></br>
        <p>
          Join Expert_Guide and enjoy secure and private identity verification,
          access to exclusive content, and more.
        </p>
        <img
          src={illustration}
          alt="Illustration"
          className="register-illustration"
        />
      </Column>
      {step === 1 && (
        <>
          <Column lg={6} md={5} sm={5}>
            <Tile className="register-tile" style={{ padding: "42px" }}>
              <h3>Personal Information</h3>
              <br></br>
              <Form onSubmit={handleNextStep}>
                <Stack gap={7}>
                  <TextInput
                    id="fullName"
                    name="fullName"
                    labelText="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />

                  <RadioButtonGroup
                    legendText="Gender"
                    name="gender"
                    valueSelected={formData.gender}
                    onChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                    required
                  >
                    <RadioButton id="male" labelText="Male" value="male" />
                    <RadioButton
                      id="female"
                      labelText="Female"
                      value="female"
                    />
                  </RadioButtonGroup>

                  <DatePicker
                    datePickerType="single"
                    value={
                      formData.dateOfBirth
                        ? [new Date(formData.dateOfBirth)]
                        : []
                    }
                    onChange={(dates) => {
                      if (dates && dates.length > 0) {
                        const selectedDate = dates[0];
                        const yyyy = selectedDate.getFullYear();
                        const mm = String(selectedDate.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const dd = String(selectedDate.getDate()).padStart(
                          2,
                          "0"
                        );
                        const formattedDate = `${yyyy}-${mm}-${dd}`;

                        console.log("Selected Date:", selectedDate);
                        console.log("Formatted Date:", formattedDate);

                        if (validateDate(formattedDate)) {
                          setFormData((prev) => ({
                            ...prev,
                            dateOfBirth: formattedDate,
                          }));
                          setDateError("");
                        }
                      }
                    }}
                  >
                    <DatePickerInput
                      id="dateOfBirth"
                      name="dateOfBirth"
                      placeholder="YYYY-MM-DD"
                      labelText="Date of Birth"
                      helperText={`Must be between ${DATE_CONFIG.MIN_AGE} and ${DATE_CONFIG.MAX_AGE} years old`}
                      invalid={!!dateError}
                      invalidText={dateError}
                      readOnly
                    />
                  </DatePicker>

                  <TextInput
                    id="email"
                    name="email"
                    labelText="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />

                  <TextInput
                    id="phone"
                    name="phone"
                    labelText="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />

                  {error && <div style={{ color: "red" }}>{error}</div>}

                  <Button
                    type="submit"
                    disabled={
                      !formData.gender || !formData.dateOfBirth || !!error
                    }
                  >
                    Next
                  </Button>
                </Stack>
              </Form>
              <div className="account-option">
                <p>Already have an account?</p>
                <Button kind="tertiary" onClick={() => navigate("/login")}>
                  Login
                </Button>
              </div>
            </Tile>
          </Column>
        </>
      )}
      {step === 2 && (
        <>
          <Column lg={6} md={5} sm={5}>
            <Tile className="register-tile" style={{ padding: "42px" }}>
              <h2>Account Information</h2>
              <br></br>
              <br></br>
              <Form onSubmit={handleNextStep}>
                <Stack gap={7}>
                  <TextInput
                    id="username"
                    name="username"
                    labelText="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                  <PasswordInput
                    id="password"
                    labelText="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    name="password"
                    required
                    hidePasswordLabel="Hide password"
                    showPasswordLabel="Show password"
                  />
                  <PasswordInput
                    id="confirmPassword"
                    labelText="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    name="confirmPassword"
                    required
                    hidePasswordLabel="Hide password"
                    showPasswordLabel="Show password"
                  />
                  <div className="button-group">
                    <Button type="submit">Next</Button>
                    <Button kind="secondary" onClick={handlePrevStep}>
                      Back
                    </Button>
                  </div>
                </Stack>
              </Form>
            </Tile>
          </Column>
        </>
      )}
      {step === 3 && (
        <>
          <Column lg={6} md={5} sm={5}>
            <Tile className="register-tile" style={{ padding: "42px" }}>
              <h2>Location Information</h2>
              <br></br>
              <br></br>
              <Form onSubmit={handleNextStep}>
                <Stack gap={7}>
                  <TextArea
                    id="address"
                    labelText="Address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleInputChange}
                    name="address"
                    required
                  />
                  <Dropdown
                    id="state"
                    titleText="State"
                    label="Select State"
                    items={Object.keys(statesAndDistricts)}
                    selectedItem={formData.state}
                    onChange={handleStateChange}
                    required
                  />
                  <Dropdown
                    id="district"
                    titleText="District"
                    label="Select District"
                    items={
                      formData.state ? statesAndDistricts[formData.state] : []
                    }
                    selectedItem={formData.district}
                    onChange={handleDistrictChange}
                    required
                    disabled={!formData.state}
                  />
                  <TextInput
                    id="postalPinCode"
                    name="postalPinCode"
                    labelText="Postal Pin Code"
                    value={formData.postalPinCode}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="button-group">
                    <Button type="submit">Next</Button>
                    <Button kind="secondary" onClick={handlePrevStep}>
                      Back
                    </Button>
                  </div>
                </Stack>
              </Form>
            </Tile>
          </Column>
        </>
      )}
      {step === 4 && (
        <Column lg={6} md={5} sm={5}>
          <Tile className="register-tile" style={{ padding: "42px" }}>
            <h2>Identification Information</h2>
            <br></br>
            <br></br>
            <Form onSubmit={handleNextStep}>
              <Stack gap={7}>
                <TextInput
                  id="aadhaar"
                  name="aadhaar"
                  labelText="Aadhaar Number (optional)"
                  helperText={`Format: ${VALIDATION_RULES.aadhaar.format} - You can provide any one ID`}
                  value={formData.aadhaar || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setFormData({ ...formData, aadhaar: value });
                  }}
                  invalid={Boolean(
                    formData.aadhaar &&
                    !VALIDATION_RULES.aadhaar.pattern.test(formData.aadhaar)
                  )}
                  invalidText={VALIDATION_RULES.aadhaar.message}
                  maxLength={12}
                />
                <TextInput
                  id="pan"
                  name="pan"
                  labelText="PAN Number (optional)"
                  helperText={`Format: ${VALIDATION_RULES.pan.format} - You can provide any one ID`}
                  value={formData.pan || ""}
                  onChange={(e) => {
                    const value = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "");
                    setFormData({ ...formData, pan: value });
                  }}
                  invalid={Boolean(
                    formData.pan &&
                    !VALIDATION_RULES.pan.pattern.test(formData.pan)
                  )}
                  invalidText={VALIDATION_RULES.pan.message}
                  maxLength={10}
                />

                <TextInput
                  id="passport"
                  name="passport"
                  labelText="Passport Number (optional)"
                  helperText={`Format: ${VALIDATION_RULES.passport.format} - You can provide any one ID`}
                  value={formData.passport || ""}
                  onChange={(e) => {
                    const value = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "");
                    setFormData({ ...formData, passport: value });
                  }}
                  invalid={Boolean(
                    formData.passport &&
                    !VALIDATION_RULES.passport.pattern.test(formData.passport)
                  )}
                  invalidText={VALIDATION_RULES.passport.message}
                  maxLength={8}
                />

                <div className="button-group">
                  <Button
                    type="submit"
                    disabled={!validateIdentification(formData)}
                  >
                    Next
                  </Button>
                  <Button
                    kind="secondary"
                    onClick={handlePrevStep}
                  >
                    Back
                  </Button>
                </div>
              </Stack>
            </Form>
          </Tile>
        </Column>
      )}
      {step === 5 && (
        <>
          <Column lg={6} md={5} sm={5}>
            <Tile className="register-tile" style={{ padding: "42px" }}>
              <h2>Upload Profile Picture</h2>
              <br></br>
              <br></br>
              <Form onSubmit={handleSubmit}>
                <Stack gap={7}>
                  <FileUploader
                    accept={[".jpg", ".png"]}
                    buttonKind="primary"
                    filenameStatus="edit"
                    iconDescription="Clear file"
                    labelDescription="Only .jpg and .png files. 500kb max file size."
                    labelTitle="Upload Profile Picture"
                    size="md"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          profilePicture: file,
                        });
                      }
                    }}
                    required
                  />
                  <div className="button-group">
                    <Button type="submit">Next</Button>
                    <Button kind="secondary" onClick={handlePrevStep}>
                      Back
                    </Button>
                  </div>
                </Stack>
              </Form>
            </Tile>
          </Column>
        </>
      )}
      {step === 6 && (
        <Tile className="register-tile" style={{ padding: "42px" }}>
          <div className="face-rec-container">
            <div className="face-rec-content">
              <div className="video-container">
                <video
                  ref={videoRef}
                  className={videoBlurred ? "blurred" : ""}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "scale(1.1)",
                  }}
                  autoPlay
                  playsInline
                  onLoadedMetadata={() => {
                    setIsVideoReady(true);
                  }}
                />
              </div>

              <div className="progress-container">
                <ProgressBar
                  value={progress}
                  max={100}
                  label="Registration Progress"
                  labelText={registrationStep}
                  helperText={
                    isRecording
                      ? `Recording: ${recordingTime}s remaining...`
                      : registrationStep
                  }
                />



              </div>
              <Button
                id="video-capture-button"
                onClick={startFaceRegistration}
                disabled={!isVideoReady || isRecording || currentProgressStep > 0}
              >
                {isRecording
                  ? `Recording: ${recordingTime}s remaining...`
                  : isVideoReady
                    ? registrationStep === FACE_REGISTRATION_STEPS.FINISHED
                      ? "Registration Complete!"
                      : "Start Face Registration"
                    : "Preparing Camera..."}
              </Button>

              <Button
                kind="secondary"
                onClick={handlePrevStep}
                disabled={isRecording || currentProgressStep > 0}
              >
                Back
              </Button>
            </div>
          </div>
        </Tile>
      )}
    </Grid>
  );
}

export default RegisterUser;