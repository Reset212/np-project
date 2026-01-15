import React, { useState } from "react";
import "./ContactSection.css";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    project: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState("");

  const copyEmailToClipboard = (email, type) => {
    navigator.clipboard.writeText(email)
      .then(() => {
        setCopiedEmail(type);
        setTimeout(() => setCopiedEmail(""), 2000);
      })
      .catch(err => {
        console.error('Copy error: ', err);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/xvgewwby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.project,
          _subject: `Новая заявка от ${formData.name}`,
          _replyto: formData.email,
          _to: "manatin306@gmail.com"
        }),
      });

      if (response.ok) {
        setMessageSent(true);
        setFormData({ name: "", phone: "", email: "", project: "" });

        setTimeout(() => {
          setMessageSent(false);
        }, 5000);
      } else {
        throw new Error('Sending error');
      }
    } catch (error) {
      alert('An error occurred while sending. Please try again or contact us directly at hello@movieparkpro.com');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ОБНОВЛЕНО: Добавлен id для навигации
  return (
    <section className="contact-section" id="contact-section">
      {/* УДАЛЕНО: Разделительная полоса теперь находится ВНЕ этого компонента */}
      <div className="contact-container">
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="left-column">
          <div className="emails-section">
            <div className="email-row">
              <div className="email-item">
                <div className="email-label">WHAT TO BECOME OUR CLIENT?</div>
                <div
                  className="email-value"
                  onClick={() => copyEmailToClipboard("hello@movieparkpro.com", "client")}
                  title="Click to copy"
                >
                  hello@movieparkpro.com
                  {copiedEmail === "client" && <span className="copy-notification">copied!</span>}
                </div>
              </div>

              <div className="email-item">
                <div className="email-label">WHAT TO WORK FOR US?</div>
                <div
                  className="email-value"
                  onClick={() => copyEmailToClipboard("job@movieparkpro.com", "work")}
                  title="Click to copy"
                >
                  job@movieparkpro.com
                  {copiedEmail === "work" && <span className="copy-notification">copied!</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="chat-section">
            <div className="chat-text">CHAT<br />WITH US</div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        <div className="right-column">
          <div className="text-section">
            <div className="contact-text">
              FEEL FREE TO WRITE AND CALL US.<br />
              WE REALLY LOVE TO COMMUNICATE WITH OUR CLIENTS
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            {messageSent && (
              <div className="success-message">
                ✓ The message has been successfully sent! We will contact you shortly.
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name" className="form-label">YOUR NAME:*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder=""
              />
            </div>

            <div className="form-row">
              <div className="form-group form-group-half">
                <label htmlFor="phone" className="form-label">PHONE NUMBER:*</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder=""
                  pattern="[0-9+\-\s()]{10,}"
                  title="Enter the correct phone number"
                />
              </div>

              <div className="form-group form-group-half">
                <label htmlFor="email" className="form-label">EMAIL ADDRESS:*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder=""
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="project" className="form-label">TELL US ABOUT YOUR PROJECT</label>
              <input
                id="project"
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                className="form-input"
                rows="1"
                placeholder=""
                required
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "SEND"}
            </button>

            {/* Мобильные email кнопки - ТОЛЬКО для мобильной версии */}
            <div className="mobile-emails-section">
              <div className="mobile-email-item">
                <div className="mobile-email-label">WHAT TO BECOME OUR CLIENT?</div>
                <div
                  className="mobile-email-value"
                  onClick={() => copyEmailToClipboard("hello@movieparkpro.com", "client-mobile")}
                  title="Click to copy"
                >
                  hello@movieparkpro.com
                  {copiedEmail === "client-mobile" && <span className="mobile-copy-notification">copied!</span>}
                </div>
              </div>
              <div className="mobile-email-item">
                <div className="mobile-email-label">WHAT TO WORK FOR US?</div>
                <div
                  className="mobile-email-value"
                  onClick={() => copyEmailToClipboard("job@movieparkpro.com", "work-mobile")}
                  title="Click to copy"
                >
                  job@movieparkpro.com
                  {copiedEmail === "work-mobile" && <span className="mobile-copy-notification">copied!</span>}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;