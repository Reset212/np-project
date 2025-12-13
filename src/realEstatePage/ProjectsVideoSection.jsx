import React, { useState, useRef, useEffect } from 'react';
import './ProjectsVideoSection.css';

// ЗАКОММЕНТИРОВАНО: Старые импорты видео
// import BRUNELLOVideo from './video/BRUNELLO.mp4';
// import VILLADELGAVIVideo from './video/VILLADELGAVI.mp4';
// import EYWAWAYOFWATERVideo from './video/EYWAWAYOFWATER.mp4';
// import ELITEMERITVideo from './video/ELITEMERIT.mp4';
// import InterstellarVideo from './video/Interstellar.mp4';
// import VilladelDivosVideo from './video/VilladelDivos.mp4';
// import MrEightBrandVideo from './video/MrEightBrandvideo.mp4';
// import LaunchoftheVilladelGaviVideo from './video/LaunchoftheVilladelGavi.mp4';
// // Добавлены недостающие импорты - замените на реальные пути к видео
// import LaunchoftheEYWAVideo from './video/BRUNELLO.mp4';
// import LaunchoftheDIVOSVideo from './video/LaunchoftheDIVOS.mp4';
// import PRoftheVilladelGaviVideo from './video/BRUNELLO.mp4'; 
// import CelebrityAppearancesVideo from './video/LaunchoftheVilladelGavi.mp4';

// Временная заглушка для видео
import VideoPlaceholder from '../video/hero-video.mp4';

// Главные категории для десктопа
const desktopMainCategories = [
  "VIDEO | 3D",
  "EVENTS | LAUNCHES",
  "HYPE CAMPAIGN",
  "CELEBRITY APPEARANCES"
];

// Главные категории для мобильной версии
const mobileMainCategories = [
  "VIDEO",
  "EVENTS & LAUNCHES",
  "HYPE & MARKETING",
  "3D",
  "CELEBRITY APPEARANCES"
];

// Подкатегории для мобильной версии (для всех категорий)
const mainCategoryToSubcategories = {
  "VIDEO": ["Real Estate development", "Beauty", "Commercial", "Betting"],
  "3D": ["Real Estate development", "Beauty", "Commercial", "Betting"],
  "EVENTS & LAUNCHES": ["Real Estate development", "Beauty", "Commercial", "Betting"],
  "HYPE & MARKETING": ["Real Estate development", "Beauty", "Commercial", "Betting"],
  "CELEBRITY APPEARANCES": ["Real Estate development", "Beauty", "Commercial", "Betting"]
};

// Данные для видео с массивами категорий
const videoData = [
  {
    id: 1,
    title: "BRUNELLO",
    description: "WE COMBINE FILM AND REAL ESTATE ADVERTISING. REAL ESTATE IS SOLD THROUGH EMOTION, THROUGH STORYTELLING, AND THROUGH THE EXPERIENCE OF BEING IN IT.",
    videoUrl: VideoPlaceholder, // Заглушка
    desktopCategory: "VIDEO | 3D",
    mobileCategories: ["VIDEO", "3D"],
    subCategory: "Real Estate development"
  },
  {
    id: 2,
    title: "VILLA DEL GAVI",
    description: "WE CREATED AN EMOTIONAL SALES VIDEO THAT SHOWCASES THE CONCEPT OF THE HOUSE. THE STORY AND CHARACTER OF THE HOUSE WERE CREATED. 3D RENDERINGS.",
    videoUrl: VideoPlaceholder, // Заглушка
    desktopCategory: "VIDEO | 3D",
    mobileCategories: ["VIDEO", "3D"],
    subCategory: "Real Estate development"
  },
  {
    id: 3,
    title: "EYWA WAY OF WATER",
    description: "THEY CREATED A MAGICAL WORLD IN WHICH THE MAIN CHARACTERS ARE A FATHER AND SON.",
    videoUrl: VideoPlaceholder, // Заглушка
    desktopCategory: "VIDEO | 3D",
    mobileCategories: ["VIDEO", "3D"],
    subCategory: "Commercial"
  },
  {
    id: 4,
    title: "ELITE MERIT",
    description: "WE MAKE VIDEOS AND MARKETING THAT NO ONE ELSE DOES.",
    videoUrl: VideoPlaceholder, // Заглушка
    desktopCategory: "HYPE CAMPAIGN",
    mobileCategories: ["VIDEO", "3D"],
    subCategory: "Betting"
  },
  {
    id: 5,
    title: "INTERSTELLAR",
    description: "WE COMBINED FILMING IN A STUDIO AND 3D GRAPHICS TO CONVEY THE FUTURE HOME AND ITS PHILOSOPHY AS ACCURATELY AS POSSIBLE.",
    videoUrl: VideoPlaceholder, // Заглушка
    desktopCategory: "VIDEO | 3D",
    mobileCategories: ["VIDEO", "3D"],
    subCategory: "Beauty"
  },
  {
    id: 6,
    title: "VILLA DEL DIVOS",
    description: "PARTICULAR ATTENTION IS PAID TO THE PHILOSOPHY BEHIND THE PROJECT AND ITS KEY ADVANTAGES: AN ATMOSPHERE OF COMFORT, AESTHETICS, AND SERVICE.",
    videoUrl: VideoPlaceholder, // Заглушка
    desktopCategory: "VIDEO | 3D",
    mobileCategories: ["VIDEO", "3D"],
    subCategory: "Commercial"
  },
  {
    id: 7,
    title: "MR.EIGHT | BRAND VIDEO",
    description: "«FOLLOW YOUR DREAM WHATEVER IT TAKES» - THIS THESIS REFLECTS THE COMPANY'S DETERMINATION AND UNWAVERING COMMITMENT TO WHICH IT MOVES FORWARD IN THE IMPLEMENTATION OF ITS PROJECTS.",
    videoUrl: VideoPlaceholder, // Заглушка
    desktopCategory: "HYPE CAMPAIGN",
    mobileCategories: ["VIDEO", "3D"],
    subCategory: "Real Estate development"
  },
  {
    id: 8,
    title: "LAUNCH OF THE VILLA DEL GAVI",
    description: "1400 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN HOLLYWOOD STARS OSCAR WINNER ADRIEN BRODY",
    videoUrl: VideoPlaceholder, // Заглушка
    desktopCategory: "EVENTS | LAUNCHES",
    mobileCategories: ["EVENTS & LAUNCHES"],
    subCategory: "Beauty"
  },
  {
    id: 9,
    title: "LAUNCH OF THE EYWA",
    description: "700 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN CONTENT",
    videoUrl: VideoPlaceholder, // Заглушка
    desktopCategory: "EVENTS | LAUNCHES",
    mobileCategories: ["EVENTS & LAUNCHES"],
    subCategory: "Beauty"
  },
  {
    id: 10,
    title: "LAUNCH OF THE DIVOS",
    description: "900 PEOPLE TURNKEY EVENT ORGANIZATION POWERFUL PR CAMPAIGN CONTENT",
    videoUrl: VideoPlaceholder, // Заглушка
    desktopCategory: "EVENTS | LAUNCHES",
    mobileCategories: ["EVENTS & LAUNCHES"],
    subCategory: "Beauty"
  },
  {
    id: 11,
    title: "PR OF THE VILLA DEL GAVI",
    description: "PR CAMPAIGN WITH BRAND AMBASSADORS MR. THANK YOU & MR.GOODLUCK. A SERIES OF 98 REELS WAS PRODUCED, REACHING 195,000,000 VIEWS. AND 127 STORIES WERE PRODUCED, REACHING 48,500,000 VIEWS.",
    videoUrl: VideoPlaceholder, // Заглушка
    desktopCategory: "EVENTS | LAUNCHES",
    mobileCategories: ["HYPE & MARKETING"],
    subCategory: "Beauty"
  },
  {
    id: 12,
    title: "CELEBRITY APPEARANCES",
    description: "WE CAN BRING ANY STAR FOR YOU. MATTHEW MCCONAUGHEY, ADRIAN BRODY, NICOLAS CAGE, MILA JOVOVICH, VINCENT CASSEL, ZENDAYA, QUENTIN TARANTINO, KEANU REEVES, JASON MAMOA AND OTHERS.",
    videoUrl: VideoPlaceholder, // Заглушка
    desktopCategory: "CELEBRITY APPEARANCES",
    mobileCategories: ["CELEBRITY APPEARANCES"],
    subCategory: "Beauty"
  }
];

const ProjectsVideoSection = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Состояния для анимации подкатегорий
  const [openCategory, setOpenCategory] = useState(null);
  const [animationState, setAnimationState] = useState('closed');

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

  // Фильтрация видео
  const filteredVideos = videoData.filter(video => {
    if (selectedMainCategory === null && selectedSubCategory === null) return true;

    if (isMobile) {
      if (selectedSubCategory) {
        return video.subCategory === selectedSubCategory;
      } else if (selectedMainCategory) {
        // Проверяем, содержит ли массив mobileCategories выбранную категорию
        return video.mobileCategories.includes(selectedMainCategory);
      }
    } else {
      return video.desktopCategory === selectedMainCategory;
    }
    return false;
  });

  // Обработчик выбора главной категории на мобильном
  const handleMobileCategoryClick = (category) => {
    // Если кликаем на уже открытую категорию - закрываем её
    if (openCategory === category && animationState === 'open') {
      closeSubcategories();
    } 
    // Если кликаем на другую категорию и есть открытая - закрываем старую, открываем новую
    else if (openCategory && openCategory !== category) {
      closeSubcategories(() => {
        setTimeout(() => {
          openSubcategories(category);
        }, 50);
      });
    }
    // Если нет открытой категории - открываем новую
    else {
      openSubcategories(category);
    }
  };

  // Функция открытия подкатегорий
  const openSubcategories = (category) => {
    setAnimationState('opening');
    setOpenCategory(category);
    setSelectedMainCategory(category);
    setSelectedSubCategory(null);
    
    // Переключаем на состояние "открыто" после начала анимации
    setTimeout(() => {
      setAnimationState('open');
    }, 10);
  };

  // Функция закрытия подкатегорий
  const closeSubcategories = (callback = null) => {
    setAnimationState('closing');
    
    // После окончания анимации закрытия
    setTimeout(() => {
      setAnimationState('closed');
      setOpenCategory(null);
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
      
      if (callback) {
        callback();
      }
    }, 500);
  };

  // Обработчик выбора подкатегории
  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory === selectedSubCategory ? null : subCategory);
  };

  // Получение подкатегорий для выбранной категории
  const getSubcategoriesForCategory = (category) => {
    return mainCategoryToSubcategories[category] || [];
  };

  // Получаем количество видео для каждой категории (для отображения счетчика)
  const getCategoryCount = (category) => {
    return videoData.filter(video => video.mobileCategories.includes(category)).length;
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
      // Устанавливаем начало воспроизведения с 7-й секунды
      videoElement.currentTime = 7;
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
      // Возвращаем на 7-ю секунду для следующего предпросмотра
      videoElement.currentTime = 7;
    }
  };

  // Инициализация видео с 7-й секунды при загрузке
  const handleVideoLoaded = (videoId) => {
    const videoElement = videoRefs.current[videoId];
    if (videoElement && videoElement.readyState >= 1) { // HAVE_ENOUGH_DATA
      // Устанавливаем время на 7-ю секунду, но не превышаем длительность видео
      if (videoElement.duration > 7) {
        videoElement.currentTime = 7;
      } else {
        // Если видео короче 7 секунд, устанавливаем на середину
        videoElement.currentTime = videoElement.duration / 2;
      }
    }
  };

  // Обработчик ошибки загрузки видео
  const handleVideoError = () => {
    setVideoLoadError(true);
    console.error('Ошибка загрузки видео');
  };

  return (
    <div className="projects-video-section">
      <div className="projects-video-container">
        <div className="projects-header">
          <h1>ALL PROJECTS</h1>
          <div className="section-divider"></div>
        </div>

        {/* Десктопная фильтрация */}
        {!isMobile && (
          <div className="desktop-category-filter">
            <div className="desktop-main-categories">
              {desktopMainCategories.map(category => (
                <button
                  key={category}
                  className={`desktop-category-btn ${
                    selectedMainCategory === category ? 'active' : ''
                  }`}
                  onClick={() => setSelectedMainCategory(
                    selectedMainCategory === category ? null : category
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Мобильная фильтрация */}
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
                  
                  {/* Подкатегории с анимацией */}
                  {openCategory === category && getSubcategoriesForCategory(category).length > 0 && (
                    <div 
                      className={`mobile-subcategories ${
                        animationState === 'opening' || animationState === 'open' ? 'open' : 
                        animationState === 'closing' ? 'closing' : ''
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
                  )}
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
              <video
                ref={el => videoRefs.current[video.id] = el}
                className={`video-background ${isMobile ? 'mobile-static' : ''}`}
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedData={() => handleVideoLoaded(video.id)}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsVideoSection;