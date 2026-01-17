// Файл: BodyText.jsx
import React from "react";
import "./BodyText.css";

const BodyText = () => {
  return (
    <div className="privacy-policy-container">
      <h1 className="privacy-policy-title">PRIVACY POLICY</h1>
      
      <div className="privacy-policy-content">
        <section className="privacy-policy-section">
          <p className="last-updated">
            <strong>Last updated: January 2026</strong>
          </p>
          <p className="intro-text">
            Movie Park Film Developing ("Company", "we", "our", "us") respects your privacy and is committed to 
            protecting <br /> the personal data of users who visit and interact with our website <a href="https://movieparkpro.com" target="_blank" rel="noopener noreferrer">
              movieparkpro.com
            </a>{" "} (the "Website").
          </p>
          <p className="intro-text">
            This Privacy Policy explains how we collect, use, store, and protect your personal information.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">1. Information We Collect</h2>
          <p className="section-text">
            We may collect the following personal data when you submit a contact request through our Website:
          </p>
          <ul className="privacy-list">
            <li className="list-item">Full name</li>
            <li className="list-item">Phone number</li>
            <li className="list-item">Email address</li>
            <li className="list-item">Message or inquiry content</li>
          </ul>
          <p className="section-text">
            We do not collect sensitive personal data.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">2. Purpose of Data Collection</h2>
          <p className="section-text">
            Your personal data is collected and processed solely for the following purposes:
          </p>
          <ul className="privacy-list">
            <li className="list-item">Responding to inquiries and contact requests</li>
            <li className="list-item">Business communication related to our services</li>
            <li className="list-item">Improving our website and user experience</li>
          </ul>
          <p className="section-text">
            We do not use your data for marketing newsletters or unsolicited communications.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">3. Legal Basis for Processing</h2>
          <p className="section-text">
            We process personal data based on:
          </p>
          <ul className="privacy-list">
            <li className="list-item">Your consent when submitting the contact form</li>
            <li className="list-item">Our legitimate business interest in responding to inquiries</li>
          </ul>
          <p className="section-text">
            For users located in the European Economic Area (EEA), data processing <br /> complies 
            with the General Data Protection Regulation (GDPR).
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">4. Cookies and Analytics</h2>
          <p className="section-text">
            Our Website uses Google Analytics to analyze website traffic and user behavior <br />
            Google Analytics may collect anonymized data such as IP address, device type, 
            browser information, and pages visited.
          </p>
          <p className="section-text">
            You can manage or disable cookies through your browser settings.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">5. Data Storage and Security</h2>
          <p className="section-text">
            We take reasonable technical and organizational measures to protect your personal data from <br />
            unauthorized access, loss, misuse, or disclosure.
          </p>
          <p className="section-text">
            Personal data is stored only for as long as necessary to fulfill the purposes outlined in this Policy.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">6. Data Sharing</h2>
          <p className="section-text">
            We do not sell, rent, or trade your personal data. <br /> 
            Data may be shared only with trusted service providers strictly for operational purposes <br />
            (e.g. hosting or analytics), under confidentiality obligations.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">7. International Data Transfers</h2>
          <p className="section-text">
            As we operate internationally, your data may be processed outside your country of residence. <br />
            We ensure appropriate safeguards are in place in accordance with applicable laws.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">8. Your Rights</h2>
          <p className="section-text">
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul className="privacy-list">
            <li className="list-item">Access your personal data</li>
            <li className="list-item">Request correction or deletion</li>
            <li className="list-item">Withdraw consent</li>
            <li className="list-item">Object to processing</li>
          </ul>
          <p className="section-text">
            Requests can be submitted to: <span className="email-text"> <strong>hello@movieparkpro.com</strong></span>
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">9. Children's Privacy</h2>
          <p className="section-text">
            Our Website and services are not intended for individuals under the age of 16. <br />
            We do not knowingly collect personal data from children.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">10. Contact Information</h2>
          <address className="contact-address">
            Movie Park Film Developing<br />
            Al Khabeesi Building, Plot 128-246-9<br />
            Dubai, United Arab Emirates<br />
            </address>
           Email: <span className="email-text"> hello@movieparkpro.com</span>
          
        </section>
      </div>
    </div>
  );
};

export default BodyText;