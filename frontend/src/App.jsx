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
  Button,
  Theme,
} from "@carbon/react";
import { Light, Asleep, IbmWatsonxCodeAssistantForZRefactor, ArrowRight, Login as LoginIcon } from "@carbon/icons-react";
import Home from "./pages/Home";
import About from "./pages/About";
import Sum from "./pages/Sum";
import Login from "./pages/Login";
import UserBase from "./pages/user/user_base";
import UserHome from './pages/user/user_home';
import ForStudents from "./pages/For_Students";
import AdminBase from "./pages/admin/admin_base";
import AdminHome from "./pages/admin/admin_home";
import RegisterUser from "./pages/RegisterUser";
import "./App.css";
import LLMChatBotSmallButton from './components/LLMChatBotSmall/LLMChatBotSmallButton';
import ProtectedRoute from './components/ProtectedRoute';
import AdminManageUsers from "./pages/admin/admin_manage_users.jsx";
import AdminSettings from "./pages/admin/admin_settings.jsx";


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
          <Header style={{ fontSize: "1rem" }} aria-label="Expert Guide">
            <HeaderName style={{ fontSize: "2rem" }} href="/" prefix="">
              Expert Guide
            </HeaderName>
            <HeaderNavigation style={{ fontSize: "1rem" }} aria-label="Expert Guide">
              <HeaderMenuItem as={Link} to="/" style={{ fontSize: "1rem" }}>
                Home
              </HeaderMenuItem>
              <HeaderMenuItem as={Link} to="/about" style={{ fontSize: "1rem" }}>
                About
              </HeaderMenuItem>
              {/* <HeaderMenuItem as={Link} to="/sum" style={{ fontSize: "1rem" }}>
                Sum
              </HeaderMenuItem> */}
              <HeaderMenuItem as={Link} to="/for_students" style={{ fontSize: "1rem" }}>
                For Students
              </HeaderMenuItem>
            </HeaderNavigation>
            <HeaderGlobalBar id="Top-Bar-left">
              <HeaderGlobalAction aria-label="Theme Toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Light size={25} /> : <Asleep size={25} />}
              </HeaderGlobalAction>
              <Button as={Link} to="/register-user" style={{ fontSize: "1rem" }} kind="tertiary" renderIcon={ArrowRight}>Register as User</Button>
              <Button as={Link} to="/login" style={{ fontSize: "1rem" }} renderIcon={LoginIcon}>Login</Button>

            </HeaderGlobalBar>
          </Header>

          <LLMChatBotSmallButton />

          <Content>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/sum" element={<Sum />} />
              <Route path="/for_students" element={<ForStudents />} /> {/* Add this line */}
              <Route path="/login" element={<Login />} />
              <Route path="/register-user" element={<RegisterUser />} /> 
              
              {/* Protected admin routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute requiredType={1}>
                  <AdminBase />
                </ProtectedRoute>
              }>
                <Route index element={<AdminHome />} />
                <Route path="home" element={<AdminHome />} />
                <Route path="users" element={<AdminManageUsers />} />
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

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Content>
        </div>
      </Router>
    </Theme>
  );
}

export default App;