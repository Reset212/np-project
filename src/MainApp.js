import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import HomePageApp from "./homePage/App";
import RealEstatePageApp from "./realEstatePage/App";
import ProjectsPageApp from "./projectsPage/App"; // Добавьте эту строку
import "./MainApp.css";
import ScrollToTop from "./ScrollToTop";

function MainApp() {
  return (
    <Router>
      <ScrollToTop />
      <div className="MainApp">
        <Routes>
          <Route path="/" element={<HomePageApp />} />
          <Route path="/home" element={<HomePageApp />} />
          <Route path="/real-estate" element={<RealEstatePageApp />} />
          <Route path="/projects" element={<ProjectsPageApp />} /> {/* Добавьте этот маршрут */}
        </Routes>
      </div>
    </Router>
  );
}

export default MainApp;