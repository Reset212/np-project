import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
// Импортируем SVG иконки
import editIcon from "../image/Vector-1.svg";
import deleteIcon from "../image/Vector.svg";

const OurProjects = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState('realestate_videos'); // Состояние для выбора таблицы
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [deleting, setDeleting] = useState(false);

  // Загрузка проектов при изменении выбранной таблицы
  useEffect(() => {
    loadProjects();
  }, [selectedTable]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from(selectedTable)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProjects(data || []);
      setCurrentPage(1); // Сбрасываем на первую страницу при смене таблицы
    } catch (err) {
      console.error('Loading error:', err);
      setError(`Error loading projects from ${selectedTable}`);
    } finally {
      setLoading(false);
    }
  };

  // Функция для удаления файлов из Supabase Storage
  const deleteImageFromStorage = async (imageUrl) => {
    if (!imageUrl) return;
    
    try {
      // Извлекаем путь к файлу из URL
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/project-images\/(.+)/);
      
      if (!pathMatch) {
        console.warn('Cannot extract file path from URL:', imageUrl);
        return;
      }
      
      const filePath = pathMatch[1];
      console.log('Deleting file from storage:', filePath);
      
      const { error } = await supabase.storage
        .from('project-images')
        .remove([filePath]);
      
      if (error) {
        console.error('Error deleting image from storage:', error);
        throw error;
      }
      
      console.log('Successfully deleted image:', filePath);
    } catch (err) {
      console.error('Error in deleteImageFromStorage:', err);
      // Не выбрасываем ошибку дальше, чтобы удаление проекта продолжалось
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      
      // Находим проект для удаления
      const projectToDelete = projects.find(project => project.id === id);
      if (!projectToDelete) {
        throw new Error('Project not found');
      }
      
      console.log('Deleting project:', projectToDelete.title);
      
      // Удаляем изображения из storage если они есть
      const deletePromises = [];
      
      if (projectToDelete.preview_image) {
        deletePromises.push(deleteImageFromStorage(projectToDelete.preview_image));
      }
      
      if (projectToDelete.mobile_preview_image) {
        deletePromises.push(deleteImageFromStorage(projectToDelete.mobile_preview_image));
      }
      
      // Ожидаем удаления всех изображений
      await Promise.all(deletePromises);
      console.log('All images deleted successfully');
      
      // Удаляем проект из базы данных
      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Обновляем состояние
      setProjects(projects.filter(project => project.id !== id));
      setDeleteConfirm(null);
      
    } catch (err) {
      console.error('Deletion error:', err);
      alert('Error deleting project: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/new-project/${id}`);
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  // Форматирование категорий в зависимости от таблицы
  const formatCategories = (project) => {
    if (selectedTable === 'realestate_videos') {
      return project.category || '-';
    } else {
      if (project.desktop_main_categories && project.desktop_main_categories.length > 0) {
        return project.desktop_main_categories.join(', ');
      }
      return project.desktop_main_category || '-';
    }
  };

  // Форматирование подкатегорий в зависимости от таблицы
  const formatSubCategories = (project) => {
    if (selectedTable === 'realestate_videos') {
      return '-'; // В realestate_videos нет подкатегорий
    } else {
      if (project.desktop_sub_categories && project.desktop_sub_categories.length > 0) {
        return project.desktop_sub_categories.join(', ');
      }
      return project.desktop_sub_category || '-';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = projects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const styles = {
    pageContainer: {
      padding: '30px',
      backgroundColor: '#161719',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
    },
    
    pageTitle: {
      fontSize: '32px',
      fontWeight: '600',
      color: '#ffffff',
      margin: 0,
    },
    
    // Стили для переключателя таблиц
    tableSelectorContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      marginBottom: '30px',
    },
    
    selectorLabel: {
      fontSize: '14px',
      color: '#c4c4c4',
      fontWeight: '500',
    },
    
    tableSwitch: {
      display: 'flex',
      backgroundColor: '#242527',
      borderRadius: '8px',
      padding: '4px',
      width: 'fit-content',
    },
    
    tableOption: {
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      textAlign: 'center',
      minWidth: '180px',
    },
    
    tableOptionActive: {
      backgroundColor: '#3176FF',
      color: '#fff',
    },
    
    tableOptionInactive: {
      backgroundColor: 'transparent',
      color: '#c5c3c3',
    },
    
    stats: {
      display: 'flex',
      gap: '10px',
    },
    
    statBadge: {
      backgroundColor: '#242527',
      color: '#c5c3c3',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
    },
    
    alert: {
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      color: '#ff6b6b',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid rgba(255, 107, 107, 0.3)',
    },
    
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: '#242527',
      borderRadius: '12px',
      border: '1px dashed #5e5e5e',
    },
    
    emptyStateIcon: {
      fontSize: '48px',
      marginBottom: '20px',
    },
    
    emptyStateTitle: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#ffffff',
    },
    
    emptyStateText: {
      color: '#c5c3c3',
      fontSize: '16px',
    },
    
    // Table styles
    projectsTable: {
      width: '100%',
      backgroundColor: '#161719',
      overflow: 'hidden',
    },
    
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: selectedTable === 'realestate_videos' ? '100px 2fr 1fr 120px 120px' : '100px 2fr 1fr 1fr 120px 120px',
      gap: '20px',
      padding: '15px 0',
      borderBottom: '1px solid #333',
      marginBottom: '10px',
      alignItems: 'center',
    },
    
    tableHeaderCell: {
      fontWeight: '600',
      fontSize: '14px',
      color: '#c5c3c3',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    
    projectRow: {
      display: 'grid',
      gridTemplateColumns: selectedTable === 'realestate_videos' ? '100px 2fr 1fr 120px 120px' : '100px 2fr 1fr 1fr 120px 120px',
      gap: '20px',
      padding: '20px 0',
      alignItems: 'center',
      borderBottom: '1px solid #333',
    },
    
    // Cell styles
    photoCell: {
      display: 'flex',
      justifyContent: 'center',
    },
    
    imageContainer: {
      width: '80px',
      height: '80px',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #696969',
      backgroundColor: '#2b2929',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    projectImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    
    imagePlaceholder: {
      color: '#999',
      fontSize: '11px',
      textAlign: 'center',
      padding: '10px',
    },
    
    nameCell: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#ffffff',
    },
    
    categoryCell: {
      fontSize: '14px',
      color: '#c5c3c3',
    },
    
    subCategoryCell: {
      fontSize: '14px',
      color: '#c5c3c3',
    },
    
    dateCell: {
      fontSize: '14px',
      color: '#c5c3c3',
    },
    
    // Button styles
    buttonsCell: {
      display: 'flex',
      gap: '10px',
    },
    
    actionButton: {
      padding: '8px',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '6px',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    
    editButton: {
      border: '1px solid #5e5e5e',
    },
    
    editButtonHover: {
      backgroundColor: 'rgba(94, 94, 94, 0.1)',
      borderColor: '#c5c3c3',
    },
    
    deleteButton: {
      border: '1px solid #ff6b6b',
    },
    
    deleteButtonHover: {
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      borderColor: '#ff6b6b',
    },
    
    // Icon styles
    iconImage: {
      width: '16px',
      height: '16px',
      filter: 'brightness(0) invert(0.8)', // Делаем иконки серыми
      transition: 'filter 0.2s',
    },
    
    deleteIconImage: {
      width: '16px',
      height: '16px',
      filter: 'brightness(0) saturate(100%) invert(52%) sepia(85%) saturate(2931%) hue-rotate(333deg) brightness(103%) contrast(101%)', // Делаем иконки красными
      transition: 'filter 0.2s',
    },
    
    iconHover: {
      filter: 'brightness(0) invert(1)', // Белые иконки при наведении
    },
    
    deleteIconHover: {
      filter: 'brightness(0) saturate(100%) invert(52%) sepia(85%) saturate(3931%) hue-rotate(333deg) brightness(113%) contrast(101%)', // Более яркие красные иконки при наведении
    },
    
    // Pagination styles
    pagination: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '8px',
      marginTop: '30px',
    },
    
    pageNumberButton: {
      padding: '6px 12px',
      backgroundColor: 'transparent',
      color: '#c5c3c3',
      border: '1px solid #a8020200',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      minWidth: '36px',
      textAlign: 'center',
      transition: 'all 0.2s',
    },
    
    currentPageButton: {
      backgroundColor: '#242527',
      color: '#c5c3c3',
      borderColor: '#5e5e5e',
    },
    
    pageNumberButtonHover: {
      backgroundColor: 'rgba(94, 94, 94, 0.1)',
      borderColor: '#c5c3c3',
    },
    
    // Delete modal styles
    deleteModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    
    modalContent: {
      backgroundColor: '#242527',
      padding: '30px',
      borderRadius: '12px',
      maxWidth: '500px',
      width: '100%',
      border: '1px solid #5e5e5e',
    },
    
    modalTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '15px',
    },
    
    modalText: {
      fontSize: '16px',
      color: '#c5c3c3',
      marginBottom: '25px',
      lineHeight: '1.5',
    },
    
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '15px',
    },
    
    cancelButton: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      color: '#c5c3c3',
      border: '1px solid #5e5e5e',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
    },
    
    cancelButtonHover: {
      borderColor: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    
    confirmDeleteButton: {
      padding: '12px 24px',
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      color: '#ff6b6b',
      border: '1px solid #ff6b6b',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
    },
    
    confirmDeleteButtonHover: {
      backgroundColor: 'rgba(255, 107, 107, 0.2)',
    },
    
    // Loading and deleting styles
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      gap: '20px',
    },
    
    loadingText: {
      fontSize: '18px',
      color: '#c5c3c3',
    },
    
    deleteLoadingText: {
      fontSize: '16px',
      color: '#ff6b6b',
      marginBottom: '15px',
    },
    
    // Spinner styles
    spinner: {
      width: '30px',
      height: '30px',
      border: '3px solid rgba(255, 255, 255, 0.1)',
      borderTop: '3px solid #3176FF',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    
    deleteSpinner: {
      width: '24px',
      height: '24px',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      borderTop: '2px solid #ff6b6b',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '10px',
    },
  };

  // Functions for handling hover effects
  const handleMouseEnter = (e, buttonType) => {
    if (buttonType === 'edit') {
      e.target.style.backgroundColor = styles.editButtonHover.backgroundColor;
      e.target.style.borderColor = styles.editButtonHover.borderColor;
      // Меняем цвет иконки при наведении
      const icon = e.target.querySelector('img');
      if (icon) {
        icon.style.filter = styles.iconHover.filter;
      }
    } else if (buttonType === 'delete') {
      e.target.style.backgroundColor = styles.deleteButtonHover.backgroundColor;
      e.target.style.borderColor = styles.deleteButtonHover.borderColor;
      // Меняем цвет иконки при наведении
      const icon = e.target.querySelector('img');
      if (icon) {
        icon.style.filter = styles.deleteIconHover.filter;
      }
    } else if (buttonType === 'pageNumber') {
      if (e.target.getAttribute('data-current') !== 'true') {
        e.target.style.backgroundColor = styles.pageNumberButtonHover.backgroundColor;
        e.target.style.borderColor = styles.pageNumberButtonHover.borderColor;
      }
    } else if (buttonType === 'cancel') {
      e.target.style.borderColor = styles.cancelButtonHover.borderColor;
      e.target.style.backgroundColor = styles.cancelButtonHover.backgroundColor;
    } else if (buttonType === 'confirmDelete') {
      e.target.style.backgroundColor = styles.confirmDeleteButtonHover.backgroundColor;
    } else if (buttonType === 'tableOption') {
      if (e.target.getAttribute('data-active') !== 'true') {
        e.target.style.backgroundColor = 'rgba(94, 94, 94, 0.2)';
        e.target.style.color = '#ffffff';
      }
    }
  };

  const handleMouseLeave = (e, buttonType) => {
    if (buttonType === 'edit') {
      e.target.style.backgroundColor = styles.editButton.backgroundColor;
      e.target.style.borderColor = styles.editButton.border;
      // Возвращаем исходный цвет иконки
      const icon = e.target.querySelector('img');
      if (icon) {
        icon.style.filter = styles.iconImage.filter;
      }
    } else if (buttonType === 'delete') {
      e.target.style.backgroundColor = styles.deleteButton.backgroundColor;
      e.target.style.borderColor = styles.deleteButton.border;
      // Возвращаем исходный цвет иконки
      const icon = e.target.querySelector('img');
      if (icon) {
        icon.style.filter = styles.deleteIconImage.filter;
      }
    } else if (buttonType === 'pageNumber') {
      if (e.target.getAttribute('data-current') !== 'true') {
        e.target.style.backgroundColor = styles.pageNumberButton.backgroundColor;
        e.target.style.borderColor = styles.pageNumberButton.border;
      }
    } else if (buttonType === 'cancel') {
      e.target.style.borderColor = styles.cancelButton.border;
      e.target.style.backgroundColor = styles.cancelButton.backgroundColor;
    } else if (buttonType === 'confirmDelete') {
      e.target.style.backgroundColor = styles.confirmDeleteButton.backgroundColor;
    } else if (buttonType === 'tableOption') {
      if (e.target.getAttribute('data-active') !== 'true') {
        e.target.style.backgroundColor = styles.tableOptionInactive.backgroundColor;
        e.target.style.color = styles.tableOptionInactive.color;
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <div style={styles.loadingText}>Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Our Projects</h2>
        <div style={styles.stats}>
          <span style={styles.statBadge}>Total projects: {projects.length}</span>
        </div>
      </div>

      {/* Переключатель таблиц */}
      <div style={styles.tableSelectorContainer}>
        <div style={styles.selectorLabel}>Select table:</div>
        <div style={styles.tableSwitch}>
          <div
            style={{
              ...styles.tableOption,
              ...(selectedTable === 'realestate_videos' ? styles.tableOptionActive : styles.tableOptionInactive)
            }}
            onClick={() => setSelectedTable('realestate_videos')}
            onMouseEnter={(e) => handleMouseEnter(e, 'tableOption')}
            onMouseLeave={(e) => handleMouseLeave(e, 'tableOption')}
            data-active={selectedTable === 'realestate_videos' ? 'true' : 'false'}
          >
            Real Estate
          </div>
          <div
            style={{
              ...styles.tableOption,
              ...(selectedTable === 'projects_videos' ? styles.tableOptionActive : styles.tableOptionInactive)
            }}
            onClick={() => setSelectedTable('projects_videos')}
            onMouseEnter={(e) => handleMouseEnter(e, 'tableOption')}
            onMouseLeave={(e) => handleMouseLeave(e, 'tableOption')}
            data-active={selectedTable === 'projects_videos' ? 'true' : 'false'}
          >
            Projects
          </div>
        </div>
      </div>

      {error && <div style={styles.alert}>{error}</div>}

      {projects.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>📁</div>
          <h3 style={styles.emptyStateTitle}>No projects yet</h3>
          <p style={styles.emptyStateText}>
            Create your first project by clicking on the "NEW PROJECT" tab
          </p>
        </div>
      ) : (
        <>
          {/* Projects table */}
          <div style={styles.projectsTable}>
            {/* Table headers */}
            <div style={styles.tableHeader}>
              <div style={styles.tableHeaderCell}>PHOTO</div>
              <div style={styles.tableHeaderCell}>NAME</div>
              <div style={styles.tableHeaderCell}>CATEGORY</div>
              {selectedTable === 'projects_videos' && (
                <div style={styles.tableHeaderCell}>SUBCATEGORY</div>
              )}
              <div style={styles.tableHeaderCell}>DATE</div>
              <div style={styles.tableHeaderCell}>ACTIONS</div>
            </div>

            {/* Table rows */}
            {currentProjects.map(project => (
              <div key={project.id} style={styles.projectRow}>
                {/* Photo */}
                <div style={styles.photoCell}>
                  <div style={styles.imageContainer}>
                    {project.preview_image && !imageErrors[project.id] ? (
                      <img
                        src={project.preview_image}
                        alt={project.title}
                        style={styles.projectImage}
                        onError={() => handleImageError(project.id)}
                        loading="lazy"
                      />
                    ) : (
                      <div style={styles.imagePlaceholder}>
                        No image
                      </div>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div style={styles.nameCell}>
                  {project.title}
                </div>

                {/* Category */}
                <div style={styles.categoryCell}>
                  {formatCategories(project)}
                </div>

                {/* Subcategory - только для projects_videos */}
                {selectedTable === 'projects_videos' && (
                  <div style={styles.subCategoryCell}>
                    {formatSubCategories(project)}
                  </div>
                )}

                {/* Date */}
                <div style={styles.dateCell}>
                  {formatDate(project.created_at)}
                </div>

                {/* Buttons with SVG icons */}
                <div style={styles.buttonsCell}>
                  <button
                    onClick={() => handleEdit(project.id)}
                    style={{...styles.actionButton, ...styles.editButton}}
                    onMouseEnter={(e) => handleMouseEnter(e, 'edit')}
                    onMouseLeave={(e) => handleMouseLeave(e, 'edit')}
                    title="Edit"
                  >
                    <img 
                      src={editIcon} 
                      alt="Edit" 
                      style={styles.iconImage}
                    />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(project.id)}
                    style={{...styles.actionButton, ...styles.deleteButton}}
                    onMouseEnter={(e) => handleMouseEnter(e, 'delete')}
                    onMouseLeave={(e) => handleMouseLeave(e, 'delete')}
                    title="Delete"
                  >
                    <img 
                      src={deleteIcon} 
                      alt="Delete" 
                      style={styles.deleteIconImage}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - только номера страниц слева */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  style={{
                    ...styles.pageNumberButton,
                    ...(pageNumber === currentPage ? styles.currentPageButton : {})
                  }}
                  data-current={pageNumber === currentPage ? 'true' : 'false'}
                  onMouseEnter={(e) => pageNumber !== currentPage && handleMouseEnter(e, 'pageNumber')}
                  onMouseLeave={(e) => pageNumber !== currentPage && handleMouseLeave(e, 'pageNumber')}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={styles.deleteModal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Confirm Deletion</h3>
            <p style={styles.modalText}>
              Are you sure you want to delete this project from {selectedTable}? 
              <br /><br />
              <strong>This will also delete all associated images from storage.</strong> 
              <br />
              This action cannot be undone.
            </p>
            
            {deleting && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={styles.deleteSpinner}></div>
                <div style={styles.deleteLoadingText}>Deleting project and images...</div>
              </div>
            )}
            
            <div style={styles.modalActions}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={styles.cancelButton}
                onMouseEnter={(e) => handleMouseEnter(e, 'cancel')}
                onMouseLeave={(e) => handleMouseLeave(e, 'cancel')}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={styles.confirmDeleteButton}
                onMouseEnter={(e) => handleMouseEnter(e, 'confirmDelete')}
                onMouseLeave={(e) => handleMouseLeave(e, 'confirmDelete')}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default OurProjects;