import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import {
  Content,
  HeaderContainer,
  Header,
  SkipToContent,
  HeaderMenuButton,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SideNav,
  SideNavItems,
  SideNavLink,
  Theme,
  HeaderMenu
} from '@carbon/react';
import { Light, Asleep, Logout, Dashboard, Api, UserAvatar, Settings, Email, Code } from '@carbon/icons-react';
import DeveloperHome from './developer_home';
import DeveloperManageAPI from './developer_manage_api';
import DeveloperGenerateAPI from './developer_generate_api';
import DeveloperProfile from './developer_profile';
import DeveloperSendComplaints from './developer_send_complaints';
import DeveloperManageComplaints from './developer_manage_complaints';
import DeveloperSettings from './developer_settings';
import './developer.css';

function DeveloperBase() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login_id } = location.state || {};
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState({
    fullName: "",
    profilePicture: null,
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/check-session', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok && data.authenticated) {
          setUsername(data.username);
        } else {
          console.error('Error fetching username:', data.error);
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching username:', error);
        navigate('/login');
      }
    };

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
      }
    };

    fetchUsername();
    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        navigate('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Theme theme={darkMode ? "g100" : "white"}>
      <div data-theme={darkMode ? "dark" : "light"}>
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
                  {username}
                  
                </HeaderName>
                <HeaderNavigation aria-label="Expert_Guide Platform">
                  <HeaderMenuItem>
                    <div className="profile-picture-container-small">
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
                        <UserAvatar size={20} />
                      )}
                    </div>
                  </HeaderMenuItem>
                  <HeaderMenuItem><Code /></HeaderMenuItem>
                  <HeaderMenuItem>Developer</HeaderMenuItem>
                  <HeaderMenuItem as={Link} to="/developer/profile">Profile</HeaderMenuItem>
                  <HeaderMenuItem as={Link} to="/developer/settings">Settings</HeaderMenuItem>
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
                      isActive={location.pathname === "/developer/home"}
                      as={Link}
                      to="/developer/home"
                      className="side-nav-link"
                    >
                      Dashboard
                    </SideNavLink>
                    <SideNavLink
                      renderIcon={() => <Api size={40} style={{ fontSize: "3rem" }} />}
                      isActive={location.pathname === "/developer/generate-api"}
                      as={Link}
                      to="/developer/generate-api"
                      className="side-nav-link"
                    >
                      Generate API
                    </SideNavLink>
                    <SideNavLink
                      renderIcon={() => <Api size={40} style={{ fontSize: "3rem" }} />}
                      isActive={location.pathname === "/developer/manage-apis"}
                      as={Link}
                      to="/developer/manage-apis"
                      className="side-nav-link"
                    >
                      Manage APIs
                    </SideNavLink>
                    <SideNavLink
                      renderIcon={() => <Email size={40} style={{ fontSize: "3rem" }} />}
                      isActive={location.pathname === "/developer/send-complaints"}
                      as={Link}
                      to="/developer/send-complaints"
                      className="side-nav-link"
                    >
                      Send Complaints
                    </SideNavLink>
                    <SideNavLink
                      renderIcon={() => <Email size={40} style={{ fontSize: "3rem" }} />}
                      isActive={location.pathname === "/developer/manage-complaints"}
                      as={Link}
                      to="/developer/manage-complaints"
                      className="side-nav-link"
                    >
                      Manage Complaints
                    </SideNavLink>
                    <SideNavLink
                      renderIcon={() => <UserAvatar size={40} style={{ fontSize: "3rem" }} />}
                      isActive={location.pathname === "/developer/profile"}
                      as={Link}
                      to="/developer/profile"
                      className="side-nav-link"
                    >
                      Profile
                    </SideNavLink>

                    <SideNavLink
                      renderIcon={() => <Settings size={40} style={{ fontSize: "3rem" }} />}
                      isActive={location.pathname === "/developer/settings"}
                      as={Link}
                      to="/developer/settings"
                      className="side-nav-link"
                    >
                      Settings
                    </SideNavLink>
                  </SideNavItems>
                </SideNav>
              </Header>
              <Content className="content" style={{ marginTop: '-2rem', marginRight: '-2rem' }}>
                <Routes>
                  <Route path="home" element={<DeveloperHome username={username} />} />
                  <Route path="generate-api" element={<DeveloperGenerateAPI username={username} />} />
                  <Route path="manage-apis" element={<DeveloperManageAPI username={username} />} />
                  <Route path="send-complaints" element={<DeveloperSendComplaints username={username} />} />
                  <Route path="manage-complaints" element={<DeveloperManageComplaints username={username} />} />
                  <Route path="profile" element={<DeveloperProfile username={username} />} />
                  <Route path="settings" element={<DeveloperSettings username={username} />} />
                  <Route path="*" element={<DeveloperHome username={username} />} />
                </Routes>
              </Content>
            </>
          )}
        />
      </div>
    </Theme>
  );
}

export default DeveloperBase;