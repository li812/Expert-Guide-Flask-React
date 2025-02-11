import React, { useEffect, useState } from "react";
import {
  Grid,
  Column,
  Heading,
  Tile,
  Button,
  InlineNotification,
  Tooltip,
} from "@carbon/react";
import { Api, Application, UserAvatar } from "@carbon/icons-react";
import { DonutChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";
import "./developer.css";
import { useNavigate } from 'react-router-dom';
import { 
  Add, 
  ManageProtection, 
  Settings, 
  Report, 
  Dashboard,
  Email
} from '@carbon/icons-react';

const DeveloperHome = ({ username }) => {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    fullName: "",
    profilePicture: null,
  });
  const [stats, setStats] = useState({
    api_count: 0,
    active_apps: 0,
    non_active_apps: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/developer/profile",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProfile({
          fullName: data.full_name || "",
          profilePicture: data.profilePicture,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Error fetching profile data");
      }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/developer/stats",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Error fetching stats");
      }
    };

    fetchProfileData();
    fetchStats();
  }, []);

  const apiData = [
    { group: "APIs", value: stats.api_count },
    { group: "Active Apps", value: stats.active_apps },
    { group: "Non-Active Apps", value: stats.non_active_apps },
  ];

  const apiOptions = {
    title: "API Statistics",
    resizable: true,
    donut: {
      center: {
        label: "APIs",
      },
    },
    height: "400px",
  };

  const quickActions = [
    {
      label: 'Create New API',
      icon: Add,
      kind: 'primary',
      route: '/developer/generate-api',
      tooltip: 'Generate a new API key'
    },
    {
      label: 'Manage APIs',
      icon: ManageProtection,
      kind: 'secondary',
      route: '/developer/manage-apis',
      tooltip: 'View and manage your APIs'
    },
    {
      label: 'Profile Settings',
      icon: UserAvatar,
      kind: 'tertiary',
      route: '/developer/profile',
      tooltip: 'Update your profile information'
    },
    {
      label: 'Account Settings',
      icon: Settings,
      kind: 'ghost',
      route: '/developer/settings',
      tooltip: 'Manage your account settings'
    },
    
    {
      label: 'Send Complaint',
      icon: Email,
      kind: 'danger',  
      route: '/developer/send-complaints',
      tooltip: 'Send a new complaint'
    },
    {
      label: 'Manage Complaints',
      icon: Email,
      kind: 'tertiary',
      route: '/developer/manage-complaints', 
      tooltip: 'Manage your complaints'
    }
  ];

  return (
    <Grid className="dashboard">
      <Column lg={15} md={8} sm={4}>
        <Tile className="stat-tile">
          <div className="profile-picture-container">
            {profile.profilePicture ? (
              <img
                src={`http://localhost:5001${profile.profilePicture}`}
                alt="Profile"
                className="profile-picture"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "default-profile.jpg";
                }}
              />
            ) : (
              <UserAvatar size={48} />
            )}
          </div>
          <Heading className="dashboard-heading">
            Hi, {profile.fullName}!
          </Heading>
          <p className="dashboard-content">
            This is your developer dashboard. Use the navigation links to manage
            your APIs, applications, and settings.
          </p>
          <br></br>
          <br></br>
        </Tile>
      </Column>
      <br></br>
      <br></br>
      <br></br>
      <Column lg={5} md={2} sm={1}>
        <Tile className="stat-tile">
          <Api size={32} />
          <h4>Totals APIs</h4>
          <p>{stats.api_count}</p>
        </Tile>
      </Column>
      <Column lg={5} md={2} sm={1}>
        <Tile className="stat-tile">
          <Application size={32} />
          <h4>Active APIs</h4>
          <p>{stats.active_apps}</p>
        </Tile>
      </Column>
      <Column lg={5} md={2} sm={1}>
        <Tile className="stat-tile">
          <Application size={32} />
          <h4>Non-Active APIs</h4>
          <p>{stats.non_active_apps}</p>
        </Tile>
      </Column>
      <Column lg={5} md={4} sm={4}>
        <Tile className="stat-tile equal-height">
          <DonutChart data={apiData} options={apiOptions} />
        </Tile>
      </Column>

      <Column lg={10} md={8} sm={4}>
        <Tile className="quick-actions-tile">
          <h4>Quick Actions</h4>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Tooltip key={index} align="top" label={action.tooltip}>
                <Button
                  kind={action.kind}
                  renderIcon={action.icon}
                  onClick={() => navigate(action.route)}
                  className="quick-action-button"
                >
                  {action.label}
                </Button>
              </Tooltip>
            ))}
          </div>
        </Tile>
      </Column>

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
        />
      )}
    </Grid>
  );
};

export default DeveloperHome;
