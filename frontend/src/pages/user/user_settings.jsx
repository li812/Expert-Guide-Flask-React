import React, { useState } from 'react';
import {
  Grid,
  Column,
  Tile,
  Button,
  Stack,
  InlineNotification,
  Form,
  PasswordInput,
  Modal,
  TextInput
} from '@carbon/react';
import { Password, TrashCan } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';

const UserSettings = ({ username }) => {
  // Account Settings State
  const [accountSettings, setAccountSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Delete Account States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // UI State
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Handle Account Settings Changes
  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    setAccountSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Password Update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    
    // Validate passwords match
    if (accountSettings.newPassword !== accountSettings.confirmPassword) {
      setError("New passwords don't match");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/user/update-password', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: accountSettings.currentPassword,
          newPassword: accountSettings.newPassword,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccess('Password updated successfully');
      setAccountSettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    // Validation
    if (deletePassword.trim() === '') {
      setError("Please enter your password");
      return;
    }
    
    if (deleteConfirm !== 'DELETE') {
      setError("Please type DELETE to confirm");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5001/api/user/delete-account', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deletePassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }
      
      // Account deleted successfully, redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Grid className="settings-page">
      <Column lg={16} md={8} sm={4}>
        <Tile className="settings-tile">
          <Form onSubmit={handlePasswordUpdate}>
            <Stack gap={7}>
              <h3>Change Password</h3>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                labelText="Current Password"
                value={accountSettings.currentPassword}
                onChange={handleAccountInputChange}
                hidePasswordLabel="Hide password"
                showPasswordLabel="Show password"
                required
              />
              <PasswordInput
                id="newPassword"
                name="newPassword"
                labelText="New Password"
                value={accountSettings.newPassword}
                onChange={handleAccountInputChange}
                hidePasswordLabel="Hide password"
                showPasswordLabel="Show password"
                required
              />
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                labelText="Confirm New Password"
                value={accountSettings.confirmPassword}
                onChange={handleAccountInputChange}
                hidePasswordLabel="Hide password"
                showPasswordLabel="Show password"
                required
              />
              <Button
                kind="primary"
                type="submit"
                renderIcon={Password}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </Stack>
          </Form>

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
        </Tile>
        
        {/* Delete Account Section */}
        <Tile className="settings-tile" style={{ marginTop: '2rem' }}>
          <Stack gap={7}>
            <h3>Delete Account</h3>
            <p>
              Warning: This action cannot be undone. All your data will be permanently deleted.
            </p>
            <Button 
              kind="danger" 
              renderIcon={TrashCan}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete My Account
            </Button>
          </Stack>
        </Tile>
      </Column>
      
      {/* Delete Account Modal */}
      <Modal
        open={showDeleteModal}
        modalHeading="Delete Account"
        danger
        primaryButtonText="Delete Account"
        secondaryButtonText="Cancel"
        primaryButtonDisabled={deleteConfirm !== 'DELETE' || deletePassword === '' || isSubmitting}
        onRequestClose={() => {
          setShowDeleteModal(false);
          setDeletePassword('');
          setDeleteConfirm('');
        }}
        onRequestSubmit={handleDeleteAccount}
      >
        <p style={{ marginBottom: '1rem' }}>
          This action will permanently delete your account and all associated data. This cannot be undone.
        </p>
        
        <Stack gap={7}>
          <PasswordInput
            id="deletePassword"
            labelText="Enter your password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            hidePasswordLabel="Hide password"
            showPasswordLabel="Show password"
          />
          
          <TextInput
            id="deleteConfirm"
            labelText="Type DELETE to confirm"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
          />
        </Stack>
      </Modal>
    </Grid>
  );
};

export default UserSettings;