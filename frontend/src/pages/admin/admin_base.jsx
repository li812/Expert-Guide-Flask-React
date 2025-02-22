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
import { Search, Logout, Light, Asleep, UserAvatar, Settings, Api, UserAdmin, Dashboard, Email, Add, TrashCan, Edit, Save, View, QuestionAnswering, Course } from '@carbon/icons-react';
import AdminHome from './admin_home';
import AdminManageUsers from './admin_manage_users.jsx';
import AdminSettings from './admin_settings.jsx';
import AdminManageUserComplaints from './admin_manage_users_complaints.jsx';
import AdminManageQuestions from './admin_manage_questions';
import AdminManageCareers from './admin_manage_careers';
import AdminManageCourseType from './admin_manage_course_type';
import AdminManageCourses from './admin_manage_courses';  
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
                <HeaderName href="#" prefix="Welcome" style={{ fontSize: "2rem" }}>
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
                      renderIcon={() => <QuestionAnswering size={40} />}
                      isActive={location.pathname === "/admin/questions"}
                      as={Link}
                      to="/admin/questions"
                      className="side-nav-link"
                      style={{ fontSize: "1.5rem" }}
                    >
                      Career Questions
                    </SideNavLink>
                    <SideNavLink
                      renderIcon={() => <Api size={40} />}
                      isActive={location.pathname === "/admin/careers"}
                      as={Link}
                      to="/admin/careers"
                      className="side-nav-link"
                      style={{ fontSize: "1.5rem" }}
                    >
                      Career Options
                    </SideNavLink>
                    <SideNavLink
                      renderIcon={() => <Course size={40} />}
                      isActive={location.pathname === "/admin/course-types"}
                      as={Link}
                      to="/admin/course-types"
                      className="side-nav-link"
                      style={{ fontSize: "1.5rem" }}
                    >
                      Course Types
                    </SideNavLink>
                    <SideNavLink
                      renderIcon={() => <Course size={40} />}
                      isActive={location.pathname === "/admin/courses"}
                      as={Link}
                      to="/admin/courses"
                      className="side-nav-link"
                      style={{ fontSize: "1.5rem" }}
                    >
                      Manage Courses
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
                  <Route path="questions" element={<AdminManageQuestions username={username} />} />
                  <Route path="careers" element={<AdminManageCareers username={username} />} />
                  <Route path="course-types" element={<AdminManageCourseType username={username} />} />
                  <Route path="courses" element={<AdminManageCourses username={username} />} />
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