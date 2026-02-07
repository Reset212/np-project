import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import './ProjectsVideoSection.css';

// Заглушка для видео превью
import VideoPlaceholder from '../video/hero-video.mp4';

// Главные категории для десктопа
const desktopMainCategories = [
  "VIDEO",
  "HYPE & MARKETING", 
  "EVENTS & LAUNCHES",
  "3D",
];

// Главные категории для мобильной версии
const mobileMainCategories = [
  "VIDEO",
  "HYPE & MARKETING",
  "EVENTS & LAUNCHES", 
  "3D",
];

// Подкатегории
const mainCategoryToSubcategories = {
  "VIDEO": ["Real Estate development", "Beauty", "Commercial", "Betting"],
  "HYPE & MARKETING": ["Real Estate development", "Beauty", "Commercial", "Betting"],
  "EVENTS & LAUNCHES": ["Real Estate development", "Beauty", "Commercial", "Betting"],
  "3D": ["Real Estate development", "Beauty", "Commercial", "Betting"]
};

// Мемоизированные константы
const DESKTOP_CATEGORIES = Object.freeze(desktopMainCategories);
const MOBILE_CATEGORIES = Object.freeze(mobileMainCategories);
const SUBCATEGORIES_MAP = Object.freeze(mainCategoryToSubcategories);

const ProjectsVideoSection = () => {
  // Состояния для данных
  const [videoData, setVideoData] = useState([]);
  const [hasData, setHasData] = useState(false);
  
  // Существующие состояния
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [imageLoadError, setImageLoadError] = useState({});
  const [cursorHidden, setCursorHidden] = useState(false);
  
  // Состояния для анимации подкатегорий
  const [desktopSubcategoriesOpen, setDesktopSubcategoriesOpen] = useState(false);
  const [desktopAnimationState, setDesktopAnimationState] = useState('closed');
  
  // Состояния для мобильной версии
  const [openCategory, setOpenCategory] = useState(null);
  const [mobileAnimationState, setMobileAnimationState] = useState('closed');
  const [mobileSubcategoriesVisible, setMobileSubcategoriesVisible] = useState(false);

  const videoRefs = useRef({});
  const popupTimeoutRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  // Мемоизированные обработчики
  const shouldShowWatchButton = useCallback((videoId) => {
    return videoId !== 11 && videoId !== 2;
  }, []);

  const shouldUseMobileImage = useCallback((video) => {
    if (!video.mobilePreviewImage) return false;
    
    if (video.mobileBreakpoint) {
      return windowWidth <= video.mobileBreakpoint;
    }
    
    return isMobile;
  }, [windowWidth, isMobile]);

  // Оптимизированная загрузка данных
  const loadVideoData = useCallback(async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('projects_videos')
        .select('*')
        .order('id', { ascending: true });

      if (supabaseError) {
        console.error('❌ Ошибка Supabase:', supabaseError);
        return;
      }

      // Более эффективное преобразование данных
      const formattedData = (data || []).map(item => {
        const desktopMainCategoriesArray = Array.isArray(item.desktop_main_categories) 
          ? item.desktop_main_categories 
          : (item.desktop_main_category ? [item.desktop_main_category] : []);
        
        const desktopSubCategoriesArray = Array.isArray(item.desktop_sub_categories)
          ? item.desktop_sub_categories
          : (item.desktop_sub_category ? [item.desktop_sub_category] : []);
        
        // Оптимизированное создание пар категорий
        const maxLength = Math.max(desktopMainCategoriesArray.length, desktopSubCategoriesArray.length);
        const categoryPairs = [];
        
        for (let i = 0; i < maxLength; i++) {
          categoryPairs.push({
            main: desktopMainCategoriesArray[i] || desktopMainCategoriesArray[0] || '',
            sub: desktopSubCategoriesArray[i] || desktopSubCategoriesArray[0] || ''
          });
        }
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          vimeoId: item.vimeo_id,
          previewImage: item.preview_image,
          mobilePreviewImage: item.mobile_preview_image,
          desktopMainCategory: desktopMainCategoriesArray[0] || '',
          desktopSubCategory: desktopSubCategoriesArray[0] || '',
          desktopMainCategoriesArray,
          desktopSubCategoriesArray,
          desktopCategoryPairs: categoryPairs,
          mobileCategories: Array.isArray(item.mobile_categories) ? item.mobile_categories : [],
          mobileBreakpoint: item.mobile_breakpoint || 450,
        };
      });

      setVideoData(formattedData);
      setHasData(true);
    } catch (err) {
      console.error('❌ Ошибка загрузки данных:', err);
    }
  }, []);

  // ЕДИНАЯ функция для получения отфильтрованных видео с мемоизацией
  const filteredVideos = useMemo(() => {
    if (!videoData || videoData.length === 0) {
      return [];
    }

    if (selectedMainCategory !== null || selectedSubCategory !== null) {
      return videoData.filter(video => {
        if (selectedSubCategory) {
          if (video.desktopCategoryPairs && video.desktopCategoryPairs.length > 0) {
            return video.desktopCategoryPairs.some(pair => 
              pair.main === selectedMainCategory && pair.sub === selectedSubCategory
            );
          }
          return video.desktopMainCategory === selectedMainCategory && 
                 video.desktopSubCategory === selectedSubCategory;
        } 
        else if (selectedMainCategory) {
          if (video.desktopMainCategoriesArray && video.desktopMainCategoriesArray.length > 0) {
            return video.desktopMainCategoriesArray.includes(selectedMainCategory);
          }
          return video.desktopMainCategory === selectedMainCategory;
        }
        return false;
      });
    }
    
    // Оптимизация для показа всех видео - удаляем дубликаты
    const uniqueVideos = [];
    const seenImages = new Set();
    
    for (const video of videoData) {
      if (!seenImages.has(video.previewImage)) {
        seenImages.add(video.previewImage);
        uniqueVideos.push(video);
      }
    }
    
    return uniqueVideos;
  }, [videoData, selectedMainCategory, selectedSubCategory]);

  // Оптимизированный обработчик ресайза с дебаунсом
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width <= 768);
    }, 150);
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
    const width = window.innerWidth;
    setWindowWidth(width);
    setIsMobile(width <= 768);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Обработчики анимации для десктопа
  const openDesktopSubcategories = useCallback(() => {
    setDesktopAnimationState('opening');
    setDesktopSubcategoriesOpen(true);
    
    requestAnimationFrame(() => {
      setDesktopAnimationState('open');
    });
  }, []);

  const closeDesktopSubcategories = useCallback((callback = null) => {
    setDesktopAnimationState('closing');
    
    setTimeout(() => {
      setDesktopAnimationState('closed');
      setDesktopSubcategoriesOpen(false);
      
      callback && callback();
    }, 300);
  }, []);

  const handleDesktopMainCategoryClick = useCallback((category) => {
    if (selectedMainCategory === category && desktopSubcategoriesOpen) {
      closeDesktopSubcategories();
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
    } 
    else {
      if (selectedMainCategory !== category) {
        closeDesktopSubcategories(() => {
          setSelectedMainCategory(category);
          setSelectedSubCategory(null);
          openDesktopSubcategories();
        });
      } else {
        openDesktopSubcategories();
      }
    }
  }, [selectedMainCategory, desktopSubcategoriesOpen, closeDesktopSubcategories, openDesktopSubcategories]);

  const handleDesktopSubCategoryClick = useCallback((subCategory) => {
    setSelectedSubCategory(prev => prev === subCategory ? null : subCategory);
  }, []);

  // Обработчики для мобильной версии
  const openMobileSubcategories = useCallback((category) => {
    setOpenCategory(category);
    setSelectedMainCategory(category);
    setSelectedSubCategory(null);
    
    requestAnimationFrame(() => {
      setMobileAnimationState('opening');
      setMobileSubcategoriesVisible(true);
      
      requestAnimationFrame(() => {
        setMobileAnimationState('open');
      });
    });
  }, []);

  const closeMobileSubcategories = useCallback((callback = null) => {
    setMobileAnimationState('closing');
    
    setTimeout(() => {
      setMobileAnimationState('closed');
      setOpenCategory(null);
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
      
      requestAnimationFrame(() => {
        setMobileSubcategoriesVisible(false);
        callback && callback();
      });
    }, 400);
  }, []);

  const handleMobileCategoryClick = useCallback((category) => {
    if (openCategory === category && mobileAnimationState === 'open') {
      closeMobileSubcategories();
    } 
    else if (openCategory && openCategory !== category) {
      closeMobileSubcategories(() => {
        setTimeout(() => {
          openMobileSubcategories(category);
        }, 50);
      });
    }
    else {
      openMobileSubcategories(category);
    }
  }, [openCategory, mobileAnimationState, closeMobileSubcategories, openMobileSubcategories]);

  const handleSubCategorySelect = useCallback((subCategory) => {
    setSelectedSubCategory(prev => prev === subCategory ? null : subCategory);
  }, []);

  const getSubcategoriesForCategory = useCallback((category) => {
    return SUBCATEGORIES_MAP[category] || [];
  }, []);

  // Обработчики видео
  const openVideoPopup = useCallback((video) => {
    if (video.id === 11 || video.id === 2) return;
    
    setSelectedVideo(video);
    setIsPopupOpen(true);
    setCursorHidden(true);
    document.body.style.overflow = 'hidden';
    
    // Используем forEach вместо Object.values
    Object.keys(videoRefs.current).forEach(key => {
      const videoElement = videoRefs.current[key];
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

  const closeVideoPopup = useCallback(() => {
    popupTimeoutRef.current && clearTimeout(popupTimeoutRef.current);
    
    setIsPopupOpen(false);
    setSelectedVideo(null);
    setCursorHidden(false);
    document.body.style.overflow = 'auto';
  }, []);

  const handleMouseEnter = useCallback((videoId) => {
    if (isMobile) return;
    setHoveredCard(videoId);
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.muted = true;
      const playPromise = videoElement.play();
      playPromise?.catch(error => {
        if (error.name !== 'AbortError') {
          // Автовоспроизведение заблокировано
        }
      });
    }
  }, [isMobile]);

  const handleMouseLeave = useCallback((videoId) => {
    if (isMobile) return;
    setHoveredCard(null);
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
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

  const clearFilters = useCallback(() => {
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
  }, []);

  // Показываем скелетон если данных нет
  if (!hasData && videoData.length === 0) {
    return (
      <div className="projects-video-section">
        <div className="projects-video-container">
          <div className="projects-header">
            <h1>ALL PROJECTS</h1>
            
            {!isMobile && (
              <div className="desktop-main-categories-above">
                {DESKTOP_CATEGORIES.map(category => (
                  <button
                    key={category}
                    className="desktop-category-btn-above"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
            
            <div className="section-divider"></div>
          </div>
          
          <div className="video-grid-skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="video-card-skeleton"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Мемоизированные рендер-функции для уменьшения вложенности
  const renderDesktopCategories = () => (
    <div className="desktop-main-categories-above">
      {DESKTOP_CATEGORIES.map(category => (
        <button
          key={category}
          className={`desktop-category-btn-above ${
            selectedMainCategory === category ? 'active' : ''
          }`}
          onClick={() => handleDesktopMainCategoryClick(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );

  const renderDesktopSubcategories = () => (
    <div className="desktop-subcategories-below">
      {selectedMainCategory && (
        <div className={`desktop-subcategories-below-inner ${desktopAnimationState}`}>
          {getSubcategoriesForCategory(selectedMainCategory).map(subCategory => (
            <button
              key={subCategory}
              className={`desktop-subcategory-btn-below ${
                selectedSubCategory === subCategory ? 'active' : ''
              }`}
              onClick={() => handleDesktopSubCategoryClick(subCategory)}
            >
              {subCategory}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderMobileCategories = () => (
    <div className="mobile-category-filter">
      <div className="mobile-main-categories">
        {MOBILE_CATEGORIES.map(category => (
          <div key={category} className="mobile-category-item">
            <div
              className={`mobile-category-text ${
                selectedMainCategory === category ? 'active' : ''
              } ${
                selectedMainCategory !== null && selectedMainCategory !== category ? 'inactive' : ''
              }`}
              onClick={() => handleMobileCategoryClick(category)}
            >
              {category}
            </div>
            
            <div 
              className={`mobile-subcategories ${
                mobileSubcategoriesVisible && openCategory === category ? mobileAnimationState : ''
              }`}
            >
              {getSubcategoriesForCategory(category).map((subCategory, index) => (
                <div
                  key={subCategory}
                  className={`mobile-subcategory-text ${
                    selectedSubCategory === subCategory ? 'active' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubCategorySelect(subCategory);
                  }}
                  style={{ '--item-index': index }}
                >
                  {subCategory}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVideoCard = (video) => {
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
        onMouseLeave={() => handleMouseLeave(video.id)}
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
        
        <video
          ref={el => videoRefs.current[video.id] = el}
          className="project-video-background"
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={VideoPlaceholder} type="video/mp4" />
        </video>
        
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
  };

  const renderNoResults = () => (
    <div className="no-results">
      <p>No projects found for the selected filter.</p>
      <p><small>Selected: {selectedMainCategory} {selectedSubCategory && `→ ${selectedSubCategory}`}</small></p>
      <button 
        onClick={clearFilters}
        className="clear-filter-btn"
      >
        Clear Filters
      </button>
    </div>
  );

  const renderPopup = () => {
    if (!isPopupOpen || !selectedVideo) return null;
    
    return (
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
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="projects-video-section">
      <div className="projects-video-container">
        <div className="projects-header">
          <h1>ALL PROJECTS</h1>
          
          {!isMobile && renderDesktopCategories()}
          
          <div className="section-divider"></div>
          
          {!isMobile && renderDesktopSubcategories()}
        </div>

        {isMobile && renderMobileCategories()}

        <div className="video-grid">
          {filteredVideos.map(renderVideoCard)}
        </div>
        
        {filteredVideos.length === 0 && renderNoResults()}
      </div>

      {renderPopup()}
    </div>
  );
};

// Используем React.memo при экспорте
export default React.memo(ProjectsVideoSection);