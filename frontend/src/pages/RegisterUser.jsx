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

// Add these validation patterns at the top with other constants
const VALIDATION_RULES = {
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    pattern: /^\d{10}$/,
    message: 'Phone number must be exactly 10 digits'
  },
  username: {
    pattern: /^[a-zA-Z0-9_]{6,}$/,
    message: 'Username must be at least 6 characters and can only contain letters, numbers, and underscores',
    requirements: [
      { pattern: /.{6,}/, message: 'At least 6 characters long' },
      { pattern: /^[a-zA-Z0-9_]*$/, message: 'Only letters, numbers, and underscores allowed' }
    ]
  },
  password: {
    pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/,
    message: 'Password must meet all requirements below',
    requirements: [
      { pattern: /.{6,}/, message: 'At least 6 characters long' },
      { pattern: /(?=.*[A-Za-z])/, message: 'At least one letter' },
      { pattern: /(?=.*\d)/, message: 'At least one number' },
      { pattern: /(?=.*[@$!%*#?&])/, message: 'At least one special character (@$!%*#?&)' }
    ]
  }
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

  // Add new state variables for tracking requirement statuses
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    letter: false,
    number: false,
    special: false
  });

  const [usernameRequirements, setUsernameRequirements] = useState({
    length: false,
    validChars: false
  });

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

  const face_lock = true;

  useEffect(() => {
    if (step === 5) {
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

  // Update handleNextStep to include new validations for step 1 and 2
  const handleNextStep = (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate email and phone
      if (!validateField('email', formData.email) || 
          !validateField('phone', formData.phone)) {
        return;
      }
    }
  
    if (step === 2) {
      // Validate username and passwords
      if (!validateField('username', formData.username) || 
          !validateField('password', formData.password) ||
          !validatePasswordMatch()) {
        return;
      }
    }
  
    // Existing date validation
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
    if (!rule) return true;

    switch (name) {
      case 'username':
        const usernameValid = rule.requirements.every(req => req.pattern.test(value));
        const usernameReqs = {
          length: /.{6,}/.test(value),
          validChars: /^[a-zA-Z0-9_]*$/.test(value)
        };
        setUsernameRequirements(usernameReqs);
        if (!usernameValid) {
          setError(rule.message);
          return false;
        }
        break;

      case 'password':
        const passwordValid = rule.requirements.every(req => req.pattern.test(value));
        const passwordReqs = {
          length: /.{6,}/.test(value),
          letter: /(?=.*[A-Za-z])/.test(value),
          number: /(?=.*\d)/.test(value),
          special: /(?=.*[@$!%*#?&])/.test(value)
        };
        setPasswordRequirements(passwordReqs);
        if (!passwordValid) {
          setError(rule.message);
          return false;
        }
        break;

      default:
        if (!rule.pattern.test(value)) {
          setError(rule.message);
          return false;
        }
        break;
    }
    return true;
  };

  // Add validatePasswordMatch function
  const validatePasswordMatch = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  // Update handleInputChange function
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special validation for specific fields
    if (name === 'phone') {
      // Only allow digits and max 10 characters
      if (!/^\d*$/.test(value) || value.length > 10) {
        return;
      }
    }
  
    if (name === 'username') {
      // Only allow letters, numbers and underscore
      if (!/^[a-zA-Z0-9_]*$/.test(value)) {
        return;
      }
    }
  
    // Validate field if it has validation rules
    if (VALIDATION_RULES[name]) {
      const isValid = validateField(name, value);
      if (!isValid) {
        setFormData(prev => ({ ...prev, [name]: value }));
        return;
      }
    }
  
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when input changes
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
      const formDataToSend = new FormData();
      const fieldMapping = {
        fullName: 'full_name',
        dateOfBirth: 'dateOfBirth',
      };

      Object.keys(formData).forEach(key => {
        const backendKey = fieldMapping[key] || key;
        if (key === 'profilePicture' && formData[key]) {
          formDataToSend.append('profilePicture', formData[key]);
        } else {
          formDataToSend.append(backendKey, formData[key]);
        }
      });

      formDataToSend.append('type_id', 2);

      const response = await fetch('http://localhost:5001/api/register-user', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        if (face_lock) {
          // If face_lock is enabled, proceed to face registration
          setStep(5);
        } else {
          // If face_lock is disabled, skip face registration and go to login
          alert("Registration successful!");
          navigate('/login');
        }
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
  const validateIdentification = () => true; // No longer needed

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

  // Add this component for displaying requirements
  const RequirementsList = ({ requirements, title }) => (
    <div className="requirements-list" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
      <p style={{ color: '#525252', marginBottom: '0.5rem' }}>{title}:</p>
      {Object.entries(requirements).map(([key, isMet]) => (
        <div key={key} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: isMet ? '#198038' : '#da1e28',
          marginBottom: '0.25rem'
        }}>
          {isMet ? '✓' : '×'} {getRequirementLabel(key)}
        </div>
      ))}
    </div>
  );

  // Add this helper function
  const getRequirementLabel = (key) => {
    const labels = {
      length: 'At least 6 characters long',
      letter: 'Contains at least one letter',
      number: 'Contains at least one number',
      special: 'Contains at least one special character',
      validChars: 'Only letters, numbers, and underscores'
    };
    return labels[key] || key;
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
                    invalid={!!error && error.includes('email')}
                    invalidText={error && error.includes('email') ? error : ''}
                    required
                  />

                  <TextInput
                    id="phone"
                    name="phone"
                    labelText="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    invalid={!!error && error.includes('phone')}
                    invalidText={error && error.includes('phone') ? error : ''}
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
                    invalid={!!error && error.includes('username')}
                    invalidText={error && error.includes('username') ? error : ''}
                    required
                  />
                  <RequirementsList 
                    requirements={usernameRequirements} 
                    title="Username Requirements" 
                  />
                  <PasswordInput
                    id="password"
                    labelText="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    name="password"
                    invalid={!!error && error.includes('password')}
                    invalidText={error && error.includes('password') ? error : ''}
                    required
                    hidePasswordLabel="Hide password"
                    showPasswordLabel="Show password"
                  />
                  <RequirementsList 
                    requirements={passwordRequirements} 
                    title="Password Requirements" 
                  />
                  <PasswordInput
                    id="confirmPassword"
                    labelText="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    name="confirmPassword"
                    invalid={!!error && error.includes('match')}
                    invalidText={error && error.includes('match') ? error : ''}
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
      {step === 5 && (
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