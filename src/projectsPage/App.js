// App.js - обновленная версия
import React from "react";
import NavBar from "./NavBar"; // Импортируем переименованный компонент
import ScrollTextAnimation from "./ScrollTextAnimation";
import ThirdScrollBlock from "./ThirdScrollBlock";
import FourthScrollBlock from "./FourthScrollBlock";
import ContactSection from "./ContactSection";
import ProjectsVideoSection from "./ProjectsVideoSection"; // Компонент с видео и сортировкой
import MensSection from "./MensSection";
import Footer from "./Footer";
import "./App.css";

function ProjectsPageApp() {
  return (
    <div className="App">
      <NavBar /> {/* Используем переименованный компонент */}
      
      <ProjectsVideoSection />
      <ContactSection />

      <Footer />
    </div>
  );
}

export default ProjectsPageApp;