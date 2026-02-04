import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './ProjectAdmin.css';
import "./font.css";
const ProjectAdmin = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Фиксированные категории
  const mainCategories = ["VIDEO", "HYPE & MARKETING", "EVENTS & LAUNCHES", "3D"];
  const subCategories = ["Real Estate development", "Beauty", "Commercial", "Betting"];
  
  // Форма проекта
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    vimeoId: '',
    previewImage: '',
    mobilePreviewImage: '',
    desktopMainCategories: [{ main: 'VIDEO', sub: 'Real Estate development' }], // Массив объектов
    mobileCategories: ['VIDEO'],
    mobileBreakpoint: 450,
  });
  
  const [editingId, setEditingId] = useState(null);
  const [tempImages, setTempImages] = useState({});
  const [filter, setFilter] = useState('all');
  const [allFilters, setAllFilters] = useState(['all']);

  // Загрузка проектов
  const loadProjects = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Форматируем данные
      const formattedData = (data || []).map(project => {
        // Получаем массивы категорий из JSON полей
        let desktopMainCategories = [];
        let desktopSubCategories = [];
        
        // Проверяем разные форматы хранения категорий
        if (project.desktop_main_categories && Array.isArray(project.desktop_main_categories)) {
          desktopMainCategories = project.desktop_main_categories;
        } else if (project.desktop_main_category) {
          desktopMainCategories = [project.desktop_main_category];
        }
        
        if (project.desktop_sub_categories && Array.isArray(project.desktop_sub_categories)) {
          desktopSubCategories = project.desktop_sub_categories;
        } else if (project.desktop_sub_category) {
          desktopSubCategories = [project.desktop_sub_category];
        }
        
        // Для обратной совместимости: парсим категории в формат объектов
        const categoryPairs = [];
        for (let i = 0; i < Math.max(desktopMainCategories.length, desktopSubCategories.length); i++) {
          categoryPairs.push({
            main: desktopMainCategories[i] || desktopMainCategories[0] || 'VIDEO',
            sub: desktopSubCategories[i] || desktopSubCategories[0] || 'Real Estate development'
          });
        }
        
        return {
          id: project.id,
          title: project.title,
          description: project.description,
          vimeoId: project.vimeo_id,
          previewImage: project.preview_image,
          mobilePreviewImage: project.mobile_preview_image,
          desktopMainCategories: categoryPairs, // Массив объектов
          desktopMainCategory: desktopMainCategories[0] || project.desktop_main_category || '',
          desktopSubCategory: desktopSubCategories[0] || project.desktop_sub_category || '',
          mobileCategories: project.mobile_categories || [],
          mobileBreakpoint: project.mobile_breakpoint || 450,
          createdAt: project.created_at,
        };
      });
      
      setProjects(formattedData);
      
      // Собираем все фильтры
      const filtersSet = new Set(['all']);
      formattedData.forEach(project => {
        project.desktopMainCategories?.forEach(pair => {
          filtersSet.add(pair.main);
          filtersSet.add(pair.sub);
        });
        project.mobileCategories?.forEach(cat => filtersSet.add(cat));
      });
      
      setAllFilters(Array.from(filtersSet));
      
    } catch (error) {
      console.error('Error loading projects:', error);
      alert('Error loading projects: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Загрузка изображений
  const uploadImageToSupabase = async (file, folder = 'desktop') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      console.log('Uploading to:', filePath);
      
      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      console.log('Upload successful, URL:', publicUrl);
      return publicUrl;
      
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleFileUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Валидация
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Please upload an image file (JPEG, PNG, WEBP, JPG)');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size must be less than 5MB. Current: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    const tempUrl = URL.createObjectURL(file);
    setTempImages(prev => ({ ...prev, [imageType]: tempUrl }));

    try {
      setUploading(true);
      const folder = imageType === 'previewImage' ? 'desktop' : 'mobile';
      const supabaseUrl = await uploadImageToSupabase(file, folder);
      
      setNewProject(prev => ({
        ...prev,
        [imageType]: supabaseUrl
      }));
      
      setTempImages(prev => ({ ...prev, [imageType]: null }));
      alert('Image uploaded successfully!');
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Error uploading image: ' + error.message);
      // Оставляем временный URL
      setNewProject(prev => ({
        ...prev,
        [imageType]: tempUrl
      }));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Управление категориями
  const addCategoryField = () => {
    setNewProject(prev => ({
      ...prev,
      desktopMainCategories: [
        ...prev.desktopMainCategories,
        { main: 'VIDEO', sub: 'Real Estate development' }
      ]
    }));
  };

  const removeCategoryField = (index) => {
    if (newProject.desktopMainCategories.length > 1) {
      setNewProject(prev => ({
        ...prev,
        desktopMainCategories: prev.desktopMainCategories.filter((_, i) => i !== index)
      }));
    } else {
      alert('Project must have at least one category pair');
    }
  };

  const updateCategoryField = (index, field, value) => {
    const updatedCategories = [...newProject.desktopMainCategories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value
    };
    setNewProject(prev => ({
      ...prev,
      desktopMainCategories: updatedCategories
    }));
  };

  const handleMobileCategoriesChange = (value) => {
    const categories = value.split(',').map(cat => cat.trim()).filter(cat => cat);
    setNewProject(prev => ({
      ...prev,
      mobileCategories: categories.length > 0 ? categories : ['VIDEO']
    }));
  };

  // Сохранение проекта
  const handleSaveProject = async () => {
    // Валидация
    if (!newProject.title.trim()) {
      alert('Please enter project title');
      return;
    }

    if (!newProject.vimeoId.trim()) {
      alert('Please enter Vimeo ID');
      return;
    }

    if (!newProject.previewImage && !tempImages.previewImage) {
      alert('Please upload desktop preview image');
      return;
    }

    // Проверяем категории
    const validCategories = newProject.desktopMainCategories.filter(
      cat => cat.main && cat.sub
    );
    
    if (validCategories.length === 0) {
      alert('Please add at least one category pair');
      return;
    }

    try {
      // Подготавливаем данные
      const desktopMainCategoriesArray = validCategories.map(cat => cat.main);
      const desktopSubCategoriesArray = validCategories.map(cat => cat.sub);
      
      const projectData = {
        title: newProject.title.trim(),
        description: newProject.description.trim(),
        vimeo_id: newProject.vimeoId.trim(),
        preview_image: newProject.previewImage || tempImages.previewImage,
        mobile_preview_image: newProject.mobilePreviewImage || tempImages.mobilePreviewImage,
        desktop_main_categories: desktopMainCategoriesArray, // JSON массив
        desktop_sub_categories: desktopSubCategoriesArray,  // JSON массив
        desktop_main_category: desktopMainCategoriesArray[0], // Для обратной совместимости
        desktop_sub_category: desktopSubCategoriesArray[0],   // Для обратной совместимости
        mobile_categories: newProject.mobileCategories,
        mobile_breakpoint: newProject.mobileBreakpoint || 450,
      };

      console.log('Saving project data:', projectData);

      if (editingId) {
        // Обновление
        const { error } = await supabase
          .from('projects_videos')
          .update(projectData)
          .eq('id', editingId);

        if (error) throw error;
        alert('Project updated successfully!');
      } else {
        // Создание
        const { error } = await supabase
          .from('projects_videos')
          .insert([projectData]);

        if (error) throw error;
        alert('Project added successfully!');
      }

      await loadProjects();
      handleCancelEdit();
      
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project: ' + error.message);
    }
  };

  const handleEditProject = (project) => {
    setEditingId(project.id);
    
    // Преобразуем категории проекта в формат формы
    const desktopMainCategories = project.desktopMainCategories || [];
    
    setNewProject({
      title: project.title || '',
      description: project.description || '',
      vimeoId: project.vimeoId || '',
      previewImage: project.previewImage || '',
      mobilePreviewImage: project.mobilePreviewImage || '',
      desktopMainCategories: desktopMainCategories.length > 0 
        ? desktopMainCategories 
        : [{ main: project.desktopMainCategory || 'VIDEO', sub: project.desktopSubCategory || 'Real Estate development' }],
      mobileCategories: project.mobileCategories || ['VIDEO'],
      mobileBreakpoint: project.mobileBreakpoint || 450,
    });
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?\nThis action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('projects_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadProjects();
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewProject({
      title: '',
      description: '',
      vimeoId: '',
      previewImage: '',
      mobilePreviewImage: '',
      desktopMainCategories: [{ main: 'VIDEO', sub: 'Real Estate development' }],
      mobileCategories: ['VIDEO'],
      mobileBreakpoint: 450,
    });
    setTempImages({});
  };

  // Фильтрация
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => {
        if (!project) return false;
        
        // Проверяем основные категории
        if (project.desktopMainCategories?.some(pair => pair.main === filter || pair.sub === filter)) {
          return true;
        }
        
        // Проверяем мобильные категории
        if (project.mobileCategories?.includes(filter)) {
          return true;
        }
        
        // Для обратной совместимости
        if (project.desktopMainCategory === filter || project.desktopSubCategory === filter) {
          return true;
        }
        
        return false;
      });

  if (loading && projects.length === 0) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>MOVIE PARK - ADMIN PANEL</h1>
        <div className="admin-nav">
          <button 
            className={`nav-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            OUR PROJECTS ({projects.length})
          </button>
          <button 
            className="nav-btn"
            onClick={handleCancelEdit}
          >
            {editingId ? 'CANCEL EDIT' : '+ NEW PROJECT'}
          </button>
          <button 
            className="nav-btn"
            onClick={loadProjects}
          >
            ↻ REFRESH
          </button>
        </div>
      </header>

      <main className="admin-main">
        {/* Форма */}
        <section className="form-section">
          <h2>{editingId ? `EDIT PROJECT #${editingId}` : 'CREATE NEW PROJECT'}</h2>
          
          <div className="form-grid">
            {/* Название */}
            <div className="form-group">
              <label>1. PROJECT NAME *</label>
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                placeholder="Enter project name"
                maxLength="40"
                required
              />
              <div className="char-count">{newProject.title.length} / 40</div>
            </div>

            {/* Изображения */}
            <div className="form-group">
              <label>2. PREVIEW IMAGES</label>
              <div className="image-inputs">
                <div className="image-input">
                  <div className="image-input-header">
                    <span>DESKTOP IMAGE *</span>
                    <small>Recommended: 1920x1080px</small>
                  </div>
                  <div className="file-upload-container">
                    <label className="file-upload-btn">
                      {newProject.previewImage || tempImages.previewImage ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={(e) => handleFileUpload(e, 'previewImage')}
                        disabled={uploading}
                      />
                    </label>
                    {uploading && <span className="uploading-text">UPLOADING...</span>}
                  </div>
                  {(newProject.previewImage || tempImages.previewImage) && (
                    <div className="image-preview">
                      <img 
                        src={newProject.previewImage || tempImages.previewImage} 
                        alt="Desktop preview" 
                      />
                      <small>{newProject.previewImage ? 'Supabase URL' : 'Temporary preview'}</small>
                    </div>
                  )}
                </div>
                
                <div className="image-input">
                  <div className="image-input-header">
                    <span>MOBILE IMAGE</span>
                    <small>Recommended: 1080x1920px</small>
                  </div>
                  <div className="file-upload-container">
                    <label className="file-upload-btn">
                      {newProject.mobilePreviewImage || tempImages.mobilePreviewImage ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={(e) => handleFileUpload(e, 'mobilePreviewImage')}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {(newProject.mobilePreviewImage || tempImages.mobilePreviewImage) && (
                    <div className="image-preview">
                      <img 
                        src={newProject.mobilePreviewImage || tempImages.mobilePreviewImage} 
                        alt="Mobile preview"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vimeo ID */}
            <div className="form-group">
              <label>3. VIMEO ID *</label>
              <input
                type="text"
                value={newProject.vimeoId}
                onChange={(e) => setNewProject({...newProject, vimeoId: e.target.value})}
                placeholder="Enter Vimeo video ID"
                required
              />
              <small className="field-hint">Only the ID number</small>
            </div>

            {/* Множественные категории */}
            <div className="form-group full-width">
              <label>4. DESKTOP CATEGORIES *</label>
              <div className="categories-container">
                {newProject.desktopMainCategories.map((categoryPair, index) => (
                  <div key={index} className="category-row">
                    <div className="category-number">Category Pair #{index + 1}</div>
                    <div className="category-selectors-row">
                      <div className="category-selector">
                        <select
                          value={categoryPair.main}
                          onChange={(e) => updateCategoryField(index, 'main', e.target.value)}
                          required
                        >
                          <option value="">Select main category</option>
                          {mainCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="category-selector">
                        <select
                          value={categoryPair.sub}
                          onChange={(e) => updateCategoryField(index, 'sub', e.target.value)}
                          required
                        >
                          <option value="">Select subcategory</option>
                          {subCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="category-actions-row">
                        {newProject.desktopMainCategories.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove-category"
                            onClick={() => removeCategoryField(index)}
                            title="Remove this category pair"
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="btn-add-more-categories"
                  onClick={addCategoryField}
                >
                  + Add Another Category Pair
                </button>
              </div>
              <small className="field-hint">
                Add multiple category pairs. Project will appear in all selected filters.
              </small>
            </div>

            {/* Мобильные категории */}
            <div className="form-group">
              <label>5. MOBILE CATEGORIES</label>
              <input
                type="text"
                value={newProject.mobileCategories.join(', ')}
                onChange={(e) => handleMobileCategoriesChange(e.target.value)}
                placeholder="VIDEO, 3D, etc."
              />
              <small className="field-hint">Separate with commas</small>
            </div>

            {/* Breakpoint */}
            <div className="form-group">
              <label>6. MOBILE BREAKPOINT (px)</label>
              <input
                type="number"
                value={newProject.mobileBreakpoint}
                onChange={(e) => setNewProject({...newProject, mobileBreakpoint: parseInt(e.target.value) || 450})}
                min="320"
                max="1200"
              />
            </div>

            {/* Описание */}
            <div className="form-group full-width">
              <label>7. PROJECT DESCRIPTION</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                placeholder="Enter project description..."
                rows="4"
              />
            </div>
          </div>

          {/* Сводка категорий */}
          <div className="categories-summary">
            <h4>Selected Categories ({newProject.desktopMainCategories.length} pairs):</h4>
            <div className="summary-items">
              {newProject.desktopMainCategories.map((pair, index) => (
                <div key={index} className="summary-item">
                  <span className="main-cat">{pair.main}</span>
                  <span className="arrow">→</span>
                  <span className="sub-cat">{pair.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки */}
          <div className="form-actions">
            <button 
              className="btn btn-primary" 
              onClick={handleSaveProject}
              disabled={uploading || !newProject.title || !newProject.vimeoId}
            >
              {uploading ? 'UPLOADING...' : editingId ? 'UPDATE PROJECT' : 'SAVE PROJECT'}
            </button>
            
            {editingId && (
              <button className="btn btn-secondary" onClick={handleCancelEdit}>
                CANCEL
              </button>
            )}
            
            <button className="btn btn-reset" onClick={handleCancelEdit}>
              CLEAR
            </button>
          </div>
        </section>

        {/* Таблица проектов */}
        <section className="projects-section">
          <div className="projects-header">
            <h2>PROJECTS LIST ({filteredProjects.length} of {projects.length})</h2>
            <div className="projects-actions">
              <select 
                className="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {allFilters.map(filterItem => (
                  <option key={filterItem} value={filterItem}>
                    {filterItem === 'all' ? 'ALL CATEGORIES' : filterItem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="projects-table-container">
            <table className="projects-table">
              <thead>
                <tr>
                  <th width="50">ID</th>
                  <th width="80">PREVIEW</th>
                  <th>NAME</th>
                  <th width="250">CATEGORIES</th>
                  <th width="120">VIMEO ID</th>
                  <th width="100">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(project => (
                  <tr key={project.id}>
                    <td className="text-center">{project.id}</td>
                    <td className="project-preview">
                      {project.previewImage ? (
                        <img 
                          src={project.previewImage} 
                          alt={project.title}
                          className="thumbnail"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="thumbnail-error">📷</div>';
                          }}
                        />
                      ) : (
                        <div className="thumbnail-placeholder">📷</div>
                      )}
                    </td>
                    <td className="project-name">{project.title}</td>
                    <td>
                      <div className="project-categories-display">
                        {project.desktopMainCategories?.map((pair, index) => (
                          <div key={index} className="category-pair">
                            <span className="main">{pair.main}</span>
                            <span className="separator">/</span>
                            <span className="sub">{pair.sub}</span>
                          </div>
                        ))}
                        {(!project.desktopMainCategories || project.desktopMainCategories.length === 0) && 
                         project.desktopMainCategory && (
                          <div className="category-pair">
                            <span className="main">{project.desktopMainCategory}</span>
                            <span className="separator">/</span>
                            <span className="sub">{project.desktopSubCategory || 'N/A'}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <a 
                        href={`https://vimeo.com/${project.vimeoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="vimeo-link"
                      >
                        {project.vimeoId || '-'}
                      </a>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="btn-action btn-edit"
                        onClick={() => handleEditProject(project)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredProjects.length === 0 && (
              <div className="no-projects">
                <p>No projects found. {filter !== 'all' && 'Try changing the filter.'}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="admin-footer">
        <p>© 2025 MOVIE PARK</p>
        <p>Multiple categories supported | {projects.filter(p => 
          p.desktopMainCategories && p.desktopMainCategories.length > 1
        ).length} projects with multiple categories</p>
      </footer>
    </div>
  );
};

export default ProjectAdmin;