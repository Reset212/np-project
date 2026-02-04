import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePageApp from "./homePage/App";
import RealEstatePageApp from "./realEstatePage/App";
import ProjectsPageApp from "./projectsPage/App"; 
import PrivacyPolicyApp from "./privacyPolicy/App"; 
import TermsOfUseApp from "./termsOfUse/App"; 
import AccessibilityStatementApp from "./accessibilityStatement/App"; 
import "./MainApp.css";
import ScrollToTop from "./ScrollToTop";
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import NewProject from './admin/NewProject';
import OurProjects from './admin/OurProjects';

// Protected Route компонент
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('admin_auth') === 'authenticated';
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function MainApp() {
  return (
    <Router>
      <ScrollToTop />
      <div className="MainApp">
        <Routes>
          <Route path="/" element={<HomePageApp />} />
          <Route path="/home" element={<HomePageApp />} />
          <Route path="/real-estate" element={<RealEstatePageApp />} />
          <Route path="/projects" element={<ProjectsPageApp />} /> 
          <Route path="/privacy-policy" element={<PrivacyPolicyApp />} /> 
          <Route path="/terms-of-use" element={<TermsOfUseApp />} />
          <Route path="/accessibility-statement" element={<AccessibilityStatementApp />} /> 
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Вложенные маршруты */}
            <Route index element={<NewProject />} />
            <Route path="new-project" element={<NewProject />} />
            <Route path="new-project/:id" element={<NewProject />} />
            <Route path="our-projects" element={<OurProjects />} />
          </Route>
          
          {/* Перенаправление старых маршрутов */}
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default MainApp;