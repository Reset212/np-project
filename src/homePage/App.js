import React from "react";
import VideoBackground from "./VideoBackground";
import GlobalCursor from './GlobalCursor';
import ScrollTextAnimation from "./ScrollTextAnimation";
import ThirdScrollBlock from "./ThirdScrollBlock";
import FourthScrollBlock from "./FourthScrollBlock";
import ContactSection from "./ContactSection";
import HomeSection from "./HomeSection";
import ProjectsSection from "./ProjectsSection";
import MensSection from "./MensSection";
import Footer from "./Footer";
import "./App.css";

function HomePageApp() {
  return (
    <div className="App">
       <GlobalCursor />
      <VideoBackground />
      <div style={{height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      </div>
      
      <ScrollTextAnimation />
      <div style={{height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      </div>
      <ThirdScrollBlock />
      <HomeSection />
      <MensSection />
      <ProjectsSection />
      <FourthScrollBlock />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default HomePageApp;