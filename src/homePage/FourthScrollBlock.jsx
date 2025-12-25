import React, { useState, useEffect, useRef } from "react";
import "./FourthScrollBlock.css";

const FourthScrollBlock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const cityRefs = useRef([]);

  // Обновляем время каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Инициализация Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cityLine = entry.target;
          
          if (entry.isIntersecting) {
            cityLine.classList.add("visible");
            cityLine.classList.remove("hidden");
          } else {
            const rect = entry.boundingClientRect;
            const windowHeight = window.innerHeight;
            
            if (rect.top < 0 || rect.bottom > windowHeight) {
              cityLine.classList.add("hidden");
              cityLine.classList.remove("visible");
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    cityRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      cityRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  // ВЕРСИЯ 1: Используем Intl API (рекомендуется) - учитывает летнее время
  const getCityTimeIntl = (city) => {
    const timeZones = {
      'DUBAI': 'Asia/Dubai',
      'NEW YORK': 'America/New_York',
      'MOSCOW': 'Europe/Moscow',
      'CAPE TOWN': 'Africa/Johannesburg',
      'PARIS': 'Europe/Paris'
    };

    const timeZone = timeZones[city];
    if (!timeZone) return '--:-- --';

    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      return formatter.format(new Date());
    } catch (error) {
      console.error(`Error formatting time for ${city}:`, error);
      return getCityTimeFallback(city);
    }
  };

  // ВЕРСИЯ 2: Fallback - если Intl не поддерживается (редко)
  const getCityTimeFallback = (city) => {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    
    // Смещения с учетом некоторых особенностей (примерные)
    const offsets = {
      'DUBAI': 4 * 3600000,      // UTC+4
      'NEW YORK': -5 * 3600000,  // UTC-5 (EST), UTC-4 летом
      'MOSCOW': 3 * 3600000,     // UTC+3
      'CAPE TOWN': 2 * 3600000,  // UTC+2
      'PARIS': 1 * 3600000       // UTC+1 (CET), UTC+2 летом
    };
    
    const offset = offsets[city] || 0;
    const cityTime = new Date(utcTime + offset);
    
    const hours = cityTime.getHours();
    const minutes = cityTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // ВЫБОР ФУНКЦИИ: используем Intl по умолчанию
  const getCityTime = getCityTimeIntl;

  const cities = [
    { name: "DUBAI" },
    { name: "NEW YORK" },
    { name: "MOSCOW" },
    { name: "CAPE TOWN" },
    { name: "PARIS" }
  ];

  // Для тестирования - показываем локальное время пользователя
  const getUserLocalTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${formattedHours}:${formattedMinutes} ${ampm} (Ваше время)`;
  };

  return (
    <section className="fourth-section">
      <div className="fourth-content">
        <div className="cities-container">
          {cities.map((city, index) => (
            <div 
              key={index} 
              className="city-line"
              ref={(el) => (cityRefs.current[index] = el)}
              style={{
                transitionDelay: `${index * 150}ms`
              }}
            >
              <div className="city-wrapper">
                <div className="city-container-flex">
                  <div className="city-name-flex">{city.name}</div>
                  <div className="city-time-flex">{getCityTime(city.name)}</div>
                </div>
              </div>
            </div>
          ))}
          
  
        </div>
      </div>
    </section>
  );
};

export default FourthScrollBlock;