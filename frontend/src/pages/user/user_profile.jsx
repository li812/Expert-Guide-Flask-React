import React, { useState, useEffect, useRef } from 'react';
import {
    Grid,
    Column,
    ContentSwitcher,
    Switch,
    Form,
    Stack,
    TextInput,
    TextArea,
    Select,
    SelectItem,
    Button,
    InlineNotification,
    Tile
} from '@carbon/react';
import { UserAvatar, Save } from '@carbon/icons-react';
import './user.css';

const UserProfile = () => {
    const [selectedSection, setSelectedSection] = useState(0);
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        state: '',
        district: '',
        postalPinCode: '',
        profilePicture: null,
        profilePicturePreview: null  // Add this for preview
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef();

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/user/profile', {
                    credentials: 'include'
                });
                if (!response.ok) throw new Error('Failed to fetch profile');
                const data = await response.json();
                setProfile(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchProfile();
    }, []);

    // Handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            Object.keys(profile).forEach(key => {
                if (key !== 'profilePicture') {
                    formData.append(key, profile[key]);
                }
            });

            if (fileInputRef.current?.files[0]) {
                formData.append('profilePicture', fileInputRef.current.files[0]);
            }

            const response = await fetch('http://localhost:5001/api/user/profile', {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to update profile');
            setSuccess('Profile updated successfully');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Add this function before the return statement
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setProfile(prev => ({
                ...prev,
                profilePicturePreview: previewUrl
            }));
        }
    };

    // Clean up preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (profile.profilePicturePreview) {
                URL.revokeObjectURL(profile.profilePicturePreview);
            }
        };
    }, [profile.profilePicturePreview]);

    return (
        <Grid className="profile-page">
            <Column lg={16} md={8} sm={4}>
                <ContentSwitcher onChange={({ index }) => setSelectedSection(index)} selectedIndex={selectedSection}>
                    <Switch name="personal" text="Personal Information" />
                    <Switch name="location" text="Location Information" />
                </ContentSwitcher>

                <Tile className="profile-section-tile">
                    {selectedSection === 0 && (
                        <Form onSubmit={handleProfileUpdate}>
                            <Stack gap={7}>
                                <Tile className="profile-picture-tile">
                                    <div className="profile-picture-container-big">
                                        {profile.profilePicture ? (
                                            <img
                                                src={`http://localhost:5001${profile.profilePicture}`}
                                                alt="Profile"
                                                className="profile-picture"
                                            />
                                        ) : (
                                            <UserAvatar size={48} />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                setProfile({
                                                    ...profile,
                                                    profilePicture: URL.createObjectURL(e.target.files[0])
                                                });
                                            }
                                        }}
                                    />
                                    <Button
                                        kind="tertiary"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        Change Picture
                                    </Button>
                                </Tile>

                                <TextInput
                                    id="full_name"
                                    labelText="Full Name"
                                    value={profile.full_name || ''}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                />
                                <TextInput
                                    id="email"
                                    labelText="Email"
                                    value={profile.email || ''}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                />
                                <TextInput
                                    id="phone"
                                    labelText="Phone"
                                    value={profile.phone || ''}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                                <Button type="submit" renderIcon={Save} disabled={isLoading}>
                                    Save Personal Information
                                </Button>
                            </Stack>
                        </Form>
                    )}

                    {selectedSection === 1 && (
                        <Form onSubmit={handleProfileUpdate}>
                            <Stack gap={7}>
                                <TextArea
                                    id="address"
                                    labelText="Address"
                                    value={profile.address || ''}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                />
                                <Select
                                    id="state"
                                    labelText="State"
                                    value={profile.state || ''}
                                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                                >
                                    <SelectItem value="Kerala" text="Kerala" />
                                    <SelectItem value="Tamil Nadu" text="Tamil Nadu" />
                                    <SelectItem value="Karnataka" text="Karnataka" />
                                </Select>
                                <Select
                                    id="district"
                                    labelText="District"
                                    value={profile.district || ''}
                                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                                >
                                    <SelectItem value="Kollam" text="Kollam" />
                                    <SelectItem value="Trivandrum" text="Trivandrum" />
                                    <SelectItem value="Kochi" text="Kochi" />
                                </Select>
                                <TextInput
                                    id="postalPinCode"
                                    labelText="Postal Code"
                                    value={profile.postalPinCode || ''}
                                    onChange={(e) => setProfile({ ...profile, postalPinCode: e.target.value })}
                                />
                                <Button type="submit" renderIcon={Save} disabled={isLoading}>
                                    Save Location Information
                                </Button>
                            </Stack>
                        </Form>
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
            </Column>
        </Grid>
    );
};

export default UserProfile;