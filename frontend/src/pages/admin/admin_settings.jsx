import React, { useState } from 'react';
import {
  Grid,
  Column,
  Tile,
  Button,
  Stack,
  InlineNotification,
  Form,
  PasswordInput
} from '@carbon/react';
import { Password } from '@carbon/icons-react';

const AdminSettings = ({ username }) => {
  // Account Settings State
  const [accountSettings, setAccountSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI State
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await fetch('http://localhost:5001/api/admin/update-password', {
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
      </Column>
    </Grid>
  );
};

export default AdminSettings;







