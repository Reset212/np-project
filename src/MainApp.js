import React, { Suspense, lazy } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./MainApp.css";
import ScrollToTop from "./ScrollToTop";

// Ленивая загрузка всех страниц
const HomePageApp = lazy(() => import("./homePage/App"));
const RealEstatePageApp = lazy(() => import("./realEstatePage/App"));
const ProjectsPageApp = lazy(() => import("./projectsPage/App"));
const PrivacyPolicyApp = lazy(() => import("./privacyPolicy/App"));
const TermsOfUseApp = lazy(() => import("./termsOfUse/App"));
const AccessibilityStatementApp = lazy(() => import("./accessibilityStatement/App"));

// Компонент загрузки
const PageLoader = () => (
  <div className="page-loader">
    <div className="spinner"></div>
  </div>
);

function MainApp() {
  return (
    <Router>
      <ScrollToTop />
      <div className="MainApp">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePageApp />} />
            <Route path="/home" element={<HomePageApp />} />
            <Route path="/real-estate" element={<RealEstatePageApp />} />
            <Route path="/projects" element={<ProjectsPageApp />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyApp />} />
            <Route path="/terms-of-use" element={<TermsOfUseApp />} />
            <Route path="/accessibility-statement" element={<AccessibilityStatementApp />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default MainApp;