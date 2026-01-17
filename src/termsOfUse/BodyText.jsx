// Файл: BodyText.jsx
import React from "react";
import "./BodyText.css";

const BodyText = () => {
  return (
    <div className="privacy-policy-container">
      <h1 className="privacy-policy-title">TERMS OF USE</h1>
      
      <div className="privacy-policy-content">
        <section className="privacy-policy-section">
          <p className="last-updated">
            <strong>Last updated: January 2026</strong>
          </p>
          <p className="intro-text">
            These Terms of Use govern your access to and use of the website{" "}
            <a href="https://movieparkpro.com" target="_blank" rel="noopener noreferrer">
              movieparkpro.com
            </a>{" "}
            (the "Website"), operated by Movie Park Film Developing ("Company").
          </p>
          <p className="intro-text">
            By accessing or using this Website, you agree to be bound by these Terms.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">1. Website Use</h2>
          <p className="section-text">
            You may use the Website solely for lawful purposes and in accordance with these Terms.
            You agree not to misuse the Website or attempt to gain unauthorized access to its systems.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">2. Intellectual Property</h2>
          <p className="section-text">
            All content on the Website, including but not limited to videos, visuals, text, graphics, logos, and concepts, is the 
            intellectual property of Movie Park Film Developing or its licensors.
          </p>
          <p className="section-text">
            Any reproduction, distribution, or commercial use without prior written consent is strictly prohibited.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">3. Portfolio and Case Studies</h2>
          <p className="section-text">
            Any examples, case studies, or project descriptions displayed on the Website are provided for informational 
            purposes only and do not constitute guarantees of specific results.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">4. Disclaimer</h2>
          <p className="section-text">
            The Website is provided on an "as is" and "as available" basis.
            We make no warranties regarding accuracy, completeness, or suitability of the information presented.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">5. Limitation of Liability</h2>
          <p className="section-text">
            To the maximum extent permitted by law, Movie Park Film Developing shall not be liable for 
            any direct, indirect, incidental, or consequential damages arising from your use of the Website.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">6. Third-Party Links</h2>
          <p className="section-text">
            The Website may contain links to third-party websites. 
            We are not responsible for the content, policies, or practices of such websites.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">7. Governing Law</h2>
          <p className="section-text">
            These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates.
            Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">8. Changes to Terms</h2>
          <p className="section-text">
            We reserve the right to update or modify these Terms at any time. Continued use of the Website 
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="privacy-policy-section">
          <h2 className="section-title">9. Contact</h2>
          <address className="contact-address">
            For questions regarding these Terms, please contact:<br />
            <span className="email-text">hello@movieparkpro.com</span>
          </address>
        </section>
      </div>
    </div>
  );
};

export default BodyText;