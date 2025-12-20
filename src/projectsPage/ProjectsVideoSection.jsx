import React, { useState, useRef, useEffect } from 'react';
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
  "3D": ["Real Estate development", "Beauty", "Commercial", "Betting"],
  "CELEBRITY APPEARANCES": ["Real Estate development", "Beauty", "Commercial", "Betting"]
};

// Данные для видео с Vimeo ID
const videoData = [
  {
    id: 1,
    title: "BRUNELLO",
    description: "WE COMBINE FILM AND REAL ESTATE ADVERTISING. REAL ESTATE IS SOLD THROUGH EMOTION, THROUGH STORYTELLING, AND THROUGH THE EXPERIENCE OF BEING IN IT.",
    vimeoId: "1135673984",
    previewImage: "/projectImage/BRUNELLO.png",
    desktopMainCategory: "3D",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["3D"],
  },
  {
    id: 2,
    title: "VILLA DEL GAVI",
    description: "WE CREATED AN EMOTIONAL SALES VIDEO THAT SHOWCASES THE CONCEPT OF THE HOUSE. THE STORY AND CHARACTER OF THE HOUSE WERE CREATED. 3D RENDERINGS.",
    vimeoId: "1083958501",
    previewImage: "/projectImage/VILLA DEL GAVI.png",
    desktopMainCategory: "3D", 
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["3D"],
  },
  {
    id: 3,
    title: "EYWA WAY OF WATER",
    description: "THEY CREATED A MAGICAL WORLD IN WHICH THE MAIN CHARACTERS ARE A FATHER AND SON.",
    vimeoId: "1135702706",
    previewImage: "/projectImage/EYWA WAY OF WATER.png",
    desktopMainCategory: "3D",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["3D"],
  },
  {
    id: 4,
    title: "ELITE MERIT",
    description: "WE MAKE VIDEOS AND MARKETING THAT NO ONE ELSE DOES.",
    vimeoId: "1102229342",
    previewImage: "/projectImage/ELITE MERIT.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 5,
    title: "INTERSTELLAR",
    description: "WE COMBINED FILMING IN A STUDIO AND 3D GRAPHICS TO CONVEY THE FUTURE HOME AND ITS PHILOSOPHY AS ACCURATELY AS POSSIBLE.",
    vimeoId: "1021703237",
    previewImage: "/projectImage/Interstellar.png",
    desktopMainCategory: "3D",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["3D"],
  },
  {
    id: 6,
    title: "VILLA DEL DIVOS",
    description: "PARTICULAR ATTENTION IS PAID TO THE PHILOSOPHY BEHIND THE PROJECT AND ITS KEY ADVANTAGES: AN ATMOSPHERE OF COMFORT, AESTHETICS, AND SERVICE.",
    vimeoId: "1055145071",
    previewImage: "/projectImage/Villa del Divos.png",
    desktopMainCategory: "3D",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["3D"],
  },
  {
    id: 7,
    title: "MR.EIGHT | BRAND VIDEO",
    description: "«FOLLOW YOUR DREAM WHATEVER IT TAKES» - THIS THESIS REFLECTS THE COMPANY'S DETERMINATION AND UNWAVERING COMMITMENT TO WHICH IT MOVES FORWARD IN THE IMPLEMENTATION OF ITS PROJECTS.",
    vimeoId: "1055261671",
    previewImage: "/projectImage/Mr.Eight  Brand video.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 8,
    title: "LAUNCH OF THE VILLA DEL GAVI",
    description: "1400 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN HOLLYWOOD STARS OSCAR WINNER ADRIEN BRODY",
    vimeoId: "1060106406",
    previewImage: "/projectImage/Launch of the Villa del Gavi.png",
    desktopMainCategory: "EVENTS & LAUNCHES",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["EVENTS & LAUNCHES"],
  },
  {
    id: 9,
    title: "LAUNCH OF THE EYWA",
    description: "700 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN CONTENT",
    vimeoId: "1148259441",
    previewImage: "/projectImage/Launch of the EYWA.png",
    desktopMainCategory: "EVENTS & LAUNCHES",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["EVENTS & LAUNCHES"],
  },
  {
    id: 10,
    title: "LAUNCH OF THE DIVOS",
    description: "900 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN CONTENT",
    vimeoId: "1060106406", // Замените на правильный ID
    previewImage: "/projectImage/Launch of the DIVOS.png",
    desktopMainCategory: "EVENTS & LAUNCHES",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["EVENTS & LAUNCHES"],
  },
  {
    id: 11,
    title: "PR OF THE VILLA DEL GAVI",
    description: "PR CAMPAIGN WITH BRAND AMBASSADORS MR. THANK YOU & MR.GOODLUCK. A SERIES OF 98 REELS WAS PRODUCED, REACHING 195,000,000 VIEWS. AND 127 STORIES WERE PRODUCED, REACHING 48,500,000 VIEWS.",
    vimeoId: "1060106406", // Замените на правильный ID
    previewImage: "/projectImage/PR of the Villa del Gavi.png",
    desktopMainCategory: "HYPE & MARKETING",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["HYPE & MARKETING"],
  },
  {
    id: 12,
    title: "CELEBRITY APPEARANCES",
    description: "WE CAN BRING ANY STAR FOR YOU. MATTHEW MCCONAUGHEY, ADRIAN BRODY, NICOLAS CAGE, MILA JOVOVICH, VINCENT CASSEL, ZENDAYA, QUENTIN TARANTINO, KEANU REEVES, JASON MAMOA AND OTHERS.",
    vimeoId: "1060106406", // Замените на правильный ID
    previewImage: "/projectImage/Celebrity Appearances.png",
    desktopMainCategory: "HYPE & MARKETING",
    desktopSubCategory: "Real Estate development",
    mobileCategories: ["HYPE & MARKETING"],
  },
   {
    id: 13,
    title: "VIVIENNE SABO",
    description: "EVERYDAY LIFE VS CELEBRATION, MODESTY VS BOLDNESS, FAMILIARITY VS DARING SELF-EXPRESSION",
    vimeoId: "1115458742",
    previewImage: "/projectImage/Vivienne sabo.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Beauty",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 14,
    title: "STELLARY",
    description: "ONE PRODUCT, ONE CELEBRITY, 12 HOURS OF FILMING, AND OVER 80 VERSIONS FOR A POWERFUL MARKETING CAMPAIGN",
    vimeoId: "1061972276",
    previewImage: "/projectImage/Stellary.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Beauty",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 15,
    title: "VIVIENNE SABO 2",
    description: "WE FILMED IN MARRAKECH TO CAPTURE THE AUTHENTIC ATMOSPHERE AND REFLECT THE IDENTITY OF THE PRODUCT",
    vimeoId: "1061972276", // Замените на правильный ID
    previewImage: "/projectImage/Vivienne sabo (2).png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Beauty",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 16,
    title: "INFLUENCE",
    description: "WE USED CG AND MOTION CONTROL TO CREATE DYNAMIC TRANSITIONS THAT HIGHLIGHT THE PRODUCT'S QUALITY.",
    vimeoId: "1021687160",
    previewImage: "/projectImage/influence.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Beauty",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 17,
    title: "VAVADA",
    description: "FILMING AND CG FOR A NEW YEAR'S CAMPAIGN IN JUST 21 DAYS",
    vimeoId: "1055152643",
    previewImage: "/projectImage/VAVADA.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Betting",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 18,
    title: "FONBET 1",
    description: "AN IMAGE VIDEO TO BUILD TRUST IN THE COMPANY",
    vimeoId: "837838383",
    previewImage: "/projectImage/FONBET.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Betting",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 19,
    title: "FONBET 2",
    description: "WE DEVELOPED THE VIDEO FROM CONCEPT TO COMPLETION IN 45 DAYS. THE PROJECT WAS LAUNCHED ON TELEVISION.",
    vimeoId: "912201122",
    previewImage: "/projectImage/FONBET (2).png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Betting",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 20,
    title: "FONBET 3",
    description: "WE SHOWED THE COMPANY'S PRECISION BY CAPTURING EVERY DETAIL OF THE GAME, PRESENTING IT AS A RELIABLE BOOKMAKER THAT ACCOUNTS FOR EVERY MOMENT.",
    vimeoId: "912892750",
    previewImage: "/projectImage/FONBET (3).png",
    desktopMainCategory: "3D",
    desktopSubCategory: "Betting",
    mobileCategories: ["3D"],
  },
   {
    id: 21,
    title: "SYNTEC",
    description: "PRODUCTION AT ALL STAGES, FROM CREATIVE CONCEPTS TO MOTION CONTROL FILMING AND 3D GRAPHICS",
    vimeoId: "583046568",
    previewImage: "/projectImage/syntec.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Commercial",
    mobileCategories: ["VIDEO"],
  },
   {
    id: 22,
    title: "STREET BEAT",
    description: "A COMMERCIAL FOR UNION SNEAKERS, FEATURING CHILDREN AND ADULTS WHO HAVE SWITCHED ROLES.",
    vimeoId: "1112509843",
    previewImage: "/projectImage/street beat.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Commercial",
    mobileCategories: ["VIDEO"],
  },
   {
    id: 23,
    title: "KUPIBILET",
    description: "A SERIES OF WES ANDERSON-STYLE COMMERCIALS FOR THE FIRST MAJOR MARKETING CAMPAIGN",
    vimeoId: "1098147082",
    previewImage: "/projectImage/kupibilet.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Commercial",
    mobileCategories: ["VIDEO"],
  },
  {
    id: 24,
    title: "RESTORE 1",
    description: "WE USED SINGLE-SHOT FILMING TO CONVEY THE BRAND'S DYNAMIC ENERGY AND CONNECTION WITH TODAY'S YOUTH.",
    vimeoId: "863926399",
    previewImage: "/projectImage/Restore.png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Commercial",
    mobileCategories: ["VIDEO"],
  },
{
    id: 25,
    title: "RESTORE 2",
    description: "WE CREATED AND IMPLEMENTED THE IDEA OF SELLING SEVERAL PRODUCTS AT ONCE WITH A SINGLE VIDEO.",
    vimeoId: "837843106",
    previewImage: "/projectImage/Restore (2).png",
    desktopMainCategory: "VIDEO",
    desktopSubCategory: "Commercial",
    mobileCategories: ["VIDEO"],
  },
  // Остальные видео...
];

const ProjectsVideoSection = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
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

  // Функция для получения уникальных видео
  const getFilteredVideos = () => {
    if (selectedMainCategory !== null || selectedSubCategory !== null) {
      return videoData.filter(video => {
        if (isMobile) {
          if (selectedSubCategory) {
            return video.mobileCategories.includes(selectedMainCategory) && video.desktopSubCategory === selectedSubCategory;
          } else if (selectedMainCategory) {
            return video.mobileCategories.includes(selectedMainCategory);
          }
        } else {
          if (selectedSubCategory) {
            return video.desktopMainCategory === selectedMainCategory && video.desktopSubCategory === selectedSubCategory;
          } else if (selectedMainCategory) {
            return video.desktopMainCategory === selectedMainCategory;
          }
        }
        return false;
      });
    }
    
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
            console.log('Автовоспроизведение при наведении заблокировано');
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
          {filteredVideos.map(video => (
            <div
              key={video.id}
              className="video-card"
              onClick={() => openVideoPopup(video)}
              onMouseEnter={() => handleMouseEnter(video.id)}
              onMouseLeave={() => handleMouseLeave(video.id)}
            >
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