import React, { useState } from 'react';
import './VideoForm.css';

const VideoForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    category: initialData.category || 'real-estate',
    sortOrder: initialData.sortOrder || 1,
    filename: initialData.filename || '',
    description: initialData.description || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="video-form">
      <div className="form-group">
        <label>Название:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Категория:</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="real-estate">Real Estate</option>
          <option value="projects">Projects</option>
          <option value="home">Home</option>
        </select>
      </div>

      <div className="form-group">
        <label>Порядок сортировки:</label>
        <input
          type="number"
          name="sortOrder"
          value={formData.sortOrder}
          onChange={handleChange}
          min="1"
          required
        />
      </div>

      <div className="form-group">
        <label>Имя файла (например: video.mp4):</label>
        <input
          type="text"
          name="filename"
          value={formData.filename}
          onChange={handleChange}
          required
          placeholder="video.mp4"
        />
      </div>

      <div className="form-group">
        <label>Описание:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <button type="submit" className="submit-button">
        {initialData.id ? 'Обновить' : 'Добавить'}
      </button>
    </form>
  );
};

export default VideoForm;