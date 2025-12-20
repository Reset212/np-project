import React, { useState, useRef, useEffect } from 'react';
import './ProjectsVideoSection.css';

// Заглушка для видео (используется для самого видео)
import VideoPlaceholder from '../video/hero-video.mp4';

// Главные категории для десктопа
const desktopMainCategories = [
  "VIDEO | 3D",
  "EVENTS | LAUNCHES", 
  "HYPE CAMPAIGN",
  "CELEBRITY APPEARANCES",
];

// Главные категории для мобильной версии
const mobileMainCategories = [
  "VIDEO | 3D",
  "EVENTS | LAUNCHES",
  "HYPE CAMPAIGN", 
  "CELEBRITY APPEARANCES",
];

// Данные для видео с обновленной категоризацией и Vimeo ID
const videoData = [
  {
    id: 1,
    title: "BRUNELLO",
    description: "WE COMBINE FILM AND REAL ESTATE ADVERTISING. REAL ESTATE IS SOLD THROUGH EMOTION, THROUGH STORYTELLING, AND THROUGH THE EXPERIENCE OF BEING IN IT.",
    vimeoId: "1135673984", // brunello
    previewImage: "/projectImage/BRUNELLO.png",
    category: "VIDEO | 3D",
  },
  {
    id: 2,
    title: "VILLA DEL GAVI",
    description: "WE CREATED AN EMOTIONAL SALES VIDEO THAT SHOWCASES THE CONCEPT OF THE HOUSE. THE STORY AND CHARACTER OF THE HOUSE WERE CREATED. 3D RENDERINGS.",
    vimeoId: "1083958501", // villa del gavi
    previewImage: "/projectImage/VILLA DEL GAVI.png",
    category: "VIDEO | 3D", 
  },
  {
    id: 3,
    title: "EYWA WAY OF WATER",
    description: "THEY CREATED A MAGICAL WORLD IN WHICH THE MAIN CHARACTERS ARE A FATHER AND SON.",
    vimeoId: "1135702706", // eywa
    previewImage: "/projectImage/EYWA WAY OF WATER.png",
    category: "VIDEO | 3D",
  },
  {
    id: 4,
    title: "ELITE MERIT",
    description: "WE MAKE VIDEOS AND MARKETING THAT NO ONE ELSE DOES.",
    vimeoId: "1102229342", // elit merit
    previewImage: "/projectImage/ELITE MERIT.png",
    category: "VIDEO | 3D",
  },
  {
    id: 5,
    title: "INTERSTELLAR",
    description: "WE COMBINED FILMING IN A STUDIO AND 3D GRAPHICS TO CONVEY THE FUTURE HOME AND ITS PHILOSOPHY AS ACCURATELY AS POSSIBLE.",
    vimeoId: "1021703237", // interstellar
    previewImage: "/projectImage/Interstellar.png",
    category: "VIDEO | 3D",
  },
  {
    id: 6,
    title: "VILLA DEL DIVOS",
    description: "PARTICULAR ATTENTION IS PAID TO THE PHILOSOPHY BEHIND THE PROJECT AND ITS KEY ADVANTAGES: AN ATMOSPHERE OF COMFORT, AESTHETICS, AND SERVICE.",
    vimeoId: "1055145071", // Divos
    previewImage: "/projectImage/Villa del Divos.png",
    category: "VIDEO | 3D",
  },
  {
    id: 7,
    title: "MR.EIGHT | BRAND VIDEO",
    description: "«FOLLOW YOUR DREAM WHATEVER IT TAKES» - THIS THESIS REFLECTS THE COMPANY'S DETERMINATION AND UNWAVERING COMMITMENT TO WHICH IT MOVES FORWARD IN THE IMPLEMENTATION OF ITS PROJECTS.",
    vimeoId: "1055261671", // mr.eight | brand video
    previewImage: "/projectImage/Mr.Eight  Brand video.png",
    category: "VIDEO | 3D",
  },
  {
    id: 8,
    title: "LAUNCH OF THE VILLA DEL GAVI",
    description: "1400 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN HOLLYWOOD STARS OSCAR WINNER ADRIEN BRODY",
    vimeoId: "1060106406", // launch villa del gavi
    previewImage: "/projectImage/Launch of the Villa del Gavi.png",
    category: "EVENTS | LAUNCHES",
  },
  {
    id: 9,
    title: "LAUNCH OF THE EYWA",
    description: "700 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN CONTENT",
    vimeoId: "1148259441", // launch eywa
    previewImage: "/projectImage/Launch of the EYWA.png",
    category: "EVENTS | LAUNCHES",
  },
  {
    id: 10,
    title: "LAUNCH OF THE DIVOS",
    description: "900 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN CONTENT",
    vimeoId: "1060106406", // временный, нужно добавить правильный ID для launch divos
    previewImage: "/projectImage/Launch of the DIVOS.png",
    category: "EVENTS | LAUNCHES",
  },
  {
    id: 11,
    title: "PR OF THE VILLA DEL GAVI",
    description: "PR CAMPAIGN WITH BRAND AMBASSADORS MR. THANK YOU & MR.GOODLUCK. A SERIES OF 98 REELS WAS PRODUCED, REACHING 195,000,000 VIEWS. AND 127 STORIES WERE PRODUCED, REACHING 48,500,000 VIEWS.",
    vimeoId: "1060106406", // временный, нужно добавить правильный ID
    previewImage: "/projectImage/PR of the Villa del Gavi.png",
    category: "HYPE CAMPAIGN",
  },
  {
    id: 12,
    title: "CELEBRITY APPEARANCES",
    description: "WE CAN BRING ANY STAR FOR YOU. MATTHEW MCCONAUGHEY, ADRIAN BRODY, NICOLAS CAGE, MILA JOVOVICH, VINCENT CASSEL, ZENDAYA, QUENTIN TARANTINO, KEANU REEVES, JASON MAMOA AND OTHERS.",
    vimeoId: "1060106406", // временный, нужно добавить правильный ID
    previewImage: "/projectImage/Celebrity Appearances.png",
    category: "CELEBRITY APPEARANCES",
  }
];

const ProjectsVideoSection = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoadError, setImageLoadError] = useState({});
  const [cursorHidden, setCursorHidden] = useState(false);
  
  const videoRefs = useRef({});
  const popupTimeoutRef = useRef(null);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  // Фильтрация видео
  const filteredVideos = selectedCategory 
    ? videoData.filter(video => video.category === selectedCategory)
    : videoData;

  // Обработчик выбора категории
  const handleCategoryClick = (category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  // Открытие попапа с Vimeo видео
  const openVideoPopup = (video) => {
    setSelectedVideo(video);
    setIsPopupOpen(true);
    setCursorHidden(true);
    document.body.style.overflow = 'hidden';
    
    // Останавливаем все локальные видео на карточках
    Object.values(videoRefs.current).forEach(videoElement => {
      if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    });
    
    // Показываем курсор через 2 секунды
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
    
    popupTimeoutRef.current = setTimeout(() => {
      setCursorHidden(false);
    }, 2000);
  };

  // Закрытие попапа
  const closeVideoPopup = () => {
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
    
    setIsPopupOpen(false);
    setSelectedVideo(null);
    setCursorHidden(false);
    document.body.style.overflow = 'auto';
  };

  // Наведение на карточку видео (только для десктопа)
  const handleMouseEnter = (videoId) => {
    if (isMobile) return;
    setHoveredCard(videoId);
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.muted = true;
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name !== 'AbortError') {
            console.log('Автовоспроизведение при наведении заблокировано');
          }
        });
      }
    }
  };

  // Уход с карточки видео (только для десктопа)
  const handleMouseLeave = (videoId) => {
    if (isMobile) return;
    setHoveredCard(null);
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = (videoId) => {
    setImageLoadError(prev => ({
      ...prev,
      [videoId]: true
    }));
  };

  // Обработчик движения мыши в попапе
  const handlePopupMouseMove = () => {
    if (cursorHidden) {
      setCursorHidden(false);
    }
  };

  return (
    <div className="projects-video-section">
      <div className="projects-video-container">
        {/* Разделительная черта (только для мобильной версии, над ALL PROJECTS) */}
        {isMobile && <div className="mobile-section-divider-top"></div>}
        
        <div className="projects-header">
          <h1>ALL PROJECTS</h1>
          
          {/* Десктопная фильтрация - ПОД чертой */}
          {!isMobile && (
            <>
              <div className="section-divider"></div>
              <div className="desktop-categories-below">
                {desktopMainCategories.map(category => (
                  <button
                    key={category}
                    className={`desktop-category-btn ${
                      selectedCategory === category ? 'active' : ''
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Мобильная фильтрация - ПОД ALL PROJECTS */}
        {isMobile && (
          <div className="mobile-category-filter">
            <div className="mobile-main-categories">
              {mobileMainCategories.map(category => (
                <div key={category} className="mobile-category-item">
                  <div
                    className={`mobile-category-text ${
                      selectedCategory === category ? 'active' : ''
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Сетка видео карточек */}
        <div className="video-grid">
          {filteredVideos.map(video => (
            <div
              key={video.id}
              className="video-card"
              onClick={() => openVideoPopup(video)}
              onMouseEnter={() => handleMouseEnter(video.id)}
              onMouseLeave={() => handleMouseLeave(video.id)}
            >
              {/* Превью изображение (постоянно видимое) */}
              <div className="preview-image-container">
                {!imageLoadError[video.id] ? (
                  <img
                    src={video.previewImage}
                    alt={video.title}
                    className="preview-image"
                    onError={() => handleImageError(video.id)}
                  />
                ) : (
                  <div className="image-error-placeholder">
                    <span>{video.title}</span>
                  </div>
                )}
              </div>
              
              {/* Видео (воспроизводится только при наведении на десктопе) */}
              <video
                ref={el => videoRefs.current[video.id] = el}
                className="project-video-background"
                muted
                loop
                playsInline
                preload="metadata"
                onError={(e) => {
                  console.error(`Ошибка загрузки видео ${video.title}:`, e);
                }}
              >
                <source src={VideoPlaceholder} type="video/mp4" />
                Ваш браузер не поддерживает видео тег.
              </video>
              <div className="video-overlay">
                <div className="video-content">
                  <h2 className="video-title">{video.title}</h2>
                  <p className="video-description">{video.description}</p>
                  <button
                    className="watch-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openVideoPopup(video);
                    }}
                  >
                    WATCH VIDEO
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Попап с Vimeo видео */}
      {isPopupOpen && selectedVideo && (
        <div 
          className={`video-popup-overlay ${cursorHidden ? 'cursor-hidden' : ''}`} 
          onClick={closeVideoPopup}
          onMouseMove={handlePopupMouseMove}
        >
          <div className="video-popup vimeo-popup" onClick={e => e.stopPropagation()}>
       
            
            <div className="popup-content">
              <div className="popup-video-container vimeo-container">
                <iframe
                  src={`https://player.vimeo.com/video/${selectedVideo.vimeoId}?autoplay=1&title=0&byline=0&portrait=0&badge=0&autopause=0`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  allowFullScreen
                  title={selectedVideo.title}
                ></iframe>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsVideoSection;