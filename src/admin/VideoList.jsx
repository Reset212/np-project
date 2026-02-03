import React, { useState, useEffect } from 'react';
import { getVideos, deleteVideo } from '../utils/videoStorage';
import VideoForm from './VideoForm';
import './VideoList.css';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [editingVideo, setEditingVideo] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    const loadedVideos = getVideos();
    // Проверяем есть ли видео в localStorage
    const localVideos = localStorage.getItem('admin_videos');
    if (localVideos) {
      setVideos(JSON.parse(localVideos));
    } else {
      setVideos(loadedVideos);
    }
  };

  const handleAddVideo = (videoData) => {
    const videos = getVideos();
    const newVideo = {
      id: Date.now(),
      ...videoData,
      createdAt: new Date().toISOString()
    };
    
    const updatedVideos = [...videos, newVideo].sort((a, b) => a.sortOrder - b.sortOrder);
    localStorage.setItem('admin_videos', JSON.stringify(updatedVideos));
    setVideos(updatedVideos);
    setShowForm(false);
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  const handleUpdateVideo = (videoData) => {
    const updatedVideos = videos.map(video => 
      video.id === editingVideo.id 
        ? { ...video, ...videoData }
        : video
    ).sort((a, b) => a.sortOrder - b.sortOrder);
    
    localStorage.setItem('admin_videos', JSON.stringify(updatedVideos));
    setVideos(updatedVideos);
    setEditingVideo(null);
    setShowForm(false);
  };

  const handleDeleteVideo = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить это видео?')) {
      const updatedVideos = videos.filter(video => video.id !== id);
      localStorage.setItem('admin_videos', JSON.stringify(updatedVideos));
      setVideos(updatedVideos);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVideo(null);
  };

  return (
    <div className="video-list">
      <div className="header">
        <h2>Управление видео</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="add-button"
        >
          + Добавить видео
        </button>
      </div>

      {showForm ? (
        <div className="form-section">
          <h3>{editingVideo ? 'Редактировать видео' : 'Добавить новое видео'}</h3>
          <VideoForm
            onSubmit={editingVideo ? handleUpdateVideo : handleAddVideo}
            initialData={editingVideo || {}}
          />
          <button onClick={handleCancel} className="cancel-button">
            Отмена
          </button>
        </div>
      ) : null}

      <div className="videos-grid">
        {videos.map(video => (
          <div key={video.id} className="video-card">
            <div className="video-info">
              <h4>{video.title}</h4>
              <p><strong>Категория:</strong> {video.category}</p>
              <p><strong>Порядок:</strong> {video.sortOrder}</p>
              <p><strong>Файл:</strong> {video.filename}</p>
              {video.description && (
                <p><strong>Описание:</strong> {video.description}</p>
              )}
            </div>
            <div className="video-actions">
              <button 
                onClick={() => handleEditVideo(video)}
                className="edit-button"
              >
                Редактировать
              </button>
              <button 
                onClick={() => handleDeleteVideo(video.id)}
                className="delete-button"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && !showForm && (
        <div className="no-videos">
          <p>Нет добавленных видео. Нажмите "Добавить видео", чтобы начать.</p>
          <p className="note">
            Примечание: видео файлы должны быть загружены вручную в папку src/video/
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoList;