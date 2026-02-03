// App.js - обновленная версия
import React from "react";
import GlobalCursor from '../components/GlobalCursor/GlobalCursor.jsx';
import VideoBackground from "./VideoBackground";
import ScrollTextAnimation from "./ScrollTextAnimation";
import ThirdScrollBlock from "./ThirdScrollBlock";

import ContactSection from "./ContactSection";
import ProjectsVideoSection from "./ProjectsVideoSection"; // Импортируем новый компонент
import MensSection from "./MensSection";
import Footer from "./Footer";
import "./App.css";

function HomePageApp() {
  return (
    <div className="App">
      <GlobalCursor />
      <VideoBackground />
      <ScrollTextAnimation />
      <ThirdScrollBlock />
      
      {/* Добавляем новый блок с видео и сортировкой */}
      <ProjectsVideoSection />
    
      <MensSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default HomePageApp;