// App.js - обновленная версия
import React from "react";
import NavBar from "./NavBar"; // Импортируем переименованный компонент
import GlobalCursor from '../components/GlobalCursor/GlobalCursor.jsx';
import ContactSection from "./ContactSection";
import ProjectsVideoSection from "./ProjectsVideoSection"; // Компонент с видео и сортировкой
import Footer from "./Footer";
import "./App.css";

function ProjectsPageApp() {
  return (
    <div className="App">
      <GlobalCursor />
      <NavBar /> {/* Используем переименованный компонент */}
      
      <ProjectsVideoSection />
      <ContactSection />

      <Footer />
    </div>
  );
}

export default ProjectsPageApp;