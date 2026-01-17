// Файл: BodyText.jsx
import React from "react";
import "./BodyText.css";

const BodyText = () => {
  return (
    <div className="privacy-policy-container">
      <h1 className="privacy-policy-title">ACCESSIBILITY STATEMENT</h1>
      
      <div className="privacy-policy-content">
        <section className="privacy-policy-section">
          <p className="last-updated">
            <strong>Last updated: January 2026</strong>
          </p>
          <p className="intro-text">
            Movie Park Film Developing is committed to ensuring digital accessibility for all users, 
            regardless of ability or technology.
          </p>
          <p className="intro-text">
            We strive to improve the user experience of our Website and apply relevant accessibility 
            standards where reasonably possible.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">1. Our Commitment</h2>
          <p className="section-text">
            We aim to:
          </p>
          <ul className="privacy-list">
            <li className="list-item">Provide clear and readable content</li>
            <li className="list-item">Ensure basic navigation accessibility</li>
            <li className="list-item">Improve usability across different devices and browsers</li>
          </ul>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">2. Limitations</h2>
          <p className="section-text">
            While we strive for accessibility, some content or features may not yet fully meet all accessibility standards.  <br />
            We are continuously working to improve.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">3. Feedback</h2>
          <p className="section-text">
            If you experience difficulty accessing any part of our <br />
            Website or have suggestions for improvement, please contact us:
          </p>
          <address className="contact-address">
            <span className="email-text">hello@movieparkpro.com</span>
          </address>
          <p className="section-text">
            We value your feedback and will make reasonable efforts to address accessibility concerns.
          </p>
        </section>
      </div>
    </div>
  );
};

export default BodyText;