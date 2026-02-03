export const getVideosByCategory = (category) => {
  const videos = localStorage.getItem('admin_videos');
  if (videos) {
    const parsedVideos = JSON.parse(videos);
    return parsedVideos
      .filter(video => video.category === category)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  
  // Fallback к исходному JSON файлу
  try {
    const data = require('../data/videos.json');
    return data.videos
      .filter(video => video.category === category)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    return [];
  }
};