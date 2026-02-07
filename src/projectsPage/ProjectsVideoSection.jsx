import React, { useState, useRef, useEffect } from 'react';
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

// Главные категории для мобильной версии (теперь такие же как для десктопа)
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [imageLoadError, setImageLoadError] = useState({});
  const [cursorHidden, setCursorHidden] = useState(false);
  
  // Состояния для анимации подкатегорий (десктоп)
  const [desktopSubcategoriesOpen, setDesktopSubcategoriesOpen] = useState(false);
  const [desktopAnimationState, setDesktopAnimationState] = useState('closed');
  
  // Состояния для мобильной версии
  const [openCategory, setOpenCategory] = useState(null);
  const [mobileAnimationState, setMobileAnimationState] = useState('closed');
  const [mobileSubcategoriesVisible, setMobileSubcategoriesVisible] = useState(false);

  const videoRefs = useRef({});
  const popupTimeoutRef = useRef(null);

  // Эффект для загрузки данных и отслеживания размера окна
  useEffect(() => {
    loadVideoData();
    
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

  // Функция загрузки данных из Supabase
  const loadVideoData = async () => {
    try {
      // console.log('🔄 Загружаю данные из Supabase в фоне...');
      
      const { data, error: supabaseError } = await supabase
        .from('projects_videos')
        .select('*')
        .order('id', { ascending: true });

      if (supabaseError) {
        console.error('❌ Ошибка Supabase:', supabaseError);
        return;
      }

      // Преобразуем данные в нужный формат
      const formattedData = (data || []).map(item => {
        // Получаем массивы категорий из полей desktop_main_categories и desktop_sub_categories
        let desktopMainCategoriesArray = [];
        let desktopSubCategoriesArray = [];
        
        // Проверяем наличие массивов категорий
        if (item.desktop_main_categories && Array.isArray(item.desktop_main_categories)) {
          desktopMainCategoriesArray = item.desktop_main_categories;
        }
        
        if (item.desktop_sub_categories && Array.isArray(item.desktop_sub_categories)) {
          desktopSubCategoriesArray = item.desktop_sub_categories;
        }
        
        // Для обратной совместимости: если массивы пустые, используем старые поля
        if (desktopMainCategoriesArray.length === 0 && item.desktop_main_category) {
          desktopMainCategoriesArray = [item.desktop_main_category];
        }
        
        if (desktopSubCategoriesArray.length === 0 && item.desktop_sub_category) {
          desktopSubCategoriesArray = [item.desktop_sub_category];
        }
        
        // Создаем пары категорий для удобства
        const categoryPairs = [];
        for (let i = 0; i < Math.max(desktopMainCategoriesArray.length, desktopSubCategoriesArray.length); i++) {
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
          // Для обратной совместимости оставляем старые поля
          desktopMainCategory: desktopMainCategoriesArray[0] || item.desktop_main_category || '',
          desktopSubCategory: desktopSubCategoriesArray[0] || item.desktop_sub_category || '',
          // Добавляем массивы категорий
          desktopMainCategoriesArray: desktopMainCategoriesArray,
          desktopSubCategoriesArray: desktopSubCategoriesArray,
          desktopCategoryPairs: categoryPairs,
          mobileCategories: Array.isArray(item.mobile_categories) 
            ? item.mobile_categories 
            : [],
          mobileBreakpoint: item.mobile_breakpoint || 450,
        };
      });

      setVideoData(formattedData);
      setHasData(true);
      // console.log(`✅ Загружено ${formattedData.length} видео из Supabase`);
      
    } catch (err) {
      console.error('❌ Ошибка загрузки данных:', err);
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

  // Функция для определения, нужно ли использовать мобильное изображение
  const shouldUseMobileImage = (video) => {
    if (!video.mobilePreviewImage) return false;
    
    if (video.mobileBreakpoint) {
      return windowWidth <= video.mobileBreakpoint;
    }
    
    return isMobile;
  };

  // ЕДИНАЯ функция для получения отфильтрованных видео
  const getFilteredVideos = () => {
    // Если данных нет, возвращаем пустой массив
    if (!videoData || videoData.length === 0) {
      return [];
    }

    // Если есть активные фильтры
    if (selectedMainCategory !== null || selectedSubCategory !== null) {
      return videoData.filter(video => {
        // Проверяем подкатегорию
        if (selectedSubCategory) {
          // Проверяем пары категорий: основная категория + подкатегория
          if (video.desktopCategoryPairs && video.desktopCategoryPairs.length > 0) {
            return video.desktopCategoryPairs.some(pair => 
              pair.main === selectedMainCategory && pair.sub === selectedSubCategory
            );
          }
          // Для обратной совместимости
          return video.desktopMainCategory === selectedMainCategory && 
                 video.desktopSubCategory === selectedSubCategory;
        } 
        // Проверяем только основную категорию
        else if (selectedMainCategory) {
          // Проверяем основную категорию в массиве
          if (video.desktopMainCategoriesArray && video.desktopMainCategoriesArray.length > 0) {
            return video.desktopMainCategoriesArray.includes(selectedMainCategory);
          }
          // Для обратной совместимости
          return video.desktopMainCategory === selectedMainCategory;
        }
        return false;
      });
    }
    
    // Если фильтров нет - показываем все уникальные видео
    const uniqueVideos = [];
    const seenImages = new Set();
    
    videoData.forEach(video => {
      if (!seenImages.has(video.previewImage)) {
        seenImages.add(video.previewImage);
        uniqueVideos.push(video);
      }
    });
    
    return uniqueVideos;
  };

  const filteredVideos = getFilteredVideos();

  // Обработчик выбора главной категории на десктопе
  const handleDesktopMainCategoryClick = (category) => {
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
  };

  const openDesktopSubcategories = () => {
    setDesktopAnimationState('opening');
    setDesktopSubcategoriesOpen(true);
    
    setTimeout(() => {
      setDesktopAnimationState('open');
    }, 10);
  };

  const closeDesktopSubcategories = (callback = null) => {
    setDesktopAnimationState('closing');
    
    setTimeout(() => {
      setDesktopAnimationState('closed');
      setDesktopSubcategoriesOpen(false);
      
      if (callback) {
        callback();
      }
    }, 300);
  };

  const handleDesktopSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory === selectedSubCategory ? null : subCategory);
  };

  // Обработчики для мобильной версии - используют ту же логику
  const handleMobileCategoryClick = (category) => {
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
  };

  const openMobileSubcategories = (category) => {
    setOpenCategory(category);
    setSelectedMainCategory(category);
    setSelectedSubCategory(null);
    
    setTimeout(() => {
      setMobileAnimationState('opening');
      setMobileSubcategoriesVisible(true);
      
      setTimeout(() => {
        setMobileAnimationState('open');
      }, 20);
    }, 10);
  };

  const closeMobileSubcategories = (callback = null) => {
    setMobileAnimationState('closing');
    
    setTimeout(() => {
      setMobileAnimationState('closed');
      setOpenCategory(null);
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
      
      setTimeout(() => {
        setMobileSubcategoriesVisible(false);
        
        if (callback) {
          callback();
        }
      }, 50);
    }, 400);
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory === selectedSubCategory ? null : subCategory);
  };

  const getSubcategoriesForCategory = (category) => {
    return mainCategoryToSubcategories[category] || [];
  };

  // Функция для определения, нужно ли показывать кнопку для данного видео
  const shouldShowWatchButton = (videoId) => {
    return videoId !== 11 && videoId !== 2;
  };

  // Открытие попапа с Vimeo видео
  const openVideoPopup = (video) => {
    if (video.id === 11 || video.id === 2) {
      return;
    }
    setSelectedVideo(video);
    setIsPopupOpen(true);
    setCursorHidden(true);
    document.body.style.overflow = 'hidden';
    
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

  // Наведение на карточку видео
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
            // console.log('Автовоспроизведение при наведении заблокировано');
          }
        });
      }
    }
  };

  const handleMouseLeave = (videoId) => {
    if (isMobile) return;
    setHoveredCard(null);
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  };

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

  // Показываем пустое состояние если данных нет
  if (!hasData && videoData.length === 0) {
    return (
      <div className="projects-video-section">
        <div className="projects-video-container">
          <div className="projects-header">
            <h1>ALL PROJECTS</h1>
            
            {!isMobile && (
              <div className="desktop-main-categories-above">
                {desktopMainCategories.map(category => (
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
            {[...Array(6)].map((_, i) => (
              <div key={i} className="video-card-skeleton"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-video-section">
      <div className="projects-video-container">
        <div className="projects-header">
          <h1>ALL PROJECTS</h1>
          
          {!isMobile && (
            <div className="desktop-main-categories-above">
              {desktopMainCategories.map(category => (
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
          )}
          
          <div className="section-divider"></div>
          
          {!isMobile && (
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
          )}
        </div>

        {isMobile && (
          <div className="mobile-category-filter">
            <div className="mobile-main-categories">
              {mobileMainCategories.map(category => (
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
                      mobileSubcategoriesVisible && openCategory === category ? (
                        mobileAnimationState === 'opening' ? 'opening' :
                        mobileAnimationState === 'open' ? 'open' : 
                        mobileAnimationState === 'closing' ? 'closing' : ''
                      ) : ''
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
        )}

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
        
        {filteredVideos.length === 0 && (
          <div className="no-results">
            <p>No projects found for the selected filter.</p>
            <p><small>Selected: {selectedMainCategory} {selectedSubCategory && `→ ${selectedSubCategory}`}</small></p>
            <button 
              onClick={() => {
                setSelectedMainCategory(null);
                setSelectedSubCategory(null);
              }}
              className="clear-filter-btn"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Попап с Vimeo плеером */}
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