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
            // Когда элемент появляется в viewport (с любой стороны)
            cityLine.classList.add("visible");
            cityLine.classList.remove("hidden");
          } else {
            // Когда элемент уходит из viewport
            const rect = entry.boundingClientRect;
            const windowHeight = window.innerHeight;
            
            // Если элемент ушел вверх (верхняя граница выше viewport)
            // ИЛИ если элемент ушел вниз (нижняя граница ниже viewport)
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

    // Наблюдаем за всеми элементами городов
    cityRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      cityRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  // Функция для получения времени в разных городах
  const getCityTime = (city, baseTime = currentTime) => {
    const time = new Date(baseTime);
    
    switch(city) {
      case 'DUBAI':
        time.setHours(time.getHours() + 4);
        break;
      case 'NEW YORK':
        time.setHours(time.getHours() - 5);
        break;
      case 'MOSCOW':
        time.setHours(time.getHours() + 3);
        break;
      case 'CAPE TOWN':
        time.setHours(time.getHours() + 2);
        break;
      case 'PARIS':
        time.setHours(time.getHours() + 1);
        break;
      default:
        break;
    }

    const hours = time.getHours();
    const minutes = time.getMinutes();
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
              <div className="city-container-flex">
                <div className="city-name-flex">{city.name}</div>
                <div className="city-time-flex">{getCityTime(city.name)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FourthScrollBlock;