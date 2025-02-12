import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet, useLocation, Route, Routes } from 'react-router-dom';
import {
  Content,
  HeaderContainer,
  Header,
  SkipToContent,
  HeaderMenuButton,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderMenu,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Theme,
  InlineNotification,
  SideNav,          // Add these
  SideNavItems,     // Add these
  SideNavLink      // Add these
} from '@carbon/react';
import {
  Logout,
  Light,
  Asleep,
  UserAvatar,
  Dashboard,       // Add these
  Settings,        // Add these
  Report,         // Add these
  Email,          // Add these
  FaceMask,       // Add this icon
  Chat
} from '@carbon/icons-react';
import UserHome from './user_home';
import UserSettings from './user_settings';
import UserProfile from './user_profile'; // Add this
import UserManageFacialData from './user_manage_facial_data'; // Add this
import UserSendComplaints from './user_send_complaints';
import UserManageComplaints from './user_manage_complaints';
import UserLLMChat from './user_llm_chat';

function UserBase() {
  const navigate = useNavigate();
  const location = useLocation(); // Add this
  // State Management
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState({
    fullName: "",
    profilePicture: null
  });
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Theme Management
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Session & Profile Management
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching user data...");

        // Check session
        const sessionResponse = await fetch('http://localhost:5001/api/check-session', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const sessionData = await sessionResponse.json();
        console.log("Session data:", sessionData);

        if (!sessionResponse.ok || !sessionData.authenticated) {
          throw new Error('Session invalid');
        }

        if (sessionData.type_id !== 2) { // Ensure user type
          throw new Error('Invalid user type');
        }

        setUsername(sessionData.username);

        // Fetch user profile
        console.log("Fetching user profile...");
        const profileResponse = await fetch('http://localhost:5001/api/user/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log("Profile response status:", profileResponse.status);

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData = await profileResponse.json();
        console.log("Profile data:", profileData);

        setProfile({
          fullName: profileData.full_name || '',
          profilePicture: profileData.profilePicture
        });

      } catch (error) {
        console.error('Authentication error:', error);
        setError(error.message);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  // Logout Handler
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    }
  };

  return (
    <Theme theme={darkMode ? "g100" : "white"}>
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <>
            <Header aria-label="Expert_Guide Platform" className="header">
              <SkipToContent />
              <HeaderMenuButton
                aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
                onClick={onClickSideNavExpand}
                isActive={isSideNavExpanded}
                aria-expanded={isSideNavExpanded}
              />
              <HeaderName href="#" prefix="Welcome" style={{ fontSize: "2rem" }}>
                {profile.fullName || username}
              </HeaderName>

              <HeaderNavigation aria-label="Expert_Guide Platform">
                <HeaderMenuItem>
                  <div className="profile-picture-container-small">
                    {profile.profilePicture ? (
                      <>
                        {imageLoading && (
                          <div className="loading-avatar" aria-label="Loading profile picture">
                            <UserAvatar size={20} />
                          </div>
                        )}
                        <img
                          src={`http://localhost:5001${profile.profilePicture}`}
                          alt={`${profile.fullName || username}'s profile`}
                          className={`profile-picture ${imageLoading ? 'hidden' : ''}`}
                          onError={(e) => {
                            console.log("Profile picture load error");
                            e.target.onerror = null;
                            e.target.src = "/default-avatar.png";
                            setImageLoading(false);
                          }}
                          onLoad={() => {
                            console.log("Profile picture loaded successfully");
                            setImageLoading(false);
                          }}
                        />
                      </>
                    ) : (
                      <div className="default-avatar" aria-label="Default profile picture">
                        <UserAvatar size={20} />
                      </div>
                    )}
                  </div>
                </HeaderMenuItem>
                <HeaderMenuItem as={Link} to="/user/home">Dashboard</HeaderMenuItem>
                <HeaderMenuItem as={Link} to="/user/profile">Profile</HeaderMenuItem>
                <HeaderMenu aria-label="Complaints" menuLinkName="Complaints">
                  <HeaderMenuItem as={Link} to="/user/complaints">Send Complaint</HeaderMenuItem>
                  <HeaderMenuItem as={Link} to="/user/manage-complaints">Manage Complaints</HeaderMenuItem>
                </HeaderMenu>

                <HeaderMenuItem as={Link} to="/user/settings">Settings</HeaderMenuItem>
              </HeaderNavigation>

              <HeaderGlobalBar>
                <HeaderGlobalAction
                  aria-label="Theme Toggle"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Light size={25} /> : <Asleep size={25} />}
                </HeaderGlobalAction>
                <HeaderGlobalAction
                  aria-label="Logout"
                  onClick={handleLogout}
                  tooltipAlignment="end"
                >
                  <Logout size={20} />
                </HeaderGlobalAction>
              </HeaderGlobalBar>

              <SideNav
                aria-label="Side navigation"
                expanded={isSideNavExpanded}
                isPersistent={true}
                className="side-nav"
              >
                <SideNavItems>
                  <SideNavLink
                    renderIcon={() => <Dashboard size={40} style={{ fontSize: "3rem" }} />}
                    isActive={location.pathname === "/user/home"}
                    as={Link}
                    to="/user/home"
                    className="side-nav-link"
                  >
                    Dashboard
                  </SideNavLink>


                  <SideNavLink
                    renderIcon={() => <Chat size={40} style={{ fontSize: "3rem" }} />}
                    isActive={location.pathname === "/user/llm-chat"}
                    as={Link}
                    to="/user/llm-chat"
                    className="side-nav-link"
                  >
                    LLM Chat
                  </SideNavLink>


                  <SideNavLink
                    renderIcon={() => <Email size={40} style={{ fontSize: "3rem" }} />}
                    isActive={location.pathname === "/user/complaints"}
                    as={Link}
                    to="/user/complaints"
                    className="side-nav-link"
                  >
                    Send Complaint
                  </SideNavLink>

                  <SideNavLink
                    renderIcon={() => <Report size={40} style={{ fontSize: "3rem" }} />}
                    isActive={location.pathname === "/user/manage-complaints"}
                    as={Link}
                    to="/user/manage-complaints"
                    className="side-nav-link"
                  >
                    Manage Complaints
                  </SideNavLink>
                  <SideNavLink
                    renderIcon={() => <UserAvatar size={40} style={{ fontSize: "3rem" }} />}
                    isActive={location.pathname === "/user/profile"}
                    as={Link}
                    to="/user/profile"
                    className="side-nav-link"
                  >
                    Profile
                  </SideNavLink>
                  <SideNavLink
                    renderIcon={() => <FaceMask size={40} style={{ fontSize: "3rem" }} />}
                    isActive={location.pathname === "/user/facial-data"}
                    as={Link}
                    to="/user/facial-data"
                    className="side-nav-link"
                  >
                    Manage Facial Data
                  </SideNavLink>
                  <SideNavLink
                    renderIcon={() => <Settings size={40} style={{ fontSize: "3rem" }} />}
                    isActive={location.pathname === "/user/settings"}
                    as={Link}
                    to="/user/settings"
                    className="side-nav-link"
                  >
                    Settings
                  </SideNavLink>
                </SideNavItems>
              </SideNav>
            </Header>

            {error && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={error}
                onCloseButtonClick={() => setError(null)}
              />
            )}

            <Content className="content" style={{ marginTop: '-2rem', marginRight: '-2rem' }}>
              <Routes>
                <Route path="/" element={<UserHome username={username} />} />
                <Route path="/home" element={<UserHome username={username} />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/settings" element={<UserSettings username={username} />} />
                <Route path="/facial-data" element={<UserManageFacialData />} />
                <Route path="/complaints" element={<UserSendComplaints />} />
                <Route path="/manage-complaints" element={<UserManageComplaints />} />
                <Route path="/llm-chat" element={<UserLLMChat />} /> {/* Add this route */}
                <Route path="*" element={<UserHome username={username} />} />
              </Routes>
            </Content>
          </>
        )}
      />
    </Theme>
  );
}

export default UserBase;