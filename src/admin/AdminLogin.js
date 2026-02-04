import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from "../image/logo.png";
import instagramIcon from "../image/instagram-icon.svg";
import emailIcon from "../image/email-icon.svg";
import vimeoIcon from "../image/vimeo-icon.svg";

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Константы для проверки
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = '1234';

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const isAuthenticated = localStorage.getItem('admin_auth') === 'authenticated';
    const timestamp = localStorage.getItem('admin_timestamp');
    
    if (isAuthenticated && timestamp) {
      const twelveHours = 12 * 60 * 60 * 1000;
      const timeDiff = Date.now() - parseInt(timestamp);
      
      if (timeDiff < twelveHours) {
        navigate('/admin');
      } else {
        localStorage.removeItem('admin_auth');
        localStorage.removeItem('admin_timestamp');
      }
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Проверка логина и пароля
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Сохраняем статус авторизации
        localStorage.setItem('admin_auth', 'authenticated');
        localStorage.setItem('admin_timestamp', Date.now().toString());
        
        // Перенаправляем на главную страницу админки
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
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  // Стили
  const styles = {
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
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#C5C5C5',
      fontSize: '14px',
      fontWeight: '500',
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
    loginInfo: {
      marginTop: '25px',
      paddingTop: '25px',
      borderTop: '1px solid #333',
      textAlign: 'center',
      color: '#666',
      fontSize: '12px',
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <Link to="/home">
            <img src={logoImg} alt="Logo" style={styles.logoImage} />
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
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#C5C5C5';
                e.target.style.background = '#1a1b1c';
                e.target.style.boxShadow = '0 0 0 2px rgba(197, 197, 197, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#333';
                e.target.style.background = '#161719';
                e.target.style.boxShadow = 'none';
              }}
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
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#C5C5C5';
                e.target.style.background = '#1a1b1c';
                e.target.style.boxShadow = '0 0 0 2px rgba(197, 197, 197, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#333';
                e.target.style.background = '#161719';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {error && <div style={styles.errorMessage}>{error}</div>}
          
          <button 
            type="submit" 
            style={{
              ...styles.loginButton,
              opacity: (loading || !username.trim() || !password.trim()) ? 0.5 : 1,
              cursor: (loading || !username.trim() || !password.trim()) ? 'not-allowed' : 'pointer',
            }}
            disabled={loading || !username.trim() || !password.trim()}
            onMouseEnter={(e) => {
              if (!loading && username.trim() && password.trim()) {
                e.currentTarget.style.background = '#d0d0d0';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && username.trim() && password.trim()) {
                e.currentTarget.style.background = '#C5C5C5';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
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
          <a href="https://www.instagram.com/movie_park/" target="_blank"
            rel="noopener noreferrer" aria-label="Instagram">
            <img 
              src={instagramIcon} 
              alt="Instagram" 
              style={styles.socialIcon}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            />
          </a>
          <a href="https://vimeo.com/movieparkco" target="_blank"
            rel="noopener noreferrer" aria-label="Vimeo">
            <img 
              src={vimeoIcon} 
              alt="Vimeo" 
              style={styles.socialIcon}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            />
          </a>
          <a href="mailto:hello@movieparkpro.com" target="_blank"
            rel="noopener noreferrer" aria-label="Email">
            <img 
              src={emailIcon} 
              alt="Email" 
              style={styles.socialIcon}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            />
          </a>
        </div>
      </footer>

      <style jsx>{`
        @media (max-width: 768px) {
          .login-box {
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
          .login-box {
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
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .error-message {
          animation: fadeIn 0.3s ease-in !important;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;