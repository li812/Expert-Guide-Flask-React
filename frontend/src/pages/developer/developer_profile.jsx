import React, { useState, useEffect } from 'react';
import { Grid, Column, Tile, TextInput, Button, FileUploader, Form, Stack, InlineNotification, Dropdown } from '@carbon/react';
import { UserAvatar, Edit } from '@carbon/icons-react';
import statesAndDistricts from '../../components/StatesAndDistricts'; // Import states and districts data
import './developer.css'; // Import the CSS file for styling

const DeveloperProfile = ({ username }) => {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    githubUsername: '',
    linkedinId: '',
    developerType: '',
    companyName: '',
    address: '',
    state: '',
    district: '',
    postalPinCode: '',
    profilePicture: null,
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/developer/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProfile({
          fullName: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          githubUsername: data.gitHubUsername || '',
          linkedinId: data.linkedInUsername || '',
          developerType: data.typeOfDeveloper || '',
          companyName: data.companyName || '',
          address: data.address || '',
          state: data.state || '',
          district: data.district || '',
          postalPinCode: data.postalPinCode || '',
          profilePicture: data.profilePicture || null,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Error fetching profile');
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    // Cleanup function for object URLs
    return () => {
      if (profile.profilePicture instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(profile.profilePicture));
      }
    };
  }, [profile.profilePicture]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the image immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          profilePicture: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStateChange = ({ selectedItem }) => {
    setProfile({ ...profile, state: selectedItem, district: '' });
  };

  const handleDistrictChange = ({ selectedItem }) => {
    setProfile({ ...profile, district: selectedItem });
  };

  const handleDeveloperTypeChange = ({ selectedItem }) => {
    setProfile({ ...profile, developerType: selectedItem });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(profile).forEach((key) => {
        if (key !== 'profilePicture') {
          formData.append(key, profile[key]);
        }
      });

      // Add profile picture if it's a File object
      if (profile.profilePicture instanceof File) {
        formData.append('profile_picture', profile.profilePicture);
      }

      const response = await fetch('http://localhost:5001/api/developer/profile', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update profile with new data
      setProfile(prev => ({
        ...prev,
        ...data.profile,
        profilePicture: data.profile.profilePicture + `?t=${new Date().getTime()}` // Add timestamp to force reload
      }));

      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error updating profile');
    }
  };

  return (
    <Grid className="profile-page">
      <Column lg={5} md={8} sm={4}>
        <Tile className="profile-info-tile">
          <h3>Personal Details</h3><br></br><br></br>
          <Form onSubmit={handleSubmit}>
            <Stack gap={7}>
              <TextInput
                id="fullName"
                name="fullName"
                labelText="Full Name"
                value={profile.fullName}
                onChange={handleInputChange}
                required
              />
              <TextInput
                id="email"
                name="email"
                labelText="Email"
                value={profile.email}
                onChange={handleInputChange}
                required
              />
              <TextInput
                id="phone"
                name="phone"
                labelText="Phone Number"
                value={profile.phone}
                onChange={handleInputChange}
                required
              />
              <TextInput
                id="address"
                name="address"
                labelText="Address"
                value={profile.address}
                onChange={handleInputChange}
                required
              />
              <Dropdown
                id="state"
                titleText="State"
                label="Select State"
                items={Object.keys(statesAndDistricts)}
                selectedItem={profile.state}
                onChange={handleStateChange}
                required
              />
              <Dropdown
                id="district"
                titleText="District"
                label="Select District"
                items={profile.state ? statesAndDistricts[profile.state] : []}
                selectedItem={profile.district}
                onChange={handleDistrictChange}
                required
                disabled={!profile.state}
              />
              <TextInput
                id="postalPinCode"
                name="postalPinCode"
                labelText="Postal Pin Code"
                value={profile.postalPinCode}
                onChange={handleInputChange}
                required
              />
              <Button kind="primary" renderIcon={Edit} type="submit">
                Update Profile
              </Button>
            </Stack>
          </Form>
        </Tile>
      </Column>
      <Column lg={5} md={8} sm={4}>
        <Tile className="profile-info-tile">
          <h3>Professional Details</h3><br></br><br></br>
          <Form onSubmit={handleSubmit}>
            <Stack gap={7}>
              <TextInput
                id="githubUsername"
                name="githubUsername"
                labelText="GitHub Username"
                value={profile.githubUsername}
                onChange={handleInputChange}
                required
              />
              <TextInput
                id="linkedinId"
                name="linkedinId"
                labelText="LinkedIn ID"
                value={profile.linkedinId}
                onChange={handleInputChange}
                required
              />
              <Dropdown
                id="developerType"
                titleText="Developer Type"
                label="Select Developer Type"
                items={['Freelancer', 'Company']}
                selectedItem={profile.developerType}
                onChange={handleDeveloperTypeChange}
                required
              />
              {profile.developerType === 'Company' && (
                <TextInput
                  id="companyName"
                  name="companyName"
                  labelText="Company Name"
                  value={profile.companyName}
                  onChange={handleInputChange}
                  required
                />
              )}
              <Button kind="primary" renderIcon={Edit} type="submit">
                Update Profile
              </Button>
            </Stack>
          </Form>
        </Tile>
        {error && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            onCloseButtonClick={() => setError(null)}
          />
        )}
        {successMessage && (
          <InlineNotification
            kind="success"
            title="Success"
            subtitle={successMessage}
            onCloseButtonClick={() => setSuccessMessage(null)}
          />
        )}
      </Column>

      <Column lg={5} md={4} sm={4}>
        <Tile className="profile-picture-tile">
          <h3>Profile Picture</h3>
          <br />
          <div className="profile-picture-container">
            {profile.profilePicture ? (
              <img 
                src={
                  profile.profilePicture instanceof File 
                    ? URL.createObjectURL(profile.profilePicture)
                    : `http://localhost:5001${profile.profilePicture}`
                }
                alt="Profile" 
                className="profile-picture"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'default-profile.jpg';
                }}
              />
            ) : (
              <UserAvatar size={48} />
            )}
          </div>
          <Form onSubmit={handleSubmit}>
            <Stack gap={7}>
              <FileUploader
                accept={['.jpg', '.png']}
                buttonKind="primary"
                filenameStatus="edit"
                iconDescription="Clear file"
                labelDescription="Only .jpg and .png files. Max file size: 500kb"
                labelTitle="Upload Profile Picture"
                onChange={handleFileChange}
              />
              <Button 
                kind="primary" 
                type="submit"
                renderIcon={Edit}
              >
                Update Profile Picture
              </Button>
            </Stack>
          </Form>
        </Tile>
      </Column>
    </Grid>
  );
};

export default DeveloperProfile;