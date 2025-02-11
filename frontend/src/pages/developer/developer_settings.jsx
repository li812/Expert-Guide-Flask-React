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

const DeveloperSettings = ({ username }) => {
  // Account Settings State
  const [accountSettings, setAccountSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI State
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
    if (accountSettings.newPassword !== accountSettings.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/developer/update-password', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: accountSettings.currentPassword,
          newPassword: accountSettings.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      setSuccess('Password updated successfully');
      setAccountSettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.message);
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
              >
                Update Password
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

export default DeveloperSettings;