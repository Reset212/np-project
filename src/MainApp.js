import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import HomePageApp from "./homePage/App";
import RealEstatePageApp from "./realEstatePage/App";
import ProjectsPageApp from "./projectsPage/App"; 
import PrivacyPolicyApp from "./privacyPolicy/App"; 
import TermsOfUseApp from "./termsOfUse/App"; 
import AccessibilityStatementApp from "./accessibilityStatement/App"; 
import AdminApp from "./admin/AdminApp";
import "./MainApp.css";
import ScrollToTop from "./ScrollToTop";

function MainApp() {
  return (
    <Router>
      <ScrollToTop />
      <div className="MainApp">
        <Routes>
          <Route path="/" element={<HomePageApp />} />
          <Route path="/home/*" element={<HomePageApp />} />
          <Route path="/real-estate/*" element={<RealEstatePageApp />} />
          <Route path="/projects/*" element={<ProjectsPageApp />} /> 
          <Route path="/privacy-policy/*" element={<PrivacyPolicyApp />} /> 
          <Route path="/terms-of-use/*" element={<TermsOfUseApp />} />
          <Route path="/accessibility-statement/*" element={<AccessibilityStatementApp />} /> 
          <Route path="/mpadmin/*" element={<AdminApp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default MainApp;