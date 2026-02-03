// Утилиты для работы с видео данными
export const getVideos = () => {
  try {
    const data = require('../data/videos.json');
    return data.videos.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    console.error('Error loading videos:', error);
    return [];
  }
};

export const addVideo = (videoData) => {
  // В реальном проекте здесь была бы запись в JSON файл
  // Для статического сайта можно использовать localStorage
  const videos = getVideos();
  const newVideo = {
    id: Date.now(),
    ...videoData,
    createdAt: new Date().toISOString()
  };
  
  const updatedVideos = [...videos, newVideo];
  localStorage.setItem('admin_videos', JSON.stringify(updatedVideos));
  return newVideo;
};

export const updateVideo = (id, updates) => {
  const videos = getVideos();
  const updatedVideos = videos.map(video => 
    video.id === id ? { ...video, ...updates } : video
  );
  localStorage.setItem('admin_videos', JSON.stringify(updatedVideos));
  return updatedVideos;
};

export const deleteVideo = (id) => {
  const videos = getVideos();
  const updatedVideos = videos.filter(video => video.id !== id);
  localStorage.setItem('admin_videos', JSON.stringify(updatedVideos));
  return updatedVideos;
};