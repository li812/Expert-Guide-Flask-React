import React, { useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation, Routes, Route } from 'react-router-dom';
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
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
  Theme,
  SideNavLink
} from '@carbon/react';
import { Search, Logout, Light, Asleep, UserAvatar, Settings, Api, UserAdmin, Dashboard, Email } from '@carbon/icons-react';
import AdminHome from './admin_home';
import AdminManageUsers from './admin_manage_users.jsx';
import AdminSettings from './admin_settings.jsx';
import AdminManageUserComplaints from './admin_manage_users_complaints.jsx';
import './admin.css'; // Import the CSS file for styling

function AdminBase() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login_id } = location.state || {};
  const [darkMode, setDarkMode] = React.useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const [username, setUsername] = React.useState('');

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

    fetchUsername();
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
              <Header aria-label="HumanID Platform" className="header" >
                <SkipToContent />
                <HeaderMenuButton
                  aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
                  onClick={onClickSideNavExpand}
                  isActive={isSideNavExpanded}
                  aria-expanded={isSideNavExpanded}
                />
                <HeaderName href="#" prefix="Welcome"  style={{ fontSize: "2rem" }}>
                  {username}
                </HeaderName>
                <HeaderNavigation aria-label="HumanID Platform">
                <HeaderMenuItem ><UserAdmin /></HeaderMenuItem>
                <HeaderMenuItem >Admin</HeaderMenuItem>
                  <HeaderMenuItem as={Link} to="/admin/settings">Settings</HeaderMenuItem>
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
                      renderIcon={() => <Dashboard size={40} />}
                      isActive={location.pathname === "/admin/home"}
                      as={Link}
                      to="/admin/home"
                      className="side-nav-link"
                      style={{ fontSize: "1.5rem" }}
                    >
                      
                      Dashboard
                    </SideNavLink>
                    <SideNavLink
                      renderIcon={() => <UserAdmin size={40} />}
                      isActive={location.pathname === "/admin/users"}
                      as={Link}
                      to="/admin/users"
                      className="side-nav-link"
                      style={{ fontSize: "1.5rem" }}
                    >
                      Manage Users
                    </SideNavLink>
                    <SideNavLink
                      renderIcon={() => <Email size={40} />}
                      isActive={location.pathname === "/admin/manage-user-complaints"}
                      as={Link}
                      to="/admin/manage-user-complaints"
                      className="side-nav-link"
                      style={{ fontSize: "1.5rem" }}
                    >
                      User Complaints
                    </SideNavLink>

                    <SideNavLink
                      renderIcon={() => <Settings size={40} />}
                      isActive={location.pathname === "/admin/settings"}
                      as={Link}
                      to="/admin/settings"
                      className="side-nav-link"
                      style={{ fontSize: "1.5rem" }}
                    >
                      Settings
                    </SideNavLink>

                  </SideNavItems>
                </SideNav>
              </Header>
              <Content className="content" style={{ marginTop: '-2rem', marginRight: '-2rem' }}>
                <Routes>
                  <Route path="/" element={<AdminHome username={username} />} />
                  <Route path="home" element={<AdminHome username={username} />} />
                  <Route path="users" element={<AdminManageUsers username={username} />} />
                  <Route path="settings" element={<AdminSettings username={username} />} />
                  <Route path="manage-user-complaints" element={<AdminManageUserComplaints username={username} />} />
                 <Route path="*" element={<AdminHome username={username} />} />
                </Routes>
              </Content>
            </>
          )}
        />
      </div>
    </Theme>
  );
}

export default AdminBase;