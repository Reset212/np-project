import React, { useState, useCallback, useMemo } from "react";
import "./ContactSection.css";
import { Link } from "react-router-dom";

// Константы вынесены из компонента для избежания пересоздания
const TELEGRAM_BOT_TOKEN = "7998150091:AAGe78Y2qZCdev2c6bFVKEumP5dPzK9sDkY";
const TELEGRAM_CHAT_ID = "-1001644600527";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mpqqqzap";
const EMAILS = {
  client: "hello@movieparkpro.com",
  work: "job@movieparkpro.com"
};

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

  // Мемоизированные обработчики
  const copyEmailToClipboard = useCallback(async (email, type) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(type);
      setTimeout(() => setCopiedEmail(""), 2000);
    } catch (err) {
      console.error('Copy error: ', err);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Функция для отправки в Telegram (мемоизирована)
  const sendToTelegram = useCallback(async (data) => {
    const message = `
*Name:* ${data.name}
*Phone:* ${data.phone}
*Email:* ${data.email}
*Project:* ${data.project}

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
  }, []);

  // Функция для отправки в Formspree (мемоизирована)
  const sendToFormspree = useCallback(async (data) => {
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email,
          message: data.project,
          _subject: `New application from ${data.name}`,
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
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Быстрая валидация
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setMessageSent(false);

    try {
      // Параллельная отправка в оба сервиса
      const [telegramResult, formspreeResult] = await Promise.allSettled([
        sendToTelegram(formData),
        sendToFormspree(formData)
      ]);

      // Обработка результатов
      const telegramResponse = telegramResult.status === 'fulfilled' 
        ? telegramResult.value 
        : { success: false, service: 'telegram', error: telegramResult.reason?.message || 'Unknown error' };
      
      const formspreeResponse = formspreeResult.status === 'fulfilled' 
        ? formspreeResult.value 
        : { success: false, service: 'formspree', error: formspreeResult.reason?.message || 'Unknown error' };

      const telegramSuccess = telegramResponse.success;
      const formspreeSuccess = formspreeResponse.success;

      // Если хотя бы один сервис успешен
      if (formspreeSuccess || telegramSuccess) {
        setMessageSent(true);
        setFormData({ name: "", phone: "", email: "", project: "" });

        // Автоматическое скрытие успешного сообщения
        setTimeout(() => {
          setMessageSent(false);
        }, 5000);
      } else {
        // Если оба сервиса не сработали
        const errorMessage = `Failed to send the message. Please try again or contact us directly at email: ${EMAILS.client}`;
        alert(errorMessage);
      }
    } catch (error) {
      console.error('General sending error:', error);
      alert('An error occurred while sending. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, sendToTelegram, sendToFormspree]);

  // Мемоизированный рендер email строк
  const renderEmailRow = useCallback((type, label, email) => {
    const copyType = type === 'client' ? 'client' : 'work';
    const mobileCopyType = type === 'client' ? 'client-mobile' : 'work-mobile';
    const isCopied = copiedEmail === copyType || copiedEmail === mobileCopyType;
    
    return (
      <div className="email-item" key={type}>
        <div className="email-label">{label}</div>
        <div
          className="email-value"
          onClick={() => copyEmailToClipboard(email, copyType)}
          title="Click to copy"
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && copyEmailToClipboard(email, copyType)}
        >
          {email}
          {isCopied && <span className="copy-notification">copied!</span>}
        </div>
      </div>
    );
  }, [copiedEmail, copyEmailToClipboard]);

  // Мемоизированный рендер мобильных email строк
  const renderMobileEmailRow = useCallback((type, label, email) => {
    const copyType = type === 'client' ? 'client-mobile' : 'work-mobile';
    const isCopied = copiedEmail === copyType;
    
    return (
      <div className="mobile-email-item" key={type}>
        <div className="mobile-email-label">{label}</div>
        <div
          className="mobile-email-value"
          onClick={() => copyEmailToClipboard(email, copyType)}
          title="Click to copy"
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && copyEmailToClipboard(email, copyType)}
        >
          {email}
          {isCopied && <span className="mobile-copy-notification">copied!</span>}
        </div>
      </div>
    );
  }, [copiedEmail, copyEmailToClipboard]);

  // Мемоизированный массив email данных
  const emailData = useMemo(() => [
    { type: 'client', label: 'WHAT TO BECOME OUR CLIENT?', email: EMAILS.client },
    { type: 'work', label: 'WHAT TO WORK FOR US?', email: EMAILS.work }
  ], []);

  return (
    <section className="contact-section" id="contact-section">
      <div className="contact-container">
        {/* LEFT COLUMN */}
        <div className="left-column">
          <div className="emails-section">
            <div className="email-row">
              {emailData.map(({ type, label, email }) => 
                renderEmailRow(type, label, email)
              )}
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

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
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
                aria-required="true"
                autoComplete="name"
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
                  aria-required="true"
                  autoComplete="email"
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
                autoComplete="off"
                required
              />
            </div>

            <div className="form-footer">
              <div className="privacy-notice">
                By submitting this form, you agree    
                <span className="mobile-break"><br /></span> 
                to our <Link to="/privacy-policy" className="privacy-link">Privacy Policy</Link>
              </div>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "SEND"}
              </button>
            </div>

            {/* Mobile email buttons - ONLY for mobile version */}
            <div className="mobile-emails-section">
              {emailData.map(({ type, label, email }) => 
                renderMobileEmailRow(type, label, email)
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

// Используем React.memo при экспорте, а не при определении
export default React.memo(ContactSection);