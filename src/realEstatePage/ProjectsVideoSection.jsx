import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
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

const ProjectsVideoSection = () => {
  const [videoData, setVideoData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [imageLoadError, setImageLoadError] = useState({});
  const [cursorHidden, setCursorHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const videoRefs = useRef({});
  const popupTimeoutRef = useRef(null);

  // Загрузка данных из Supabase при монтировании
  useEffect(() => {
    loadVideoData();
    
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Функция загрузки данных из Supabase
  const loadVideoData = async () => {
    try {
      setLoading(true);
      // console.log('Загружаю данные из таблицы realestate_videos...');
      
      const { data, error: supabaseError } = await supabase
        .from('realestate_videos')
        .select('*')
        .order('id', { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      // Преобразуем данные в нужный формат
      const formattedData = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        vimeoId: item.vimeo_id,
        previewImage: item.preview_image,
        mobilePreviewImage: item.mobile_preview_image,
        mobileBreakpoint: item.mobile_breakpoint || 450,
        category: item.category,
      }));

      setVideoData(formattedData);
      // console.log(`Загружено ${formattedData.length} видео`);
      
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    // Для блоков без кнопки (id 11 и 2) не открываем попап
    if (video.id === 11 || video.id === 2) {
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
    // Для блоков с ID 11 и 2 не показываем кнопку
    return videoId !== 11 && videoId !== 2;
  };

  // Показываем состояние загрузки
  if (loading) {
    return (
      <div className="projects-video-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку если есть
  if (error) {
    return (
      <div className="projects-video-section">
        <div className="error-container">
          <p>Error loading videos: {error}</p>
          <button onClick={loadVideoData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                      loading="lazy"
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
                    {/* Убираем кнопку для блоков 11 и 2 */}
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