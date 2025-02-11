import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import {
  Content,
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Theme,
} from "@carbon/react";
import { Light, Asleep, IbmWatsonxCodeAssistantForZRefactor } from "@carbon/icons-react";
import Home from "./pages/Home";
import About from "./pages/About";
import Sum from "./pages/Sum";
import Login from "./pages/Login";
import UserBase from "./pages/user/user_base";
import UserHome from './pages/user/user_home';
import ForDevelopers from "./pages/For_Developers";
import AdminBase from "./pages/admin/admin_base";
import AdminHome from "./pages/admin/admin_home";
import DeveloperBase from "./pages/developer/developer_base";
import DeveloperHome from "./pages/developer/developer_home";
import RegisterUser from "./pages/RegisterUser";
import RegisterDeveloper from "./pages/RegisterDeveloper";
import "./App.css";
import LLMChatBotSmallButton from './components/LLMChatBotSmall/LLMChatBotSmallButton';
import ProtectedRoute from './components/ProtectedRoute';
import AdminManageUsers from "./pages/admin/admin_manage_users.jsx";
import AdminManageDevelopers from "./pages/admin/admin_manage_developers.jsx";
import AdminManageApis from "./pages/admin/admin_manage_apis.jsx";
import AdminSettings from "./pages/admin/admin_settings.jsx";
import DeveloperSettings from './pages/developer/developer_settings';

function App() {
  const [darkMode, setDarkMode] = React.useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <Theme theme={darkMode ? "g100" : "white"}>
      <Router>
        <div>
          <Header style={{ fontSize: "1rem" }} aria-label="HumanID">
            <HeaderName style={{ fontSize: "2rem" }} href="/" prefix="">
              HumanID
            </HeaderName>
            <HeaderNavigation style={{ fontSize: "1rem" }} aria-label="HumanID">
              <HeaderMenuItem as={Link} to="/" style={{ fontSize: "1rem" }}>
                Home
              </HeaderMenuItem>
              <HeaderMenuItem as={Link} to="/about" style={{ fontSize: "1rem" }}>
                About
              </HeaderMenuItem>
              {/* <HeaderMenuItem as={Link} to="/sum" style={{ fontSize: "1rem" }}>
                Sum
              </HeaderMenuItem> */}
              <HeaderMenuItem as={Link} to="/for_developers" style={{ fontSize: "1rem" }}>
                For Developers
              </HeaderMenuItem>
            </HeaderNavigation>
            <HeaderGlobalBar id="Top-Bar-left">
              <HeaderGlobalAction aria-label="Theme Toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Light size={25} /> : <Asleep size={25} />}
              </HeaderGlobalAction>
              <HeaderMenuItem as={Link} to="/register-user" style={{ fontSize: "1rem" }}>
                Register as User
              </HeaderMenuItem>
              <HeaderMenuItem as={Link} to="/register-developer" style={{ fontSize: "1rem" }}>
              Register as Developer
              </HeaderMenuItem>
              <HeaderMenuItem as={Link} to="/login" style={{ fontSize: "1rem" }}>
                Login
              </HeaderMenuItem>
            </HeaderGlobalBar>
          </Header>

          <LLMChatBotSmallButton />

          <Content>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/sum" element={<Sum />} />
              <Route path="/for_developers" element={<ForDevelopers />} /> {/* Add this line */}
              <Route path="/login" element={<Login />} />
              <Route path="/register-user" element={<RegisterUser />} /> 
              <Route path="/register-developer" element={<RegisterDeveloper />} /> 
              
              {/* Protected admin routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute requiredType={1}>
                  <AdminBase />
                </ProtectedRoute>
              }>
                <Route index element={<AdminHome />} />
                <Route path="home" element={<AdminHome />} />
                <Route path="users" element={<AdminManageUsers />} />
                <Route path="developers" element={<AdminManageDevelopers />} />
                <Route path="apis" element={<AdminManageApis />} />
                <Route path="settings" element={<AdminSettings />} /> 
              </Route>

              {/* Protected user routes */}
              <Route path="/user/*" element={
                <ProtectedRoute requiredType={2}>
                  <UserBase />
                </ProtectedRoute>
              }>
                <Route index element={<UserHome />} />
                <Route path="home" element={<UserHome />} />
              </Route>

              {/* Protected developer routes */}
              <Route path="/developer/*" element={
                <ProtectedRoute requiredType={3}>
                  <DeveloperBase />
                </ProtectedRoute>
              }>
                <Route index element={<DeveloperHome />} />
                <Route path="home" element={<DeveloperHome />} />
                <Route path="settings" element={<DeveloperSettings />} /> {/* Add if needed */}
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Content>
        </div>
      </Router>
    </Theme>
  );
}

export default App;