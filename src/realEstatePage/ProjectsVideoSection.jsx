import React, { useState, useRef, useEffect } from 'react';
import './ProjectsVideoSection.css';

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

// Данные для видео с поддержкой мобильных изображений ТОЛЬКО для указанных видео
const videoData = [
  {
    id: 1,
    title: "BRUNELLO",
    description: "WE COMBINE FILM AND REAL ESTATE ADVERTISING. REAL ESTATE IS SOLD THROUGH EMOTION, THROUGH STORYTELLING, AND THROUGH THE EXPERIENCE OF BEING IN IT.",
    vimeoId: "1135673984",
    previewImage: "/projectImage/BRUNELLO.png",
    mobilePreviewImage: "/projectImage/mobileImage/BRUNELLO_mob.png",
    mobileBreakpoint: 450,
    category: "VIDEO | 3D",
  },
  {
    id: 2,
    title: "VILLA DEL GAVI",
    description: "WE CREATED AN EMOTIONAL SALES VIDEO THAT SHOWCASES THE CONCEPT OF THE HOUSE. THE STORY AND CHARACTER OF THE HOUSE WERE CREATED. 3D RENDERINGS.",
    vimeoId: "1083958501",
    previewImage: "/projectImage/VILLA DEL GAVI.png",
    mobilePreviewImage: "/projectImage/mobileImage/VILLA DEL GAVI_mob.png",
    mobileBreakpoint: 450,
    category: "VIDEO | 3D", 
  },
  {
    id: 3,
    title: "EYWA WAY OF WATER",
    description: "THEY CREATED A MAGICAL WORLD IN WHICH THE MAIN CHARACTERS ARE A FATHER AND SON.",
    vimeoId: "1135702706",
    previewImage: "/projectImage/EYWA WAY OF WATER.png",
    mobilePreviewImage: "/projectImage/mobileImage/EYWA WAY OF WATER_mob.png",
    mobileBreakpoint: 450,
    category: "VIDEO | 3D",
  },
  {
    id: 4,
    title: "ELITE MERIT",
    description: "WE MAKE VIDEOS AND MARKETING THAT NO ONE ELSE DOES.",
    vimeoId: "1102229342",
    previewImage: "/projectImage/ELITE MERIT.png",
    mobilePreviewImage: "/projectImage/mobileImage/ELITE MERIT_mob.png",
    mobileBreakpoint: 450,
    category: "VIDEO | 3D",
  },
  {
    id: 5,
    title: "INTERSTELLAR",
    description: "WE COMBINED FILMING IN A STUDIO AND 3D GRAPHICS TO CONVEY THE FUTURE HOME AND ITS PHILOSOPHY AS ACCURATELY AS POSSIBLE.",
    vimeoId: "1021703237",
    previewImage: "/projectImage/Interstellar.png",
    mobilePreviewImage: "/projectImage/mobileImage/Interstellar_mob.png",
    mobileBreakpoint: 450,
    category: "VIDEO | 3D",
  },
  {
    id: 6,
    title: "VILLA DEL DIVOS",
    description: "PARTICULAR ATTENTION IS PAID TO THE PHILOSOPHY BEHIND THE PROJECT AND ITS KEY ADVANTAGES: AN ATMOSPHERE OF COMFORT, AESTHETICS, AND SERVICE.",
    vimeoId: "1055145071",
    previewImage: "/projectImage/Villa del Divos.png",
    mobilePreviewImage: "/projectImage/mobileImage/Villa del Divos_mob.png",
    mobileBreakpoint: 450,
    category: "VIDEO | 3D",
  },
  {
    id: 7,
    title: "MR.EIGHT | BRAND VIDEO",
    description: "«FOLLOW YOUR DREAM WHATEVER IT TAKES» - THIS THESIS REFLECTS THE COMPANY'S DETERMINATION AND UNWAVERING COMMITMENT TO WHICH IT MOVES FORWARD IN THE IMPLEMENTATION OF ITS PROJECTS.",
    vimeoId: "1055261671",
    previewImage: "/projectImage/Mr.Eight  Brand video.png",
    mobilePreviewImage: "/projectImage/mobileImage/Mr.Eight  Brand video_mob.png",
    mobileBreakpoint: 450,
    category: "VIDEO | 3D",
  },
  {
    id: 8,
    title: "LAUNCH OF THE VILLA DEL GAVI",
    description: "1400 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN HOLLYWOOD STARS OSCAR WINNER ADRIEN BRODY",
    vimeoId: "1099296047",
    previewImage: "/projectImage/Launch of the Villa del Gavi.png",
    mobilePreviewImage: "/projectImage/mobileImage/Launch of the Villa del Gavi_mob.png",
    mobileBreakpoint: 450,
    category: "EVENTS | LAUNCHES",
  },
  {
    id: 9,
    title: "LAUNCH OF THE EYWA",
    description: "700 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN CONTENT",
    vimeoId: "1148259441",
    previewImage: "/projectImage/Launch of the EYWA.png",
    mobilePreviewImage: "/projectImage/mobileImage/Launch of the EYWA_mob.png",
    mobileBreakpoint: 450,
    category: "EVENTS | LAUNCHES",
  },
  {
    id: 10,
    title: "LAUNCH OF THE DIVOS",
    description: "900 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN CONTENT",
    vimeoId: "1060106406",
    previewImage: "/projectImage/Launch of the DIVOS.png",
    mobilePreviewImage: "/projectImage/mobileImage/Launch of the DIVOS_mob.png",
    mobileBreakpoint: 450,
    category: "EVENTS | LAUNCHES",
  },
  {
    id: 11,
    title: "PR OF THE VILLA DEL GAVI",
    description: "PR CAMPAIGN WITH BRAND AMBASSADORS MR. THANK YOU & MR.GOODLUCK. A SERIES OF 98 REELS WAS PRODUCED, REACHING 195,000,000 VIEWS. AND 127 STORIES WERE PRODUCED, REACHING 48,500,000 VIEWS.",
    vimeoId: "1060106406",
    previewImage: "/projectImage/PR of the Villa del Gavi.png",
    mobilePreviewImage: "/projectImage/mobileImage/PR of the Villa del Gavi_mob.png",
    mobileBreakpoint: 450,
    category: "HYPE CAMPAIGN",
  },
  {
    id: 12,
    title: "CELEBRITY APPEARANCES",
    description: "WE CAN BRING ANY STAR FOR YOU. MATTHEW MCCONAUGHEY, ADRIAN BRODY, NICOLAS CAGE, MILA JOVOVICH, VINCENT CASSEL, ZENDAYA, QUENTIN TARANTINO, KEANU REEVES, JASON MAMOA AND OTHERS.",
    vimeoId: "1060106406",
    previewImage: "/projectImage/Celebrity Appearances.png",
    mobilePreviewImage: "/projectImage/mobileImage/Celebrity Appearances_mob.png",
    mobileBreakpoint: 450,
    category: "CELEBRITY APPEARANCES",
  }
];

const ProjectsVideoSection = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [imageLoadError, setImageLoadError] = useState({});
  const [cursorHidden, setCursorHidden] = useState(false);
  
  const videoRefs = useRef({});
  const popupTimeoutRef = useRef(null);

  // Отслеживаем изменение ширины окна
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width <= 768);
    };
    
    // Инициализируем начальное значение
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Функция для определения, нужно ли использовать мобильное изображение
  const shouldUseMobileImage = (video) => {
    if (!video.mobilePreviewImage) return false;
    
    // Если задан конкретный breakpoint, используем его
    if (video.mobileBreakpoint) {
      return windowWidth <= video.mobileBreakpoint;
    }
    
    // Иначе используем общее правило для мобильных
    return isMobile;
  };

  // Открытие попапа с Vimeo видео
  const openVideoPopup = (video) => {
    // Для блоков без кнопки (id 11 и 12) не открываем попап
    if (video.id === 11 || video.id === 12) {
      return;
    }
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
  };

  // Уход с карточки видео (только для десктопа)
  const handleMouseLeave = (videoId) => {
    if (isMobile) return;
    setHoveredCard(null);
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = (videoId, imageType) => {
    setImageLoadError(prev => ({
      ...prev,
      [`${videoId}_${imageType}`]: true
    }));
  };

  // Обработчик движения мыши в попапе
  const handlePopupMouseMove = () => {
    if (cursorHidden) {
      setCursorHidden(false);
    }
  };

  // Функция для определения, нужно ли показывать кнопку для данного видео
  const shouldShowWatchButton = (videoId) => {
    // Для блоков с ID 11 и 12 не показываем кнопку
    return videoId !== 11 && videoId !== 12;
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
          {filteredVideos.map(video => {
            const useMobileImage = shouldUseMobileImage(video);
            const imageUrl = useMobileImage ? video.mobilePreviewImage : video.previewImage;
            const imageType = useMobileImage ? 'mobile' : 'desktop';
            const imageErrorKey = `${video.id}_${imageType}`;
            const isImageError = imageLoadError[imageErrorKey];
            
            return (
              <div
                key={video.id}
                className={`video-card ${useMobileImage ? 'mobile-image-mode' : ''}`}
                onClick={() => openVideoPopup(video)}
                onMouseEnter={() => handleMouseEnter(video.id)}
                onMouseLeave={() => handleMouseLeave(video.id)}
              >
                {/* Превью изображение */}
                <div className="preview-image-container">
                  {!isImageError ? (
                    <img
                      src={imageUrl}
                      alt={video.title}
                      className={`preview-image ${useMobileImage ? 'mobile-image' : ''}`}
                      onError={() => handleImageError(video.id, imageType)}
                    />
                  ) : (
                    <div className="image-error-placeholder">
                      <span>{video.title}</span>
                    </div>
                  )}
                </div>
                
                <div className="video-overlay">
                  <div className="video-content">
                    <h2 className="video-title">{video.title}</h2>
                    <p className="video-description">{video.description}</p>
                    {/* Убираем кнопку для блоков 11 и 12 */}
                    {shouldShowWatchButton(video.id) && (
                      <button
                        className="watch-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openVideoPopup(video);
                        }}
                      >
                        WATCH VIDEO
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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