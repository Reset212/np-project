import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
// Импортируем SVG иконки
import editIcon from "../image/Vector-1.svg";
import deleteIcon from "../image/Vector.svg";
import "./font.css";

const OurProjects = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState('realestate_videos');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [deleting, setDeleting] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  // Загрузка проектов с сортировкой по ID
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
        .order('id', { ascending: true });
      
      if (error) throw error;
      
      setProjects(data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Loading error:', err);
      setError(`Error loading projects from ${selectedTable}`);
    } finally {
      setLoading(false);
    }
  };

  // Функция для обновления порядка проектов
  const swapProjectIds = async (projectA, projectB) => {
    try {
      // Временно присваиваем отрицательный ID первому проекту
      const { error: error1 } = await supabase
        .from(selectedTable)
        .update({ 
          id: -projectA.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectA.id);
      
      if (error1) throw error1;
      
      // Присваиваем ID проекта A проекту B
      const { error: error2 } = await supabase
        .from(selectedTable)
        .update({ 
          id: projectA.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectB.id);
      
      if (error2) throw error2;
      
      // Присваиваем ID проекта B временному отрицательному ID
      const { error: error3 } = await supabase
        .from(selectedTable)
        .update({ 
          id: projectB.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', -projectA.id);
      
      if (error3) throw error3;
      
      console.log(`Swapped IDs: ${projectA.id} <-> ${projectB.id}`);
      
    } catch (err) {
      console.error('Error swapping project IDs:', err);
      throw err;
    }
  };

  // Функция для перемещения проекта вверх
  const moveProjectUp = async (index) => {
    if (index === 0 || updatingOrder) return;
    
    try {
      setUpdatingOrder(true);
      
      const projectA = projects[index];
      const projectB = projects[index - 1];
      
      // Меняем ID в базе данных
      await swapProjectIds(projectA, projectB);
      
      // Обновляем UI
      const reorderedProjects = [...projects];
      reorderedProjects[index] = projectB;
      reorderedProjects[index - 1] = projectA;
      
      // Обновляем ID в объектах
      const tempId = projectA.id;
      projectA.id = projectB.id;
      projectB.id = tempId;
      
      setProjects(reorderedProjects);
      
    } catch (err) {
      console.error('Error moving project up:', err);
      setError('Error moving project up. Please try again.');
      await loadProjects();
    } finally {
      setUpdatingOrder(false);
    }
  };

  // Функция для перемещения проекта вниз
  const moveProjectDown = async (index) => {
    if (index === projects.length - 1 || updatingOrder) return;
    
    try {
      setUpdatingOrder(true);
      
      const projectA = projects[index];
      const projectB = projects[index + 1];
      
      // Меняем ID в базе данных
      await swapProjectIds(projectA, projectB);
      
      // Обновляем UI
      const reorderedProjects = [...projects];
      reorderedProjects[index] = projectB;
      reorderedProjects[index + 1] = projectA;
      
      // Обновляем ID в объектах
      const tempId = projectA.id;
      projectA.id = projectB.id;
      projectB.id = tempId;
      
      setProjects(reorderedProjects);
      
    } catch (err) {
      console.error('Error moving project down:', err);
      setError('Error moving project down. Please try again.');
      await loadProjects();
    } finally {
      setUpdatingOrder(false);
    }
  };

  const deleteImageFromStorage = async (imageUrl) => {
    if (!imageUrl) return;
    
    try {
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/project-images\/(.+)/);
      
      if (!pathMatch) {
        console.warn('Cannot extract file path from URL:', imageUrl);
        return;
      }
      
      const filePath = pathMatch[1];
      
      const { error } = await supabase.storage
        .from('project-images')
        .remove([filePath]);
      
      if (error) {
        console.error('Error deleting image from storage:', error);
      }
      
    } catch (err) {
      console.error('Error in deleteImageFromStorage:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      
      const projectToDelete = projects.find(project => project.id === id);
      if (!projectToDelete) {
        throw new Error('Project not found');
      }
      
      // Удаляем изображения
      if (projectToDelete.preview_image) {
        await deleteImageFromStorage(projectToDelete.preview_image);
      }
      
      if (projectToDelete.mobile_preview_image) {
        await deleteImageFromStorage(projectToDelete.mobile_preview_image);
      }
      
      // Удаляем проект
      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Перезагружаем проекты
      await loadProjects();
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

  const formatSubCategories = (project) => {
    if (selectedTable === 'realestate_videos') {
      return '-';
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
      border: 'none',
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
    
    orderInfo: {
      backgroundColor: 'rgba(49, 118, 255, 0.1)',
      color: '#3176FF',
      padding: '12px 20px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      border: '1px solid rgba(49, 118, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
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
    
    projectsTable: {
      width: '100%',
      backgroundColor: '#161719',
      overflow: 'hidden',
    },
    
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: selectedTable === 'realestate_videos' 
        ? '80px 80px 2fr 1fr 1fr 120px 120px' 
        : '80px 80px 2fr 1fr 1fr 1fr 120px 120px',
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
      gridTemplateColumns: selectedTable === 'realestate_videos' 
        ? '80px 80px 2fr 1fr 1fr 120px 120px' 
        : '80px 80px 2fr 1fr 1fr 1fr 120px 120px',
      gap: '20px',
      padding: '15px 0',
      alignItems: 'center',
      borderBottom: '1px solid #333',
      transition: 'all 0.2s',
      backgroundColor: '#161719',
    },
    
    orderCell: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      alignItems: 'center',
    },
    
    orderButton: {
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: '1px solid #5e5e5e',
      borderRadius: '4px',
      color: '#c5c3c3',
      cursor: 'pointer',
      fontSize: '14px',
      padding: 0,
      transition: 'all 0.2s',
    },
    
    orderButtonDisabled: {
      opacity: 0.3,
      cursor: 'not-allowed',
    },
    
    idCell: {
      fontSize: '14px',
      color: '#c5c3c3',
      fontWeight: '500',
    },
    
    photoCell: {
      display: 'flex',
      // justifyContent: 'center',
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
    
    buttonsCell: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-start',
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
    
    deleteButton: {
      border: '1px solid #ff6b6b',
    },
    
    iconImage: {
      width: '16px',
      height: '16px',
      filter: 'brightness(0) invert(0.8)',
      transition: 'filter 0.2s',
    },
    
    deleteIconImage: {
      width: '16px',
      height: '16px',
      filter: 'brightness(0) saturate(100%) invert(52%) sepia(85%) saturate(2931%) hue-rotate(333deg) brightness(103%) contrast(101%)',
      transition: 'filter 0.2s',
    },
    
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
      border: '1px solid transparent',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      minWidth: '36px',
      textAlign: 'center',
      transition: 'all 0.2s',
    },
    
    currentPageButton: {
      backgroundColor: '#242527',
      border: '1px solid #5e5e5e',
    },
    
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

  // Обработчики hover эффектов
  const handleMouseEnter = (e, buttonType) => {
    if (buttonType === 'edit') {
      e.target.style.backgroundColor = 'rgba(94, 94, 94, 0.1)';
      e.target.style.borderColor = '#c5c3c3';
      const icon = e.target.querySelector('img');
      if (icon) icon.style.filter = 'brightness(0) invert(1)';
    } else if (buttonType === 'delete') {
      e.target.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
      e.target.style.borderColor = '#ff6b6b';
      const icon = e.target.querySelector('img');
      if (icon) icon.style.filter = 'brightness(0) saturate(100%) invert(52%) sepia(85%) saturate(3931%) hue-rotate(333deg) brightness(113%) contrast(101%)';
    } else if (buttonType === 'orderUp' || buttonType === 'orderDown') {
      if (!e.target.disabled) {
        e.target.style.backgroundColor = 'rgba(94, 94, 94, 0.2)';
        e.target.style.borderColor = '#c5c3c3';
        e.target.style.color = '#ffffff';
      }
    } else if (buttonType === 'tableOption') {
      if (e.target.getAttribute('data-active') !== 'true') {
        e.target.style.backgroundColor = 'rgba(94, 94, 94, 0.2)';
      }
    }
  };

  const handleMouseLeave = (e, buttonType) => {
    if (buttonType === 'edit') {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.borderColor = '#5e5e5e';
      const icon = e.target.querySelector('img');
      if (icon) icon.style.filter = 'brightness(0) invert(0.8)';
    } else if (buttonType === 'delete') {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.borderColor = '#ff6b6b';
      const icon = e.target.querySelector('img');
      if (icon) icon.style.filter = 'brightness(0) saturate(100%) invert(52%) sepia(85%) saturate(2931%) hue-rotate(333deg) brightness(103%) contrast(101%)';
    } else if (buttonType === 'orderUp' || buttonType === 'orderDown') {
      if (!e.target.disabled) {
        e.target.style.backgroundColor = 'transparent';
        e.target.style.borderColor = '#5e5e5e';
        e.target.style.color = '#c5c3c3';
      }
    } else if (buttonType === 'tableOption') {
      if (e.target.getAttribute('data-active') !== 'true') {
        e.target.style.backgroundColor = 'transparent';
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
          <div style={styles.projectsTable}>
            {/* Table headers */}
            <div style={styles.tableHeader}>
              <div style={styles.tableHeaderCell}>ORDER</div>
              <div style={styles.tableHeaderCell}>ID</div>
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
            {currentProjects.map((project) => {
              const globalIndex = projects.findIndex(p => p.id === project.id);
              
              return (
                <div
                  key={project.id}
                  className="project-row"
                  style={styles.projectRow}
                >
                  {/* Order buttons */}
                  <div style={styles.orderCell}>
                    <button
                      onClick={() => moveProjectUp(globalIndex)}
                      style={{
                        ...styles.orderButton,
                        ...((globalIndex === 0 || updatingOrder) ? styles.orderButtonDisabled : {})
                      }}
                      onMouseEnter={(e) => handleMouseEnter(e, 'orderUp')}
                      onMouseLeave={(e) => handleMouseLeave(e, 'orderUp')}
                      disabled={globalIndex === 0 || updatingOrder}
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveProjectDown(globalIndex)}
                      style={{
                        ...styles.orderButton,
                        ...((globalIndex === projects.length - 1 || updatingOrder) ? styles.orderButtonDisabled : {})
                      }}
                      onMouseEnter={(e) => handleMouseEnter(e, 'orderDown')}
                      onMouseLeave={(e) => handleMouseLeave(e, 'orderDown')}
                      disabled={globalIndex === projects.length - 1 || updatingOrder}
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>

                  {/* ID */}
                  <div style={styles.idCell}>
                    #{project.id}
                  </div>

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

                  {/* Buttons - ACTIONS в конце строки */}
                  <div style={styles.buttonsCell}>
                    <button
                      onClick={() => handleEdit(project.id)}
                      style={{...styles.actionButton, ...styles.editButton}}
                      onMouseEnter={(e) => handleMouseEnter(e, 'edit')}
                      onMouseLeave={(e) => handleMouseLeave(e, 'edit')}
                      title="Edit"
                      disabled={updatingOrder}
                    >
                      <img src={editIcon} alt="Edit" style={styles.iconImage} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(project.id)}
                      style={{...styles.actionButton, ...styles.deleteButton}}
                      onMouseEnter={(e) => handleMouseEnter(e, 'delete')}
                      onMouseLeave={(e) => handleMouseLeave(e, 'delete')}
                      title="Delete"
                      disabled={updatingOrder}
                    >
                      <img src={deleteIcon} alt="Delete" style={styles.deleteIconImage} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
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
                  onMouseEnter={(e) => {
                    if (pageNumber !== currentPage) {
                      e.target.style.backgroundColor = 'rgba(94, 94, 94, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pageNumber !== currentPage) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                  disabled={updatingOrder}
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
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#5e5e5e';
                }}
                disabled={deleting || updatingOrder}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={styles.confirmDeleteButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                }}
                disabled={deleting || updatingOrder}
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
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #242527;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #5e5e5e;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #7a7a7a;
        }
      `}</style>
    </div>
  );
};

export default OurProjects;