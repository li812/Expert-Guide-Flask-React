import React, { useEffect, useState } from 'react';
import { Grid, Column, Heading, Tile, Button, InlineNotification } from '@carbon/react';
import { UserAvatar, Settings, Activity } from '@carbon/icons-react';
import './user.css';

const UserHome = ({ username }) => {
    const [stats, setStats] = useState({
        totalLogins: 0,
        recentActivities: 0,
        activities: []
    });
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState({
        fullName: "",
        profilePicture: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Starting data fetch");

                // Fetch stats
                console.log("Fetching stats...");
                const statsResponse = await fetch('http://localhost:5001/api/user/home-stats', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log("Stats response status:", statsResponse.status);
                if (!statsResponse.ok) {
                    const errorData = await statsResponse.json();
                    console.error("Stats error data:", errorData);
                    throw new Error(errorData.error || 'Failed to fetch stats');
                }

                const statsData = await statsResponse.json();
                console.log("Stats data received:", statsData);
                setStats(statsData);

                // Fetch profile
                console.log("Fetching profile...");
                const profileResponse = await fetch('http://localhost:5001/api/user/profile', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!profileResponse.ok) {
                    const errorData = await profileResponse.json();
                    console.error("Profile error data:", errorData);
                    throw new Error(errorData.error || 'Failed to fetch profile');
                }

                const profileData = await profileResponse.json();
                console.log("Profile data received:", profileData);
                setProfile({
                    fullName: profileData.full_name,
                    profilePicture: profileData.profilePicture
                });

            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    return (
        <Grid className="dashboard">
            {/* Header Section */}
            <Column lg={16} md={8} sm={4}>
                <Tile className="stat-tile">
                    <div className="profile-picture-container-big">
                        {profile.profilePicture ? (
                            <img
                                src={`http://localhost:5001${profile.profilePicture}`}
                                alt="Profile"
                                className="profile-picture"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/default-profile.jpg";
                                }}
                            />
                        ) : (
                            <UserAvatar size={48} />
                        )}
                    </div>
                    <Heading className="dashboard-heading">
                        Welcome, {profile.fullName || username}!
                    </Heading>
                </Tile>
            </Column>

            {/* Statistics Section */}
            <Column lg={5} md={2} sm={1}>
                <Tile className="stat-tile">
                    <h4>Total<br></br>Logins</h4>
                    <p><br></br>{stats.totalLogins || 0}</p>
                </Tile>
            </Column>
            <Column lg={5} md={2} sm={1}>
                <Tile className="stat-tile">
                    <h4>Recent<br></br>Activities</h4>
                    <p><br></br>{stats.recentActivities || 0}</p>
                </Tile>
            </Column>

            {/* Quick Actions Section */}
            <Column lg={6} md={8} sm={4}>
                <Tile className="quick-actions-tile">
                    <h4>Quick Actions</h4>
                    <div className="quick-actions-grid">

                    <p><br></br>
                        <Button
                            kind="primary"
                            renderIcon={Settings}
                            className="quick-action-button"
                            onClick={() => window.location.href = '/user/profile'}
                        >
                            Update Profile
                        </Button>
                        </p>
                        <p><br></br>
                        <Button
                            kind="secondary"
                            renderIcon={Settings}
                            className="quick-action-button"
                            onClick={() => window.location.href = '/user/settings'}
                        >
                            Change Password
                        </Button>
                        </p>
                    </div>
                </Tile>
            </Column>

            {/* Recent Activities Section */}
            <Column lg={16} md={8} sm={4}>
                <Tile className="recent-activities-tile">
                    <h4>Recent Activities</h4>
                    <br></br>
                    <ul className="recent-activities">
                        {stats.activities.map((activity, index) => (
                            <li key={index}><br></br>{activity}<br></br></li>

                        ))}
                    </ul>
                </Tile>
            </Column>

            {/* Error Notification */}
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

export default UserHome;