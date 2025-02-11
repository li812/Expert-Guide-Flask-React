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
  PasswordInput // Add this
} from "@carbon/react";
import { View, ViewOff } from "@carbon/icons-react";
import moment from "moment";
import illustration from "../assets/illustration-final.svg";
import "./RegisterDeveloper.css";
import statesAndDistricts from "../components/StatesAndDistricts.jsx";

function RegisterDeveloper() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    username: "",
    password: "",
    confirmPassword: "",
    githubUsername: "",
    linkedinId: "",
    developerType: "", // "Freelancer" or "Company"
    companyName: "",
    address: "",
    state: "",
    district: "",
    postalPinCode: "",
    profilePicture: null,
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Add date validation helper
  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  // Update handleNextStep
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.dateOfBirth || !isValidDate(formData.dateOfBirth)) {
      alert('Please enter a valid date in YYYY-MM-DD format');
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = (e) => {
    e.preventDefault();
    setStep(step - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Update handleDateChange
  const handleDateChange = (dates) => {
    if (dates && dates.length > 0) {
      try {
        const selectedDate = dates[0];
        const formattedDate = selectedDate.toISOString().split('T')[0];
        setFormData(prev => ({
          ...prev,
          dateOfBirth: formattedDate
        }));
      } catch (error) {
        console.error('Date parsing error:', error);
      }
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
    setIsLoading(true);
    const formDataToSend = new FormData();
    
    // Map frontend fields to backend expected names
    const fieldMapping = {
      fullName: 'full_name',
      dateOfBirth: 'dateOfBirth',
      profilePicture: 'profile_picture',
      githubUsername: 'gitHubUsername',
      linkedinId: 'linkedInUsername',
      developerType: 'typeOfDeveloper'
    };

    Object.keys(formData).forEach((key) => {
      const backendKey = fieldMapping[key] || key;
      if (key === 'profilePicture' && formData[key]) {
        formDataToSend.append('profile_picture', formData[key]);
      } else {
        formDataToSend.append(backendKey, formData[key]);
      }
    });

    try {
      const response = await fetch('http://localhost:5001/api/register-developer', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Please login to continue.");
        navigate("/login");
      } else {
        setError(data.error);
        alert(data.error);
      }
    } catch (error) {
      console.error('Error registering developer:', error);
      setError('Failed to register. Please try again.');
      alert('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid className="register-page">
      {/* Left Column */}
      <Column lg={9} md={9} sm={4} id="illu">
        <h1>Register as Developer</h1>
        <p>Join HumanID's developer community...</p>
        <img src={illustration} alt="Illustration" />
      </Column>

      {/* Right Column */}

      {step === 1 && (
        <>
          <Column lg={6} md={5} sm={5}>
            <Tile className="register-tile" style={{ padding: "42px" }}>
              <h3>Personal Information</h3>
              <br></br>
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
                  <DatePicker 
                    datePickerType="single"
                    dateFormat="Y-m-d"
                    maxDate={new Date().toISOString().split('T')[0]}
                    onChange={handleDateChange}
                  >
                    <DatePickerInput
                      id="dateOfBirth"
                      name="dateOfBirth"
                      placeholder="YYYY-MM-DD"
                      labelText="Date of Birth"
                      value={formData.dateOfBirth || ''}
                      pattern="\d{4}-\d{2}-\d{2}"
                      style={{ width: '100%' }}
                      required
                    />
                  </DatePicker>
                  <Button type="submit">Next</Button>
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
              <h2>Developer Information</h2>
              <br></br>
              <br></br>
              <Form onSubmit={handleNextStep}>
                <Stack gap={7}>
                  <TextInput
                    id="githubUsername"
                    name="githubUsername"
                    labelText="GitHub Username"
                    value={formData.githubUsername}
                    onChange={handleInputChange}
                    required
                  />
                  <TextInput
                    id="linkedinId"
                    name="linkedinId"
                    labelText="LinkedIn ID"
                    value={formData.linkedinId}
                    onChange={handleInputChange}
                    required
                  />
                  <Dropdown
                    id="developerType"
                    titleText="Type of Developer"
                    label="Select Type"
                    items={['Freelancer', 'Company']}
                    selectedItem={formData.developerType}
                    onChange={({ selectedItem }) => setFormData({ ...formData, developerType: selectedItem })}
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
              <h2>Location Information</h2>
              <br></br>
              <br></br>
              <Form onSubmit={handleNextStep}>
                <Stack gap={7}>
                  {formData.developerType === 'Company' && (
                    <TextInput
                      id="companyName"
                      name="companyName"
                      labelText="Company Name"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                    />
                  )}
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
      {step === 5 && (
        <>
          <Column lg={6} md={5} sm={5}>
            <Tile className="register-tile" style={{ padding: "42px" }}>
              <h2>{`Upload ${formData.developerType === 'Company' ? 'Company Logo' : 'Profile Picture'}`}</h2>
              <br></br>
              <br></br>
              <Form onSubmit={handleSubmit}>
                <Stack gap={7}>
                  <FileUploader
                    accept={['.jpg', '.png', '.jpeg']}
                    buttonKind="primary"
                    filenameStatus="edit"
                    iconDescription="Clear file"
                    labelDescription="Only .jpg and .png files. 500kb max file size."
                    labelTitle={`Upload ${formData.developerType === 'Company' ? 'Company Logo' : 'Profile Picture'}`}
                    size="md"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          profilePicture: file
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
    </Grid>
  );
}

export default RegisterDeveloper;


