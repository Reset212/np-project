import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./FourthScrollBlock.css";

// Константы вынесены из компонента
const CITIES = [
  { name: "DUBAI", timeZone: 'Asia/Dubai', offset: 4 },
  { name: "NEW YORK", timeZone: 'America/New_York', offset: -5 },
  { name: "MOSCOW", timeZone: 'Europe/Moscow', offset: 3 },
  { name: "CAPE TOWN", timeZone: 'Africa/Johannesburg', offset: 2 },
  { name: "PARIS", timeZone: 'Europe/Paris', offset: 1 }
];

// Создаем один форматтер для всех городов
const createTimeFormatter = (timeZone) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error(`Error creating formatter for ${timeZone}:`, error);
    return null;
  }
};

const FourthScrollBlock = React.memo(() => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const cityRefs = useRef([]);
  const observerRef = useRef(null);
  const timerRef = useRef(null);

  // Мемоизированный форматтер для каждого города
  const cityFormatters = useMemo(() => 
    CITIES.reduce((acc, city) => {
      acc[city.name] = createTimeFormatter(city.timeZone);
      return acc;
    }, {}), []
  );

  // Оптимизированное обновление времени
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(Date.now());
    };

    timerRef.current = setInterval(updateTime, 60000); // Обновляем каждую минуту вместо секунды

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Функция для получения времени с форматтером или fallback
  const getCityTime = useCallback((cityName) => {
    const now = new Date(currentTime);
    const cityData = CITIES.find(c => c.name === cityName);
    
    if (!cityData) return '--:-- --';

    const formatter = cityFormatters[cityName];
    
    if (formatter) {
      try {
        return formatter.format(now);
      } catch (error) {
        console.warn(`Formatter error for ${cityName}, using fallback:`, error);
      }
    }

    // Fallback если форматтер не сработал
    return getCityTimeFallback(now, cityData.offset);
  }, [currentTime, cityFormatters]);

  // Fallback функция
  const getCityTimeFallback = useCallback((now, offset) => {
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cityTime = new Date(utcTime + (offset * 3600000));
    
    const hours = cityTime.getHours();
    const minutes = cityTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }, []);

  // Инициализация Intersection Observer с useCallback
  const observerCallback = useCallback((entries) => {
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
  }, []);

  useEffect(() => {
    // Создаем observer только один раз
    observerRef.current = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    });

    const observer = observerRef.current;
    const refs = cityRefs.current;

    refs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      if (observer) {
        refs.forEach((ref) => {
          if (ref) observer.unobserve(ref);
        });
      }
    };
  }, [observerCallback]);

  // Мемоизированный рендер строк городов
  const renderCityLine = useCallback((city, index) => (
    <div 
      key={city.name} 
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
  ), [getCityTime]);

  return (
    <section className="fourth-section">
      <div className="fourth-content">
        <div className="cities-container">
          {CITIES.map(renderCityLine)}
        </div>
      </div>
    </section>
  );
});

FourthScrollBlock.displayName = "FourthScrollBlock";

export default FourthScrollBlock;