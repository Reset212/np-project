// App.js - обновленная версия
import React from "react";
import VideoBackground from "./VideoBackground";
import ScrollTextAnimation from "./ScrollTextAnimation";
import ThirdScrollBlock from "./ThirdScrollBlock";
import FourthScrollBlock from "./FourthScrollBlock";
import ContactSection from "./ContactSection";
import ProjectsVideoSection from "./ProjectsVideoSection"; // Импортируем новый компонент
import MensSection from "./MensSection";
import Footer from "./Footer";
import "./App.css";

function HomePageApp() {
  return (
    <div className="App">
      <VideoBackground />
      <div style={{height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      </div>
      
      <ScrollTextAnimation />
      <div style={{height: '120vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      </div>
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