import React, { useState } from "react";
import "./ContactSection.css";
import { Link } from "react-router-dom";
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

  // Telegram bot credentials
  const TELEGRAM_BOT_TOKEN = "7998150091:AAGe78Y2qZCdev2c6bFVKEumP5dPzK9sDkY";
  const TELEGRAM_CHAT_ID = "-1001644600527";

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

  // Function to send to Telegram
  const sendToTelegram = async () => {
    const message = `

*Name:* ${formData.name}
*Phone:* ${formData.phone}
*Email:* ${formData.email}
*Project:* ${formData.project}

*Date:* ${new Date().toLocaleString()}
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
          message_thread_id: 1527
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram error: ${errorData.description || response.statusText}`);
      }
      
      return { success: true, service: 'telegram' };
    } catch (error) {
      console.warn('Error sending to Telegram:', error);
      return { success: false, service: 'telegram', error: error.message };
    }
  };

  // Function to send to Formspree
  const sendToFormspree = async () => {
    try {
      const response = await fetch('https://formspree.io/f/mpqqqzap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.project,
          _subject: `New application from ${formData.name}`,
        }),
      });

      if (response.ok) {
        return { success: true, service: 'formspree' };
      } else {
        const errorText = await response.text();
        throw new Error(`Formspree error: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.warn('Error sending to Formspree:', error);
      return { success: false, service: 'formspree', error: error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessageSent(false);

    try {
      // Parallel sending to both services
      const [telegramResult, formspreeResult] = await Promise.allSettled([
        sendToTelegram(),
        sendToFormspree()
      ]);

      // Extract values from promises
      const telegramResponse = telegramResult.status === 'fulfilled' 
        ? telegramResult.value 
        : { success: false, service: 'telegram', error: telegramResult.reason?.message || 'Unknown error' };
      
      const formspreeResponse = formspreeResult.status === 'fulfilled' 
        ? formspreeResult.value 
        : { success: false, service: 'formspree', error: formspreeResult.reason?.message || 'Unknown error' };

      const telegramSuccess = telegramResponse.success;
      const formspreeSuccess = formspreeResponse.success;

      // Log results for debugging
      console.log('Telegram result:', telegramResponse);
      console.log('Formspree result:', formspreeResponse);

      // If at least one service succeeded
      if (formspreeSuccess || telegramSuccess) {
        setMessageSent(true);
        setFormData({ name: "", phone: "", email: "", project: "" });

        // Success message with information about where it was sent
        const successMessages = [];
        if (formspreeSuccess) successMessages.push('Formspree');
        if (telegramSuccess) successMessages.push('Telegram');
        
        console.log(`✅ Message successfully sent to: ${successMessages.join(' and ')}`);
        
        setTimeout(() => {
          setMessageSent(false);
        }, 5000);
      } else {
        // If both services failed
        const errorMessage = `
          Failed to send the message.
          Telegram: ${telegramResponse.error || 'unknown error'}
          Formspree: ${formspreeResponse.error || 'unknown error'}
          
          Please try again or contact us directly at email: hello@movieparkpro.com
        `.replace(/\s+/g, ' ').trim();
        
        alert(errorMessage);
        throw new Error('Both sending methods failed');
      }
    } catch (error) {
      console.error('General sending error:', error);
      
      // Additional message only if not shown above
      if (!error.message.includes('Both sending methods failed')) {
        alert('An error occurred while sending. Please try again or contact us directly at email: hello@movieparkpro.com');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section" id="contact-section">
      <div className="contact-container">
        {/* LEFT COLUMN */}
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

        {/* RIGHT COLUMN */}
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
    onKeyPress={(e) => {
      const charCode = e.which ? e.which : e.keyCode;
      const char = String.fromCharCode(charCode);
      
      // Разрешаем цифры
      if (charCode >= 48 && charCode <= 57) {
        return; // разрешаем цифры
      }
      
      // Разрешаем знак + только если это первый символ
      if (char === '+' && e.target.value.length === 0) {
        return; // разрешаем + в начале
      }
      
      // Все остальные символы запрещаем
      e.preventDefault();
    }}
    className="form-input"
    required
    aria-required="true"
    pattern="[0-9+]{10,}"
    title="Enter digits only (optionally starting with +)"
    autoComplete="tel"
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

            <div className="form-footer">
  <div className="privacy-notice">
    By submitting this form, you agree    <span className="mobile-break"><br /></span> to our <Link to="/privacy-policy" className="privacy-link">Privacy Policy</Link>
  </div>
  <button
    type="submit"
    className="submit-button"
    disabled={isSubmitting}
  >
    {isSubmitting ? "Sending..." : "SEND"}
  </button>
</div>

            {/* Mobile email buttons - ONLY for mobile version */}
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