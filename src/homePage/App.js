import React from "react";
import VideoBackground from "./VideoBackground";
import GlobalCursor from '../components/GlobalCursor/GlobalCursor.jsx';
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
      <div style={{height: '0vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      </div>
      
      <ScrollTextAnimation />
      {/* <div style={{height: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      </div> */}
      <ThirdScrollBlock />
      <HomeSection />
      <MensSection />
            {/* <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      </div> */}
                  {/* <div style={{height: '100vh', background:'red', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      </div> */}

      <ProjectsSection />
      <FourthScrollBlock />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default HomePageApp;