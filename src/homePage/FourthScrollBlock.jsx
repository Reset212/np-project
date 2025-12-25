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

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ: Создаем новый объект Date для каждого города
  const getCityTime = (city) => {
    const now = new Date(); // Берем текущее время
    
    // Часовые пояса для городов (UTC offset)
    const timezones = {
      'DUBAI': 4,      // UTC+4
      'NEW YORK': -5,  // UTC-5
      'MOSCOW': 3,     // UTC+3
      'CAPE TOWN': 2,  // UTC+2
      'PARIS': 1       // UTC+1
    };
    
    // Создаем копию времени для каждого города
    const cityTime = new Date(now.getTime());
    
    // Получаем смещение для города
    const offset = timezones[city] || 0;
    
    // Вычисляем время в городе
    const utcHours = cityTime.getUTCHours();
    const cityHours = (utcHours + offset + 24) % 24;
    
    cityTime.setUTCHours(cityHours);
    
    // Форматируем время
    const hours = cityTime.getUTCHours();
    const minutes = cityTime.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const cities = [
    { name: "DUBAI" },
    { name: "NEW YORK" },
    { name: "MOSCOW" },
    { name: "CAPE TOWN" },
    { name: "PARIS" }
  ];

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