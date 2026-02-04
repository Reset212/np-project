import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import logoImg from "../image/logo.png";
import instagramIcon from "../image/instagram-icon.svg";
import emailIcon from "../image/email-icon.svg";
import vimeoIcon from "../image/vimeo-icon.svg";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('new-project');
  
  // Определяем активную вкладку на основе пути
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('our-projects')) {
      setActiveTab('our-projects');
    } else {
      setActiveTab('new-project');
    }
  }, [location]);

  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      navigate(`/admin/${tab}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_timestamp');
    navigate('/admin/login');
  };

  // Стили в виде объекта
  const styles = {
    adminLayout: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#161719',
      color: 'white',
    },
    
    adminHeader: {
      background: '#161719',
      padding: '20px 30px 0 30px',
    },
    
    adminLogoCenter: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '20px',
      position: 'relative',
    },
    
    logo: {
      // marginBottom: '15px',
    },
    
    logoImage: {
      height: '80px',
      width: 'auto',
    },
    
    logoutButton: {
      position: 'absolute',
      right: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      padding: '8px 20px',
      background: 'transparent',
      color: 'white',
      border: '1px solid #333',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s',
    },
    
    logoutButtonHover: {
      borderColor: '#C5C5C5',
      background: 'rgba(197, 197, 197, 0.1)',
    },
    
    adminTitle: {
      marginTop: '10px',
    },
    
    adminTitleH1: {
      fontSize: '64px',
      fontWeight: '600',
      letterSpacing: '1px',
    },
    
    adminTabs: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      padding: '0',
    },
    
    tabButton: {
      width: '177px',
      height: '60px',
      padding: '0',
      background: '#00000000',
      border: '1px solid #333',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      borderRadius: '32px',
      margin: '0',
    },
    
    tabButtonHover: {
      background: '#00000000',
      borderColor: '#c5c5c542',
    },
    
    tabButtonActive: {
      background: '#c5c5c531',
      color: '#ffffff',
      borderColor: '#c5c5c500',
    },
    
    adminMain: {
      flex: '1',
      padding: '30px',
      width: '100%',
    },
    
    adminFooter: {
      background: '#07070700',
      borderTop: '1px solid #333',
      padding: '20px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
    footerLeft: {
      color: '#e7e7e7',
      fontSize: '14px',
    },
    
    footerSocial: {
      display: 'flex',
      gap: '20px',
      color: '#e7e7e7',
      alignItems: 'center',
    },
    
    socialIcon: {
      width: '20px',
      height: '20px',
      color: '#c7c7c7',
      filter: 'invert(1)',
      transition: 'filter 0.3s',
    },
    
    socialIconHover: {
      filter: 'brightness(1)',
    },
    
    // Медиа-запросы
    '@media (max-width: 768px)': {
      adminHeader: {
        padding: '15px 20px 0 20px',
      },
      
      adminMain: {
        padding: '20px',
      },
      
      tabButton: {
        width: '140px',
        height: '50px',
        fontSize: '12px',
      },
      
      adminFooter: {
        padding: '15px 20px',
        flexDirection: 'column',
        gap: '15px',
        textAlign: 'center',
      },
      
      logoutButton: {
        position: 'relative',
        top: '0',
        right: '0',
        transform: 'none',
        marginTop: '10px',
      },
    },
  };

  // Функция для обработки hover эффектов
  const handleMouseEnter = (e) => {
    if (e.target.className.includes('logout-button')) {
      e.target.style.borderColor = styles.logoutButtonHover.borderColor;
      e.target.style.background = styles.logoutButtonHover.background;
    } else if (e.target.className.includes('tab-button')) {
      if (!e.target.className.includes('active')) {
        e.target.style.background = styles.tabButtonHover.background;
        e.target.style.borderColor = styles.tabButtonHover.borderColor;
      }
    } else if (e.target.tagName === 'IMG' && e.target.parentElement.className.includes('footer-social')) {
      e.target.style.filter = styles.socialIconHover.filter;
    }
  };

  const handleMouseLeave = (e) => {
    if (e.target.className.includes('logout-button')) {
      e.target.style.borderColor = styles.logoutButton.border;
      e.target.style.background = styles.logoutButton.background;
    } else if (e.target.className.includes('tab-button')) {
      if (!e.target.className.includes('active')) {
        e.target.style.background = styles.tabButton.background;
        e.target.style.borderColor = styles.tabButton.border;
      }
    } else if (e.target.tagName === 'IMG' && e.target.parentElement.className.includes('footer-social')) {
      e.target.style.filter = styles.socialIcon.filter;
    }
  };

  return (
    <div style={styles.adminLayout}>
      {/* Шапка */}
      <header style={styles.adminHeader}>
        {/* Лого сверху по центру */}
        <div style={styles.adminLogoCenter}>
          <div style={styles.logo}>
            <Link to="/home">
              <img src={logoImg} alt="Logo" style={styles.logoImage} />
            </Link>
          </div>
          <button 
            onClick={handleLogout} 
            style={styles.logoutButton}
            className="logout-button"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            Выйти
          </button>
          <div style={styles.adminTitle}>
            <h1 style={styles.adminTitleH1}>ADMIN PANEL</h1>
          </div>
        </div>
        
        {/* Кнопки табов */}
        <div style={styles.adminTabs}>
          <button 
            style={{
              ...styles.tabButton,
              ...(activeTab === 'new-project' ? styles.tabButtonActive : {})
            }}
            onClick={() => handleTabChange('new-project')}
            className={`tab-button ${activeTab === 'new-project' ? 'active' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            NEW PROJECT
          </button>
          <button 
            style={{
              ...styles.tabButton,
              ...(activeTab === 'our-projects' ? styles.tabButtonActive : {})
            }}
            onClick={() => handleTabChange('our-projects')}
            className={`tab-button ${activeTab === 'our-projects' ? 'active' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            OUR PROJECTS
          </button>
        </div>
      </header>

      {/* Основной контент */}
      <main style={styles.adminMain}>
        <Outlet />
      </main>

      {/* Футер */}
      <footer style={styles.adminFooter}>
        <div style={styles.footerLeft}>
          <span>© 2025 MOVIE PARK</span>
        </div>
        <div style={styles.footerSocial} className="footer-social">
          <a href="https://www.instagram.com/movie_park/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <img 
              src={instagramIcon} 
              alt="Instagram" 
              style={styles.socialIcon}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </a>
          <a href="https://vimeo.com/movieparkco" target="_blank" rel="noopener noreferrer" aria-label="Vimeo">
            <img 
              src={vimeoIcon} 
              alt="Vimeo" 
              style={styles.socialIcon}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </a>
          <a href="mailto:hello@movieparkpro.com" target="_blank" rel="noopener noreferrer" aria-label="Email">
            <img 
              src={emailIcon} 
              alt="Email" 
              style={styles.socialIcon}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;