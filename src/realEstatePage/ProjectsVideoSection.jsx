import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import './ProjectsVideoSection.css';

const desktopMainCategories = [
  "VIDEO | 3D",
  "EVENTS | LAUNCHES", 
  "HYPE CAMPAIGN",
  "CELEBRITY APPEARANCES",
];

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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [imageLoadError, setImageLoadError] = useState({});
  const [cursorHidden, setCursorHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const videoRefs = useRef({});
  const popupTimeoutRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  // Мемоизированные обработчики
  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(prev => prev === category ? null : category);
  }, []);

  const shouldUseMobileImage = useCallback((video) => {
    if (!video.mobilePreviewImage) return false;
    
    if (video.mobileBreakpoint) {
      return windowWidth <= video.mobileBreakpoint;
    }
    
    return isMobile;
  }, [windowWidth, isMobile]);

  const shouldShowWatchButton = useCallback((videoId) => {
    return videoId !== 11 && videoId !== 2;
  }, []);

  // Оптимизированная загрузка данных
  const loadVideoData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('realestate_videos')
        .select('*')
        .order('id', { ascending: true });

      if (supabaseError) throw supabaseError;

      // Минимизируем преобразования данных
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
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Мемоизированное значение filteredVideos
  const filteredVideos = useMemo(() => {
    return selectedCategory 
      ? videoData.filter(video => video.category === selectedCategory)
      : videoData;
  }, [videoData, selectedCategory]);

  // Открытие попапа
  const openVideoPopup = useCallback((video) => {
    if (video.id === 11 || video.id === 2) return;
    
    setSelectedVideo(video);
    setIsPopupOpen(true);
    setCursorHidden(true);
    document.body.style.overflow = 'hidden';
    
    // Пауза всех видео
    Object.values(videoRefs.current).forEach(videoElement => {
      if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    });
    
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
    
    popupTimeoutRef.current = setTimeout(() => {
      setCursorHidden(false);
    }, 2000);
  }, []);

  // Закрытие попапа
  const closeVideoPopup = useCallback(() => {
    popupTimeoutRef.current && clearTimeout(popupTimeoutRef.current);
    
    setIsPopupOpen(false);
    setSelectedVideo(null);
    setCursorHidden(false);
    document.body.style.overflow = 'auto';
  }, []);

  // Оптимизированный обработчик ресайза
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width <= 768);
    }, 100); // Дебаунс 100мс
  }, []);

  // Основные эффекты
  useEffect(() => {
    loadVideoData();
    return () => {
      popupTimeoutRef.current && clearTimeout(popupTimeoutRef.current);
      resizeTimeoutRef.current && clearTimeout(resizeTimeoutRef.current);
    };
  }, [loadVideoData]);

  useEffect(() => {
    handleResize(); // Инициализация
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Обработчики событий
  const handleMouseEnter = useCallback((videoId) => {
    if (!isMobile) setHoveredCard(videoId);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) setHoveredCard(null);
  }, [isMobile]);

  const handleImageError = useCallback((videoId, imageType) => {
    setImageLoadError(prev => ({
      ...prev,
      [`${videoId}_${imageType}`]: true
    }));
  }, []);

  const handlePopupMouseMove = useCallback(() => {
    if (cursorHidden) setCursorHidden(false);
  }, [cursorHidden]);

  // Компоненты состояний
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
        {isMobile && <div className="mobile-section-divider-top"></div>}
        
        <div className="projects-header">
          <h1>ALL PROJECTS</h1>
          
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

        <div className="video-grid">
          {filteredVideos.map(video => {
            const useMobileImage = shouldUseMobileImage(video);
            const imageUrl = useMobileImage ? video.mobilePreviewImage : video.previewImage;
            const imageType = useMobileImage ? 'mobile' : 'desktop';
            const imageErrorKey = `${video.id}_${imageType}`;
            const isImageError = imageLoadError[imageErrorKey];
            const showWatchButton = shouldShowWatchButton(video.id);
            
            return (
              <div
                key={video.id}
                className={`video-card ${useMobileImage ? 'mobile-image-mode' : ''}`}
                onClick={() => openVideoPopup(video)}
                onMouseEnter={() => handleMouseEnter(video.id)}
                onMouseLeave={handleMouseLeave}
              >
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
                    {showWatchButton && (
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
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProjectsVideoSection);