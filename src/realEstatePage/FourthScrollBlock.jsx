import React, { useState, useEffect } from "react";
import "./FourthScrollBlock.css";

const FourthScrollBlock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Обновляем время каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Функция для получения времени в разных городах
  const getCityTime = (city, baseTime = currentTime) => {
    const time = new Date(baseTime);
    
    switch(city) {
      case 'DUBAI':
        time.setHours(time.getHours() + 4); // UTC+4
        break;
      case 'NEW YORK':
        time.setHours(time.getHours() - 5); // UTC-5
        break;
      case 'MOSCOW':
        time.setHours(time.getHours() + 3); // UTC+3
        break;
      case 'CAPE TOWN':
        time.setHours(time.getHours() + 2); // UTC+2
        break;
      case 'PARIS':
        time.setHours(time.getHours() + 1); // UTC+1
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
            <div key={index} className="city-line">
            
              
              {/* Вариант 2: с flexbox (более надежный, включается на мобильных) */}
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