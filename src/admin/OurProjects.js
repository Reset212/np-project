import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const OurProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects_videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProjects(data || []);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError('Ошибка загрузки проектов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('projects_videos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProjects(projects.filter(project => project.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка при удалении проекта');
    }
  };

  const handleEdit = (id) => {
    // Навигация к редактированию проекта
    navigate(`/admin/new-project/${id}`);
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  const formatCategories = (project) => {
    if (project.desktop_main_categories && project.desktop_main_categories.length > 0) {
      return project.desktop_main_categories.join(', ');
    }
    return project.desktop_main_category || '-';
  };

  if (loading) {
    return (
      <div className="our-projects-page">
        <div className="loading">Загрузка проектов...</div>
      </div>
    );
  }

  return (
    <div className="our-projects-page">
      <div className="page-header">
        <h2>Наши проекты</h2>
        <div className="stats">
          <span className="stat-badge">Всего проектов: {projects.length}</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>Проектов пока нет</h3>
          <p>Создайте первый проект, нажав на вкладку "NEW PROJECT"</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-image-container">
                {project.preview_image && !imageErrors[project.id] ? (
                  <img
                    src={project.preview_image}
                    alt={project.title}
                    className="project-preview-image"
                    onError={() => handleImageError(project.id)}
                    loading="lazy"
                  />
                ) : (
                  <div className="project-image-placeholder">
                    <span>Нет изображения</span>
                  </div>
                )}
                
                <div className="project-id-badge">
                  ID: {project.id}
                </div>
              </div>
              
              <div className="project-info">
                <h3 className="project-title">{project.title}</h3>
                
                <div className="project-meta">
                  <div className="meta-row">
                    <strong>Категории:</strong> {formatCategories(project)}
                  </div>
                  <div className="meta-row">
                    <strong>Vimeo ID:</strong> {project.vimeo_id}
                  </div>
                  <div className="meta-row">
                    <strong>Создан:</strong> {new Date(project.created_at).toLocaleDateString('ru-RU')}
                  </div>
                  {project.mobile_preview_image && (
                    <div className="meta-row">
                      <strong>Мобильное превью:</strong> ✓
                    </div>
                  )}
                </div>
                
                <p className="project-description">
                  {project.description && project.description.length > 100 
                    ? `${project.description.substring(0, 100)}...` 
                    : project.description}
                </p>
                
                <div className="project-actions">
                  <button
                    onClick={() => handleEdit(project.id)}
                    className="action-btn edit-btn"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(project.id)}
                    className="action-btn delete-btn"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="delete-modal">
          <div className="modal-content">
            <h3>Подтвердите удаление</h3>
            <p>Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить.</p>
            <div className="modal-actions">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="cancel-btn"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="confirm-delete-btn"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OurProjects;