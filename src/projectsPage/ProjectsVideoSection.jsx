import React, { useState, useRef, useEffect } from 'react';
import './ProjectsVideoSection.css';

// Заглушка для видео (используется для самого видео)
import VideoPlaceholder from '../video/hero-video.mp4';

// Главные категории для десктопа (над чертой)
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

// Подкатегории для всех категорий (как на референсе)
const mainCategoryToSubcategories = {
  "VIDEO": ["Real Estate development", "Beauty", "Commercial", "Betting"],
  "HYPE & MARKETING": ["Real Estate development", "Beauty", "Commercial", "Betting"],
  "EVENTS & LAUNCHES": ["Real Estate development", "Beauty", "Commercial", "Betting"],
  "3D": ["Real Estate development", "Beauty", "Commercial", "Betting"],
  "CELEBRITY APPEARANCES": ["Real Estate development", "Beauty", "Commercial", "Betting"]
};

// Данные для видео с правильной категоризацией и изображениями превью
const videoData = [
  {
    id: 1,
    title: "BRUNELLO",
    description: "WE COMBINE FILM AND REAL ESTATE ADVERTISING. REAL ESTATE IS SOLD THROUGH EMOTION, THROUGH STORYTELLING, AND THROUGH THE EXPERIENCE OF BEING IN IT.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/BRUNELLO.png",
    desktopMainCategory: "3D",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["3D"],
  },
  {
    id: 2,
    title: "VILLA DEL GAVI",
    description: "WE CREATED AN EMOTIONAL SALES VIDEO THAT SHOWCASES THE CONCEPT OF THE HOUSE. THE STORY AND CHARACTER OF THE HOUSE WERE CREATED. 3D RENDERINGS.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/VILLA DEL GAVI.png",
    desktopMainCategory: "3D", 
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["3D"],
  },
  {
    id: 3,
    title: "EYWA WAY OF WATER",
    description: "THEY CREATED A MAGICAL WORLD IN WHICH THE MAIN CHARACTERS ARE A FATHER AND SON.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/EYWA WAY OF WATER.png",
    desktopMainCategory: "3D",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["3D"],
  },
  {
    id: 4,
    title: "ELITE MERIT",
    description: "WE MAKE VIDEOS AND MARKETING THAT NO ONE ELSE DOES.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/ELITE MERIT.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 5,
    title: "INTERSTELLAR",
    description: "WE COMBINED FILMING IN A STUDIO AND 3D GRAPHICS TO CONVEY THE FUTURE HOME AND ITS PHILOSOPHY AS ACCURATELY AS POSSIBLE.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Interstellar.png",
    desktopMainCategory: "3D",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["3D"],
  },
  {
    id: 6,
    title: "VILLA DEL DIVOS",
    description: "PARTICULAR ATTENTION IS PAID TO THE PHILOSOPHY BEHIND THE PROJECT AND ITS KEY ADVANTAGES: AN ATMOSPHERE OF COMFORT, AESTHETICS, AND SERVICE.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Villa del Divos.png",
    desktopMainCategory: "3D",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["3D"],
  },
  {
    id: 7,
    title: "MR.EIGHT | BRAND VIDEO",
    description: "«FOLLOW YOUR DREAM WHATEVER IT TAKES» - THIS THESIS REFLECTS THE COMPANY'S DETERMINATION AND UNWAVERING COMMITMENT TO WHICH IT MOVES FORWARD IN THE IMPLEMENTATION OF ITS PROJECTS.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Mr.Eight  Brand video.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 8,
    title: "LAUNCH OF THE VILLA DEL GAVI",
    description: "1400 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN HOLLYWOOD STARS OSCAR WINNER ADRIEN BRODY",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Launch of the Villa del Gavi.png",
    desktopMainCategory: "EVENTS & LAUNCHES",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["EVENTS & LAUNCHES"],
  },
  {
    id: 9,
    title: "LAUNCH OF THE EYWA",
    description: "700 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN CONTENT",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Launch of the EYWA.png",
    desktopMainCategory: "EVENTS & LAUNCHES",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["EVENTS & LAUNCHES"],
  },
  {
    id: 10,
    title: "LAUNCH OF THE DIVOS",
    description: "900 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN CONTENT",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Launch of the DIVOS.png",
    desktopMainCategory: "EVENTS & LAUNCHES",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["EVENTS & LAUNCHES"],
  },
  {
    id: 11,
    title: "PR OF THE VILLA DEL GAVI",
    description: "PR CAMPAIGN WITH BRAND AMBASSADORS MR. THANK YOU & MR.GOODLUCK. A SERIES OF 98 REELS WAS PRODUCED, REACHING 195,000,000 VIEWS. AND 127 STORIES WERE PRODUCED, REACHING 48,500,000 VIEWS.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/PR of the Villa del Gavi.png",
    desktopMainCategory: "HYPE & MARKETING",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["HYPE & MARKETING"],
  },
  {
    id: 12,
    title: "CELEBRITY APPEARANCES",
    description: "WE CAN BRING ANY STAR FOR YOU. MATTHEW MCCONAUGHEY, ADRIAN BRODY, NICOLAS CAGE, MILA JOVOVICH, VINCENT CASSEL, ZENDAYA, QUENTIN TARANTINO, KEANU REEVES, JASON MAMOA AND OTHERS.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Celebrity Appearances.png",
    desktopMainCategory: "HYPE & MARKETING",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["HYPE & MARKETING"],
  },
   {
    id: 13,
    title: "VIVIENNE SABO",
    description: "EVERYDAY LIFE VS CELEBRATION, MODESTY VS BOLDNESS, FAMILIARITY VS DARING SELF-EXPRESSION",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Vivienne sabo.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Beauty",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 14,
    title: "STELLARY",
    description: "ONE PRODUCT, ONE CELEBRITY, 12 HOURS OF FILMING, AND OVER 80 VERSIONS FOR A POWERFUL MARKETING CAMPAIGN",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Stellary.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Beauty",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 15,
    title: "VIVIENNE SABO",
    description: "WE FILMED IN MARRAKECH TO CAPTURE THE AUTHENTIC ATMOSPHERE AND REFLECT THE IDENTITY OF THE PRODUCT",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Vivienne sabo (2).png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Beauty",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 16,
    title: "INFLUENCE",
    description: "WE USED CG AND MOTION CONTROL TO CREATE DYNAMIC TRANSITIONS THAT HIGHLIGHT THE PRODUCT'S QUALITY.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/influence.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Beauty",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 17,
    title: "VAVADA",
    description: "FILMING AND CG FOR A NEW YEAR'S CAMPAIGN IN JUST 21 DAYS",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/VAVADA.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Betting",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 18,
    title: "FONBET",
    description: "AN IMAGE VIDEO TO BUILD TRUST IN THE COMPANY",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/FONBET.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Betting",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 19,
    title: "FONBET",
    description: "WE DEVELOPED THE VIDEO FROM CONCEPT TO COMPLETION IN 45 DAYS. THE PROJECT WAS LAUNCHED ON TELEVISION.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/FONBET (2).png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Betting",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 20,
    title: "FONBET",
    description: "WE SHOWED THE COMPANY'S PRECISION BY CAPTURING EVERY DETAIL OF THE GAME, PRESENTING IT AS A RELIABLE BOOKMAKER THAT ACCOUNTS FOR EVERY MOMENT.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/FONBET (3).png",
    desktopMainCategory: "3D",
    desktopSubCategory: "Betting",
    mobileCategories: ["3D"],
  },
   {
    id: 21,
    title: "SYNTEC",
    description: "PRODUCTION AT ALL STAGES, FROM CREATIVE CONCEPTS TO MOTION CONTROL FILMING AND 3D GRAPHICS",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/syntec.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Commercial",
    mobileCategories: ["VIDEO"],
  },
   {
    id: 22,
    title: "STREET BEAT",
    description: "A COMMERCIAL FOR UNION SNEAKERS, FEATURING CHILDREN AND ADULTS WHO HAVE SWITCHED ROLES.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/street beat.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Commercial",
    mobileCategories: ["VIDEO"],
  },
   {
    id: 23,
    title: "KUPIBILET",
    description: "A SERIES OF WES ANDERSON-STYLE COMMERCIALS FOR THE FIRST MAJOR MARKETING CAMPAIGN",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/kupibilet.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Commercial",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 24,
    title: "RESTORE",
    description: "WE USED SINGLE-SHOT FILMING TO CONVEY THE BRAND'S DYNAMIC ENERGY AND CONNECTION WITH TODAY'S YOUTH.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Restore.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Commercial",
    mobileCategories: ["VIDEO"],
  },
{
    id: 25,
    title: "RESTORE",
    description: "WE CREATED AND IMPLEMENTED THE IDEA OF SELLING SEVERAL PRODUCTS AT ONCE WITH A SINGLE VIDEO.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Restore (2).png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Commercial",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 26,
    title: "BRUNELLO",
    description: "WE COMBINE FILM AND REAL ESTATE ADVERTISING. REAL ESTATE IS SOLD THROUGH EMOTION, THROUGH STORYTELLING, AND THROUGH THE EXPERIENCE OF BEING IN IT.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/BRUNELLO.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 27,
    title: "VILLA DEL GAVI",
    description: "WE CREATED AN EMOTIONAL SALES VIDEO THAT SHOWCASES THE CONCEPT OF THE HOUSE. THE STORY AND CHARACTER OF THE HOUSE WERE CREATED. 3D RENDERINGS.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/VILLA DEL GAVI.png",
    desktopMainCategory: "VIDEO", 
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 28,
    title: "EYWA WAY OF WATER",
    description: "THEY CREATED A MAGICAL WORLD IN WHICH THE MAIN CHARACTERS ARE A FATHER AND SON.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/EYWA WAY OF WATER.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 29,
    title: "VILLA DEL DIVOS",
    description: "PARTICULAR ATTENTION IS PAID TO THE PHILOSOPHY BEHIND THE PROJECT AND ITS KEY ADVANTAGES: AN ATMOSPHERE OF COMFORT, AESTHETICS, AND SERVICE.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/Villa del Divos.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 30,
    title: "FONBET",
    description: "WE DEVELOPED THE VIDEO FROM CONCEPT TO COMPLETION IN 45 DAYS. THE PROJECT WAS LAUNCHED ON TELEVISION.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/FONBET (2).png",
    desktopMainCategory: "3D",
    desktopSubCategory: "Betting",
    mobileCategories: ["3D"],
  },
  {
    id: 31,
    title: "FONBET",
    description: "WE SHOWED THE COMPANY'S PRECISION BY CAPTURING EVERY DETAIL OF THE GAME, PRESENTING IT AS A RELIABLE BOOKMAKER THAT ACCOUNTS FOR EVERY MOMENT.",
    videoUrl: VideoPlaceholder,
    previewImage: "/projectImage/FONBET (3).png",
    desktopMainCategory: "3D",
    desktopSubCategory: "Betting",
    mobileCategories: ["3D"],
  },
];

const ProjectsVideoSection = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoadError, setImageLoadError] = useState({});
  
  // Состояния для анимации подкатегорий (десктоп)
  const [desktopSubcategoriesOpen, setDesktopSubcategoriesOpen] = useState(false);
  const [desktopAnimationState, setDesktopAnimationState] = useState('closed');
  
  // Состояния для мобильной версии - ИСПРАВЛЕННЫЕ
  const [openCategory, setOpenCategory] = useState(null);
  const [mobileAnimationState, setMobileAnimationState] = useState('closed');
  const [mobileSubcategoriesVisible, setMobileSubcategoriesVisible] = useState(false);

  const videoRefs = useRef({});
  const popupVideoRef = useRef(null);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Функция для получения уникальных видео (без дубликатов при отключенных фильтрах)
  const getFilteredVideos = () => {
    // При активных фильтрах показываем все соответствующие видео
    if (selectedMainCategory !== null || selectedSubCategory !== null) {
      return videoData.filter(video => {
        if (isMobile) {
          if (selectedSubCategory) {
            return video.mobileCategories.includes(selectedMainCategory) && video.desktopSubCategory === selectedSubCategory;
          } else if (selectedMainCategory) {
            return video.mobileCategories.includes(selectedMainCategory);
          }
        } else {
          // Десктопная фильтрация
          if (selectedSubCategory) {
            return video.desktopMainCategory === selectedMainCategory && video.desktopSubCategory === selectedSubCategory;
          } else if (selectedMainCategory) {
            return video.desktopMainCategory === selectedMainCategory;
          }
        }
        return false;
      });
    }
    
    // При отключенных фильтрах показываем только уникальные видео (без дубликатов)
    // Определяем уникальность по previewImage (так как одинаковые названия но разные фото)
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
    // Если кликаем на уже выбранную категорию - закрываем всё
    if (selectedMainCategory === category && desktopSubcategoriesOpen) {
      closeDesktopSubcategories();
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
    } 
    // Если выбираем новую категорию
    else {
      if (selectedMainCategory !== category) {
        closeDesktopSubcategories(() => {
          setSelectedMainCategory(category);
          setSelectedSubCategory(null);
          openDesktopSubcategories();
        });
      } else {
        // Просто открываем подкатегории, если категория уже выбрана
        openDesktopSubcategories();
      }
    }
  };

  // Открытие подкатегорий на десктопе
  const openDesktopSubcategories = () => {
    setDesktopAnimationState('opening');
    setDesktopSubcategoriesOpen(true);
    
    setTimeout(() => {
      setDesktopAnimationState('open');
    }, 10);
  };

  // Закрытие подкатегорий на десктопе
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

  // Обработчик выбора подкатегории на десктопе
  const handleDesktopSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory === selectedSubCategory ? null : subCategory);
  };

  // Обработчик выбора главной категории на мобильном - ИСПРАВЛЕННЫЙ
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

  // Открытие подкатегорий на мобильном - ИСПРАВЛЕННОЕ
  const openMobileSubcategories = (category) => {
    setOpenCategory(category);
    setSelectedMainCategory(category);
    setSelectedSubCategory(null);
    
    // Даем время для рендера элемента с начальным состоянием
    setTimeout(() => {
      setMobileAnimationState('opening');
      setMobileSubcategoriesVisible(true);
      
      // Даем время для применения начальных стилей
      setTimeout(() => {
        setMobileAnimationState('open');
      }, 20);
    }, 10);
  };

  // Закрытие подкатегорий на мобильном - ИСПРАВЛЕННОЕ
  const closeMobileSubcategories = (callback = null) => {
    setMobileAnimationState('closing');
    
    setTimeout(() => {
      setMobileAnimationState('closed');
      setOpenCategory(null);
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
      
      // Даем время для завершения анимации закрытия
      setTimeout(() => {
        setMobileSubcategoriesVisible(false);
        
        if (callback) {
          callback();
        }
      }, 50);
    }, 400); // Длительность анимации закрытия
  };

  // Обработчик выбора подкатегории на мобильном
  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory === selectedSubCategory ? null : subCategory);
  };

  // Получение подкатегорий для категории
  const getSubcategoriesForCategory = (category) => {
    return mainCategoryToSubcategories[category] || [];
  };

  // Открытие попапа с видео
  const openVideoPopup = (video) => {
    setSelectedVideo(video);
    setVideoLoadError(false);
    setIsPopupOpen(true);
    document.body.style.overflow = 'hidden';
    
    // Останавливаем все видео на карточках
    Object.values(videoRefs.current).forEach(videoElement => {
      if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    });
    
    // Автовоспроизведение в попапе
    setTimeout(() => {
      if (popupVideoRef.current) {
        const playPromise = popupVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') {
              console.warn('Автовоспроизведение в попапе не удалось:', error);
            }
          });
        }
      }
    }, 300);
  };

  // Закрытие попапа с видео
  const closeVideoPopup = () => {
    if (popupVideoRef.current) {
      popupVideoRef.current.pause();
      popupVideoRef.current.currentTime = 0;
    }
    setIsPopupOpen(false);
    setSelectedVideo(null);
    setVideoLoadError(false);
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

  // Обработчик ошибки загрузки видео в попапе
  const handleVideoError = () => {
    setVideoLoadError(true);
    console.error('Ошибка загрузки видео в попапе');
  };

  return (
    <div className="projects-video-section">
      <div className="projects-video-container">
        <div className="projects-header">
          <h1>ALL PROJECTS</h1>
          
          {/* Десктопная фильтрация - главные категории НАД чертой */}
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
          
          {/* Десктопная фильтрация - подкатегории ПОД чертой */}
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

        {/* Мобильная фильтрация - ИСПРАВЛЕННЫЙ КОД */}
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
                  
                  {/* Подкатегории с анимацией - ВСЕГДА В DOM, но скрыты */}
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
              
              {/* Видео (воспроизводится только при наведении на десктопе) - ИСПРАВЛЕННЫЙ КЛАСС */}
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
                <source src={video.videoUrl} type="video/mp4" />
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
        
        {filteredVideos.length === 0 && (
          <div className="no-results">
            <p>No projects found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Попап с видео */}
      {isPopupOpen && selectedVideo && (
        <div className="video-popup-overlay" onClick={closeVideoPopup}>
          <div className="video-popup" onClick={e => e.stopPropagation()}>
            <button className="close-popup" onClick={closeVideoPopup}>
              ×
            </button>
            <div className="popup-content">
              <h3>{selectedVideo.title}</h3>
              <div className="popup-video-container">
                <video
                  ref={popupVideoRef}
                  controls
                  onError={handleVideoError}
                  key={selectedVideo.id}
                >
                  <source src={selectedVideo.videoUrl} type="video/mp4" />
                  Ваш браузер не поддерживает видео тег.
                </video>
                {videoLoadError && (
                  <div className="video-error-message">
                    <p>⚠️ Video failed to load</p>
                    <p>Пожалуйста, проверьте наличие файла видео</p>
                  </div>
                )}
              </div>
              <p className="popup-description">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsVideoSection;