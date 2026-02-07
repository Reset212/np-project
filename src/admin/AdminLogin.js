import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from "../image/logo.png";
import instagramIcon from "../image/instagram-icon.svg";
import emailIcon from "../image/email-icon.svg";
import vimeoIcon from "../image/vimeo-icon.svg";
import "./font.css";

// Константы для проверки (вынесены из компонента для избежания пересоздания)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1234';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Мемоизированные стили для улучшения производительности
  const styles = useMemo(() => ({
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#161719',
      color: 'white',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
    },
    header: {
      padding: '30px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    logo: {
      marginBottom: '30px',
    },
    logoImage: {
      height: '50px',
      width: 'auto',
      filter: 'brightness(0) invert(1)',
    },
    titleContainer: {
      marginBottom: '20px',
    },
    titleH1: {
      color: 'white',
      margin: '0 0 10px 0',
      fontSize: '36px',
      fontWeight: '700',
      letterSpacing: '3px',
      textTransform: 'uppercase',
    },
    titleH3: {
      color: '#C5C5C5',
      margin: '0',
      fontSize: '16px',
      fontWeight: '400',
      letterSpacing: '2px',
      textTransform: 'uppercase',
    },
    loginBox: {
      background: '#242527',
      padding: '40px',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '450px',
      margin: '0 auto 40px',
      border: '1px solid #333',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    },
    boxHeader: {
      textAlign: 'center',
      marginBottom: '40px',
    },
    boxHeaderH2: {
      color: 'white',
      margin: '0 0 10px 0',
      fontSize: '28px',
      fontWeight: '600',
    },
    boxHeaderP: {
      color: '#888',
      margin: '0',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    loginForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '25px',
    },
    formGroup: {
      marginBottom: '0',
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      background: '#161719',
      border: '1px solid #333',
      borderRadius: '8px',
      fontSize: '15px',
      color: 'white',
      transition: 'all 0.3s',
      boxSizing: 'border-box',
    },
    errorMessage: {
      color: '#ff6b6b',
      background: 'rgba(220, 53, 69, 0.1)',
      padding: '14px',
      borderRadius: '6px',
      textAlign: 'center',
      fontSize: '14px',
      border: '1px solid rgba(220, 53, 69, 0.3)',
      animation: 'fadeIn 0.3s ease-in',
    },
    loginButton: {
      background: '#C5C5C5',
      color: '#000',
      border: 'none',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginTop: '10px',
    },
    footer: {
      background: '#161719',
      borderTop: '1px solid #333',
      padding: '25px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 'auto',
    },
    footerLeft: {
      color: '#888',
      fontSize: '14px',
    },
    footerSocial: {
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
    },
    socialIcon: {
      width: '20px',
      height: '20px',
      filter: 'brightness(0) invert(1)',
      opacity: '0.7',
      transition: 'opacity 0.3s',
    },
  }), []);

  // Проверка авторизации
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_auth') === 'authenticated';
    const timestamp = localStorage.getItem('admin_timestamp');
    
    if (isAuthenticated && timestamp) {
      const timeDiff = Date.now() - parseInt(timestamp, 10);
      
      if (timeDiff < TWELVE_HOURS_MS) {
        navigate('/admin');
      } else {
        localStorage.removeItem('admin_auth');
        localStorage.removeItem('admin_timestamp');
      }
    }
  }, [navigate]);

  // Мемоизированные обработчики
  const handleInputFocus = useCallback((e) => {
    e.target.style.outline = 'none';
    e.target.style.borderColor = '#C5C5C5';
    e.target.style.background = '#1a1b1c';
    e.target.style.boxShadow = '0 0 0 2px rgba(197, 197, 197, 0.1)';
  }, []);

  const handleInputBlur = useCallback((e) => {
    e.target.style.borderColor = '#333';
    e.target.style.background = '#161719';
    e.target.style.boxShadow = 'none';
  }, []);

  const handleButtonMouseEnter = useCallback((e) => {
    if (!loading && username.trim() && password.trim()) {
      e.currentTarget.style.background = '#d0d0d0';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    }
  }, [loading, username, password]);

  const handleButtonMouseLeave = useCallback((e) => {
    if (!loading && username.trim() && password.trim()) {
      e.currentTarget.style.background = '#C5C5C5';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }
  }, [loading, username, password]);

  const handleSocialMouseEnter = useCallback((e) => {
    e.currentTarget.style.opacity = '1';
  }, []);

  const handleSocialMouseLeave = useCallback((e) => {
    e.currentTarget.style.opacity = '0.7';
  }, []);

  const handleLogin = useCallback((e) => {
    e.preventDefault();
    setError('');
    
    // Быстрая валидация
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);

    // Имитация асинхронной операции с requestAnimationFrame
    requestAnimationFrame(() => {
      try {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          localStorage.setItem('admin_auth', 'authenticated');
          localStorage.setItem('admin_timestamp', Date.now().toString());
          
          setTimeout(() => {
            navigate('/admin');
          }, 100);
        } else {
          setError('Invalid username or password');
        }
      } catch (err) {
        setError('Authentication error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
  }, [username, password, navigate]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  }, [handleLogin]);

  // Вычисляем состояние кнопки
  const isButtonDisabled = loading || !username.trim() || !password.trim();
  const buttonStyle = useMemo(() => ({
    ...styles.loginButton,
    opacity: isButtonDisabled ? 0.5 : 1,
    cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
  }), [styles.loginButton, isButtonDisabled]);

  // Рендер социальных иконок
  const renderSocialIcons = useMemo(() => [
    {
      href: "https://www.instagram.com/movie_park/",
      icon: instagramIcon,
      alt: "Instagram",
      label: "Instagram"
    },
    {
      href: "https://vimeo.com/movieparkco",
      icon: vimeoIcon,
      alt: "Vimeo",
      label: "Vimeo"
    },
    {
      href: "mailto:hello@movieparkpro.com",
      icon: emailIcon,
      alt: "Email",
      label: "Email"
    }
  ], []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <Link to="/home">
            <img 
              src={logoImg} 
              alt="Logo" 
              style={styles.logoImage}
              loading="lazy"
            />
          </Link>
        </div>
        <div style={styles.titleContainer}>
          <h1 style={styles.titleH1}>LOGIN</h1>
          <h3 style={styles.titleH3}>IN ADMIN PANEL</h3>
        </div>
      </div>
      
      <div style={styles.loginBox}>
        <div style={styles.boxHeader}>
          <h2 style={styles.boxHeaderH2}>Admin Panel</h2>
        </div>
        
        <form onSubmit={handleLogin} style={styles.loginForm}>
          <div style={styles.formGroup}>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Login"
              autoComplete="username"
              style={styles.input}
              autoFocus
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          <div style={styles.formGroup}>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Password"
              autoComplete="current-password"
              style={styles.input}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          {error && <div style={styles.errorMessage}>{error}</div>}
          
          <button 
            type="submit" 
            style={buttonStyle}
            disabled={isButtonDisabled}
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      
      <footer style={styles.footer}>
        <div style={styles.footerLeft}>
          <span>© 2025 MOVIE PARK</span>
        </div>
        <div style={styles.footerSocial}>
          {renderSocialIcons.map(({ href, icon, alt, label }) => (
            <a 
              key={href}
              href={href} 
              target="_blank"
              rel="noopener noreferrer" 
              aria-label={label}
            >
              <img 
                src={icon} 
                alt={alt} 
                style={styles.socialIcon}
                onMouseEnter={handleSocialMouseEnter}
                onMouseLeave={handleSocialMouseLeave}
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          [data-mobile] {
            padding: 30px 20px !important;
            margin: 0 20px 30px !important;
          }
          
          .logo-image {
            height: 40px !important;
          }
          
          .login-title h1 {
            font-size: 28px !important;
          }
          
          .login-title h3 {
            font-size: 14px !important;
          }
          
          .login-box h2 {
            font-size: 24px !important;
          }
          
          input {
            padding: 12px 14px !important;
            font-size: 14px !important;
          }
          
          button {
            padding: 14px !important;
            font-size: 15px !important;
          }
          
          footer {
            padding: 20px !important;
            flex-direction: column !important;
            gap: 15px !important;
            text-align: center !important;
          }
          
          .footer-social {
            justify-content: center !important;
          }
        }
        
        @media (max-width: 480px) {
          [data-mobile] {
            padding: 25px 15px !important;
            margin: 0 15px 25px !important;
          }
          
          .login-title h1 {
            font-size: 24px !important;
          }
          
          .login-title h3 {
            font-size: 12px !important;
          }
          
          .login-box h2 {
            font-size: 22px !important;
          }
          
          button {
            padding: 12px !important;
            font-size: 14px !important;
          }
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        input:focus {
          outline: none;
        }
        
        a {
          text-decoration: none;
          color: inherit;
        }
      `}</style>
    </div>
  );
};

// Оптимизируем с помощью React.memo
export default React.memo(AdminLogin);