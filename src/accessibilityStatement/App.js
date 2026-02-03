// App.js - обновленная версия
import React from "react";
import NavBar from "./NavBar"; // Импортируем переименованный компонент
import GlobalCursor from '../components/GlobalCursor/GlobalCursor.jsx';
import BodyText from './BodyText';

import Footer from "./Footer";
import "./App.css";

function PrivacyPolicyApp() {
  return (
    <div className="App">
      <GlobalCursor />
      <NavBar /> 
      
      <BodyText />
      <Footer />
    </div>
  );
}

export default PrivacyPolicyApp;