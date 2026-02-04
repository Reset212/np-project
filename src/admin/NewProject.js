import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const NewProject = () => {
  const { id } = useParams();
  const location = useLocation();
  const isEditing = !!id;
  
  // Состояние для выбора таблицы
  const [selectedTable, setSelectedTable] = useState('realestate_videos');
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const desktopFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);
  
  // Добавляем состояние для хранения оригинальных имен файлов
  const [fileNames, setFileNames] = useState({
    desktop: '',
    mobile: ''
  });
  
  // Форма для realestate_videos
  const [realestateFormData, setRealestateFormData] = useState({
    title: '',
    description: '',
    vimeo_id: '',
    preview_image: '',
    mobile_preview_image: '',
    category: '',
    mobile_breakpoint: 450,
  });
  
  // Форма для projects_videos
  const [projectsFormData, setProjectsFormData] = useState({
    title: '',
    description: '',
    vimeo_id: '',
    preview_image: '',
    mobile_preview_image: '',
    desktop_main_categories: [],
    desktop_sub_categories: [],
    mobile_categories: [],
    mobile_breakpoint: 450,
  });
  
  const [categoryPairs, setCategoryPairs] = useState([{ main: '', sub: '' }]);
  
  // Категории для realestate_videos
  const realestateCategories = [
    "VIDEO | 3D",
    "EVENTS | LAUNCHES", 
    "HYPE CAMPAIGN",
    "CELEBRITY APPEARANCES"
  ];
  
  // Категории для projects_videos
  const availableMainCategories = [
    "VIDEO",
    "HYPE & MARKETING", 
    "EVENTS & LAUNCHES",
    "3D"
  ];
  
  const availableSubCategories = [
    "Real Estate development",
    "Beauty", 
    "Commercial",
    "Betting"
  ];

  // При изменении ID загружаем данные
  useEffect(() => {
    console.log('Editing ID changed:', id);
    
    if (id) {
      loadProjectData(id);
    } else {
      resetForm();
    }
  }, [id]);

  // При изменении таблицы сбрасываем форму
  useEffect(() => {
    if (!isEditing) {
      resetForm();
    }
  }, [selectedTable]);

  const loadProjectData = async (projectId) => {
    try {
      console.log('Loading project data for ID:', projectId);
      setLoadingData(true);
      
      // Пытаемся загрузить из выбранной таблицы
      const { data, error } = await supabase
        .from(selectedTable)
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) {
        // Если ошибка, пробуем загрузить из другой таблицы
        console.log('Trying to load from other table...');
        const otherTable = selectedTable === 'realestate_videos' ? 'projects_videos' : 'realestate_videos';
        const { data: otherData, error: otherError } = await supabase
          .from(otherTable)
          .select('*')
          .eq('id', projectId)
          .single();
          
        if (otherError) throw otherError;
        
        // Переключаемся на таблицу, где найден проект
        setSelectedTable(otherTable);
        processLoadedData(otherData, otherTable);
      } else {
        processLoadedData(data, selectedTable);
      }
      
    } catch (err) {
      console.error('Loading error:', err);
      setError('Error loading project data');
    } finally {
      setLoadingData(false);
    }
  };

  const processLoadedData = (data, tableName) => {
    console.log('Processing data for table:', tableName, data);
    
    if (data) {
      if (tableName === 'realestate_videos') {
        setRealestateFormData({
          title: data.title || '',
          description: data.description || '',
          vimeo_id: data.vimeo_id || '',
          preview_image: data.preview_image || '',
          mobile_preview_image: data.mobile_preview_image || '',
          category: data.category || '',
          mobile_breakpoint: data.mobile_breakpoint || 450,
        });
      } else {
        // Для projects_videos
        const pairs = [];
        const mainCats = data.desktop_main_categories || [];
        const subCats = data.desktop_sub_categories || [];
        
        for (let i = 0; i < Math.max(mainCats.length, subCats.length); i++) {
          pairs.push({
            main: mainCats[i] || '',
            sub: subCats[i] || ''
          });
        }
        
        if (pairs.length === 0 && (data.desktop_main_category || data.desktop_sub_category)) {
          pairs.push({ 
            main: data.desktop_main_category || '', 
            sub: data.desktop_sub_category || '' 
          });
        }
        
        if (pairs.length === 0) {
          pairs.push({ main: '', sub: '' });
        }
        
        setCategoryPairs(pairs);
        setProjectsFormData({
          title: data.title || '',
          description: data.description || '',
          vimeo_id: data.vimeo_id || '',
          preview_image: data.preview_image || '',
          mobile_preview_image: data.mobile_preview_image || '',
          desktop_main_categories: mainCats,
          desktop_sub_categories: subCats,
          mobile_categories: data.mobile_categories || [],
          mobile_breakpoint: data.mobile_breakpoint || 450,
        });
      }
      
      // Устанавливаем имена файлов
      setFileNames({
        desktop: data.preview_image ? 'Uploaded image' : '',
        mobile: data.mobile_preview_image ? 'Uploaded image' : ''
      });
    }
  };

  const resetForm = () => {
    console.log('Resetting form');
    if (selectedTable === 'realestate_videos') {
      setRealestateFormData({
        title: '',
        description: '',
        vimeo_id: '',
        preview_image: '',
        mobile_preview_image: '',
        category: '',
        mobile_breakpoint: 450,
      });
    } else {
      setProjectsFormData({
        title: '',
        description: '',
        vimeo_id: '',
        preview_image: '',
        mobile_preview_image: '',
        desktop_main_categories: [],
        desktop_sub_categories: [],
        mobile_categories: [],
        mobile_breakpoint: 450,
      });
      setCategoryPairs([{ main: '', sub: '' }]);
    }
    setFileNames({
      desktop: '',
      mobile: ''
    });
  };

  const uploadImageToSupabase = async (file, folder = 'desktop') => {
    try {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        throw new Error('Only images are supported (JPEG, PNG, WEBP, GIF)');
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File size should not exceed 5MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      }
      
      const originalFileName = file.name;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      console.log('Uploading image:', filePath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);
      
      console.log('Image uploaded:', publicUrl);
      
      return { url: publicUrl, fileName: originalFileName };
      
    } catch (err) {
      console.error('Image upload error:', err);
      throw err;
    }
  };

  const handleDesktopImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingDesktop(true);
      setError('');
      
      const result = await uploadImageToSupabase(file, 'desktop');
      
      if (selectedTable === 'realestate_videos') {
        setRealestateFormData(prev => ({
          ...prev,
          preview_image: result.url
        }));
      } else {
        setProjectsFormData(prev => ({
          ...prev,
          preview_image: result.url
        }));
      }
      
      setFileNames(prev => ({
        ...prev,
        desktop: result.fileName
      }));
      
    } catch (err) {
      console.error('Error:', err);
      setError(`Image upload error: ${err.message}`);
    } finally {
      setUploadingDesktop(false);
      e.target.value = '';
    }
  };

  const handleMobileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingMobile(true);
      setError('');
      
      const result = await uploadImageToSupabase(file, 'mobile');
      
      if (selectedTable === 'realestate_videos') {
        setRealestateFormData(prev => ({
          ...prev,
          mobile_preview_image: result.url
        }));
      } else {
        setProjectsFormData(prev => ({
          ...prev,
          mobile_preview_image: result.url
        }));
      }
      
      setFileNames(prev => ({
        ...prev,
        mobile: result.fileName
      }));
      
    } catch (err) {
      console.error('Error:', err);
      setError(`Image upload error: ${err.message}`);
    } finally {
      setUploadingMobile(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (imageType) => {
    if (selectedTable === 'realestate_videos') {
      setRealestateFormData(prev => ({
        ...prev,
        [imageType === 'desktop' ? 'preview_image' : 'mobile_preview_image']: ''
      }));
    } else {
      setProjectsFormData(prev => ({
        ...prev,
        [imageType === 'desktop' ? 'preview_image' : 'mobile_preview_image']: ''
      }));
    }
    
    setFileNames(prev => ({
      ...prev,
      [imageType]: ''
    }));
    
    if (imageType === 'desktop' && desktopFileInputRef.current) {
      desktopFileInputRef.current.value = '';
    } else if (mobileFileInputRef.current) {
      mobileFileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (selectedTable === 'realestate_videos') {
      setRealestateFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setProjectsFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRealestateCategoryChange = (e) => {
    setRealestateFormData(prev => ({
      ...prev,
      category: e.target.value
    }));
  };

  const handleCategoryPairChange = (index, field, value) => {
    const newPairs = [...categoryPairs];
    newPairs[index][field] = value;
    setCategoryPairs(newPairs);
  };

  const addCategoryPair = () => {
    setCategoryPairs([...categoryPairs, { main: '', sub: '' }]);
  };

  const removeCategoryPair = (index) => {
    if (categoryPairs.length > 1) {
      const newPairs = categoryPairs.filter((_, i) => i !== index);
      setCategoryPairs(newPairs);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (selectedTable === 'realestate_videos') {
        // Валидация для realestate_videos
        if (!realestateFormData.title.trim()) {
          throw new Error('Enter project name');
        }
        
        if (!realestateFormData.vimeo_id.trim()) {
          throw new Error('Enter Vimeo ID');
        }
        
        if (!realestateFormData.preview_image) {
          throw new Error('Upload desktop preview');
        }
        
        if (!realestateFormData.category) {
          throw new Error('Select category');
        }
        
        const projectData = {
          ...realestateFormData,
          updated_at: new Date().toISOString(),
        };
        
        console.log('Saving to realestate_videos:', projectData);
        
        if (isEditing && id) {
          const { data, error } = await supabase
            .from('realestate_videos')
            .update(projectData)
            .eq('id', id)
            .select();
          
          if (error) throw error;
          setSuccess('Project successfully updated!');
        } else {
          projectData.created_at = new Date().toISOString();
          
          const { data, error } = await supabase
            .from('realestate_videos')
            .insert([projectData])
            .select();
          
          if (error) throw error;
          setSuccess('Project successfully created!');
          resetForm();
        }
      } else {
        // Валидация для projects_videos
        if (!projectsFormData.title.trim()) {
          throw new Error('Enter project name');
        }
        
        if (!projectsFormData.vimeo_id.trim()) {
          throw new Error('Enter Vimeo ID');
        }
        
        if (!projectsFormData.preview_image) {
          throw new Error('Upload desktop preview');
        }
        
        const validPairs = categoryPairs.filter(pair => pair.main && pair.sub);
        if (validPairs.length === 0) {
          throw new Error('Add at least one category pair');
        }
        
        const mainCategories = validPairs.map(pair => pair.main);
        const subCategories = validPairs.map(pair => pair.sub);
        
        const desktop_main_category = mainCategories[0] || '';
        const desktop_sub_category = subCategories[0] || '';
        
        const projectData = {
          ...projectsFormData,
          desktop_main_categories: mainCategories,
          desktop_sub_categories: subCategories,
          desktop_main_category,
          desktop_sub_category,
          updated_at: new Date().toISOString(),
        };
        
        console.log('Saving to projects_videos:', projectData);
        
        if (isEditing && id) {
          const { data, error } = await supabase
            .from('projects_videos')
            .update(projectData)
            .eq('id', id)
            .select();
          
          if (error) throw error;
          setSuccess('Project successfully updated!');
        } else {
          projectData.created_at = new Date().toISOString();
          
          const { data, error } = await supabase
            .from('projects_videos')
            .insert([projectData])
            .select();
          
          if (error) throw error;
          setSuccess('Project successfully created!');
          resetForm();
        }
      }
      
    } catch (err) {
      console.error('Save error:', err);
      setError('Project save error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '80%',
      margin: '0 40px ',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
    },
    
    header: {
      fontSize: '32px',
      fontWeight: '600',
      marginBottom: '50px',
      color: '#ffffff',
    },
    
    // Стили для переключателя таблиц
    tableSelector: {
      marginBottom: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
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
      minWidth: '200px',
    },
    
    tableOptionActive: {
      backgroundColor: '#3176FF',
      color: '#fff',
    },
    
    tableOptionInactive: {
      backgroundColor: 'transparent',
      color: '#c5c3c3',
    },
    
    section: {
      marginBottom: '40px',
    },
    
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '25px',
    },
    
    sectionNumber: {
      backgroundColor: '#242527',
      color: '#fff',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: '600',
      marginRight: '15px',
      flexShrink: 0,
    },
    
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#ffffff',
    },
    
    twoColumnContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '40px',
    },
    
    formGroup: {
      marginBottom: '25px',
    },
    
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      color: '#c4c4c4',
      fontWeight: '500',
    },
    
    input: {
      width: '100%',
      padding: '12px 15px',
      fontSize: '14px',
      border: 'none',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottom: '1px solid #5e5e5e !important',
      color: '#dfdede',
      backgroundColor: 'transparent',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    
    select: {
      width: '100%',
      padding: '12px 15px',
      fontSize: '14px',
      border: 'none',
      borderBottom: '1px solid #5e5e5e',
      color: '#dfdede',
      backgroundColor: '#161719',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23dfdede' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      backgroundSize: '16px',
      outline: 'none',
      borderRadius: '0',
    },
    
    textarea: {
      display: 'unset !important',
      width: '100%',
      padding: '12px 15px',
      fontSize: '14px',
      border: 'none',
      borderBottom: '1px solid #5e5e5e',
      backgroundColor: 'transparent',
      boxSizing: 'border-box',
      outline: 'none',
      color: '#dfdede',
      transition: 'border-color 0.2s',
      minHeight: '60px',
      resize: 'vertical',
      fontFamily: 'inherit',
    },
    
    charCounter: {
      textAlign: 'right',
      fontSize: '13px',
      color: '#666',
    },
    
    charCounter1: {
      borderTop: '1px solid #5e5e5e',
      textAlign: 'right',
      fontSize: '13px',
      color: '#666',
    },
    
    photoRowContainer: {
      display: 'flex',
      gap: '40px',
      alignItems: 'flex-start',
      width: '100%',
    },
    
    photoField: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    
    photoHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '10px',
      borderBottom: '1px solid #5e5e5e',
      position: 'relative',
    },
    
    photoTitleContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      maxWidth: 'calc(100% - 40px)',
    },
    
    photoTitle: {
      fontSize: '14px',
      color: '#c5c3c3',
      fontWeight: '500',
    },
    
    fileName: {
      fontSize: '13px',
      color: '#8a8a8a',
      fontStyle: 'italic',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
    },
    
    addButton: {
      backgroundColor: '#c5c5c53a',
      color: '#fff',
      border: 'none',
      borderRadius: '60px',
      width: '30px',
      height: '30px',
      fontSize: '20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'background-color 0.2s',
    },
    
    previewBox: {
      width: '100px',
      height: '100px',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #696969',
      backgroundColor: '#2b2929',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '10px',
    },
    
    previewImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    
    previewPlaceholder: {
      color: '#999',
      fontSize: '12px',
      textAlign: 'center',
      padding: '10px',
    },
    
    categorySection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '25px',
    },
    
    box: {
      display: 'flex',
      flexDirection: 'row',
      gap: '25px',
    },
    
    categoryPairColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    
    categorySelect: {
      width: '100%',
      padding: '12px 15px',
      fontSize: '14px',
      border: 'none',
      borderBottom: '1px solid #5e5e5e',
      color: '#dfdede',
      backgroundColor: '#161719',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23dfdede' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      backgroundSize: '16px',
      outline: 'none',
      borderRadius: '0',
    },
    
    addCategoryContainer: {
      marginTop: '20px',
    },
    
    addCategoryButton: {
      padding: '12px 20px',
      backgroundColor: 'transparent',
      color: '#c5c3c3',
      border: '1px dashed #5e5e5e',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    
    removeCategoryButton: {
      padding: '10px 15px',
      backgroundColor: 'transparent',
      color: '#ff6b6b',
      border: '1px solid #ff6b6b',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s',
      marginTop: '10px',
    },
    
    formActions: {
      display: 'flex',
      gap: '20px',
    },
    
    saveButton: {
      backgroundColor: '#3176FF',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '16px 48px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    
    resetButton: {
      backgroundColor: 'transparent',
      color: '#ffffff',
      border: '1px solid #5e5e5e',
      borderRadius: '8px',
      padding: '16px 48px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    
    errorMessage: {
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      color: '#ff6b6b',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      border: '1px solid rgba(255, 107, 107, 0.3)',
    },
    
    successMessage: {
      backgroundColor: 'rgba(0, 255, 0, 0.1)',
      color: '#51cf66',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      border: '1px solid rgba(81, 207, 102, 0.3)',
    },
    
    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #3176FF',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    
    uploadingIndicator: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#666',
      gap: '8px',
    },
    
    smallSpinner: {
      width: '16px',
      height: '16px',
      border: '2px solid #f3f3f3',
      borderTop: '2px solid #3176FF',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    
    removeButton: {
      marginTop: '10px',
      padding: '6px 12px',
      backgroundColor: 'transparent',
      color: '#ff6b6b',
      border: '1px solid #ff6b6b',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
  };

  // Получаем текущие данные формы
  const currentFormData = selectedTable === 'realestate_videos' ? realestateFormData : projectsFormData;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>
        {isEditing ? 'Edit Project' : 'Create Project'}
      </h1>
      
      {error && <div style={styles.errorMessage}>{error}</div>}
      {success && <div style={styles.successMessage}>{success}</div>}
      
      {/* Переключатель таблиц */}
      <div style={styles.tableSelector}>
        <div style={styles.selectorLabel}>Select table for project:</div>
        <div style={styles.tableSwitch}>
          <div
            style={{
              ...styles.tableOption,
              ...(selectedTable === 'realestate_videos' ? styles.tableOptionActive : styles.tableOptionInactive)
            }}
            onClick={() => setSelectedTable('realestate_videos')}
          >
            Real Estate
          </div>
          <div
            style={{
              ...styles.tableOption,
              ...(selectedTable === 'projects_videos' ? styles.tableOptionActive : styles.tableOptionInactive)
            }}
            onClick={() => setSelectedTable('projects_videos')}
          >
            Projects
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Секции 1 и 2 в двухколоночном макете */}
        <div style={styles.twoColumnContainer}>
          {/* Секция 1: Name Project */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>1</div>
              <div style={styles.sectionTitle}>Name Project</div>
            </div>
            
            <div style={styles.formGroup}>
              <input
                type="text"
                name="title"
                value={currentFormData.title}
                onChange={handleInputChange}
                placeholder="Name"
                required
                style={styles.input}
                disabled={loadingData}
              />
              <div style={styles.charCounter1}>
                {currentFormData.title.length} / 40
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <textarea
                name="description"
                value={currentFormData.description}
                onChange={handleInputChange}
                placeholder="Description"
                required
                style={styles.textarea}
                disabled={loadingData}
              />
              <div style={styles.charCounter}>
                {currentFormData.description.length} / 200
              </div>
            </div>
          </div>

          {/* Секция 2: Photo Preloader */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>2</div>
              <div style={styles.sectionTitle}>Photo Preloader</div>
            </div>
            
            <div style={styles.photoRowContainer}>
              <div style={styles.photoField}>
                <div style={styles.photoHeader}>
                  <div style={styles.photoTitleContainer}>
                    <div style={styles.photoTitle}>Desktop</div>
                    {fileNames.desktop && (
                      <div style={styles.fileName} title={fileNames.desktop}>
                        {fileNames.desktop}
                      </div>
                    )}
                  </div>
                  <input
                    ref={desktopFileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif"
                    onChange={handleDesktopImageUpload}
                    style={{ display: 'none' }}
                    id="desktop-upload"
                  />
                  <label 
                    htmlFor="desktop-upload" 
                    style={styles.addButton}
                    title="Upload desktop image"
                  >
                    {uploadingDesktop ? (
                      <div style={styles.smallSpinner}></div>
                    ) : currentFormData.preview_image ? '✓' : '+'}
                  </label>
                </div>
                
                <div style={styles.previewBox}>
                  {currentFormData.preview_image ? (
                    <img 
                      src={currentFormData.preview_image} 
                      alt="Desktop preview" 
                      style={styles.previewImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '<div style="color:#999; font-size:12px; padding:10px; text-align:center">Image failed to load</div>';
                      }}
                    />
                  ) : (
                    <div style={styles.previewPlaceholder}>
                      No image
                    </div>
                  )}
                </div>
                
                {currentFormData.preview_image && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('desktop')}
                    style={styles.removeButton}
                    disabled={uploadingDesktop}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div style={styles.photoField}>
                <div style={styles.photoHeader}>
                  <div style={styles.photoTitleContainer}>
                    <div style={styles.photoTitle}>Mobile</div>
                    {fileNames.mobile && (
                      <div style={styles.fileName} title={fileNames.mobile}>
                        {fileNames.mobile}
                      </div>
                    )}
                  </div>
                  <input
                    ref={mobileFileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif"
                    onChange={handleMobileImageUpload}
                    style={{ display: 'none' }}
                    id="mobile-upload"
                  />
                  <label 
                    htmlFor="mobile-upload" 
                    style={styles.addButton}
                    title="Upload mobile image"
                  >
                    {uploadingMobile ? (
                      <div style={styles.smallSpinner}></div>
                    ) : currentFormData.mobile_preview_image ? '✓' : '+'}
                  </label>
                </div>
                
                <div style={styles.previewBox}>
                  {currentFormData.mobile_preview_image ? (
                    <img 
                      src={currentFormData.mobile_preview_image} 
                      alt="Mobile preview" 
                      style={styles.previewImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '<div style="color:#999; font-size:12px; padding:10px; text-align:center">Image failed to load</div>';
                      }}
                    />
                  ) : (
                    <div style={styles.previewPlaceholder}>
                      No image
                    </div>
                  )}
                </div>
                
                {currentFormData.mobile_preview_image && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('mobile')}
                    style={styles.removeButton}
                    disabled={uploadingMobile}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Секции 3 и 4 в двухколоночном макете */}
        <div style={styles.twoColumnContainer}>
          {/* Секция 3: Link Vimeo */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>3</div>
              <div style={styles.sectionTitle}>Link Vimeo</div>
            </div>
            
            <div style={styles.formGroup}>
              <input
                type="text"
                name="vimeo_id"
                value={currentFormData.vimeo_id}
                onChange={handleInputChange}
                placeholder="Enter Vimeo ID (numeric)"
                required
                style={styles.input}
                disabled={loadingData}
              />
              <div style={{ borderTop: '1px solid #5e5e5e', fontSize: '12px', color: '#c5c3c3', height: '50px' }}>
                <br></br>
                Enter numeric ID from Vimeo URL (e.g., 123456789)
              </div>
            </div>
          </div>

          {/* Секция 4: Group - разная для каждой таблицы */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>4</div>
              <div style={styles.sectionTitle}>Group</div>
            </div>
            
            {selectedTable === 'realestate_videos' ? (
              // Форма для realestate_videos - одна категория
              <div style={styles.formGroup}>
                <select
                  value={realestateFormData.category}
                  onChange={handleRealestateCategoryChange}
                  style={styles.select}
                  disabled={loadingData}
                  required
                >
                  <option value="">Select category</option>
                  {realestateCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            ) : (
              // Форма для projects_videos - пары категорий
              <div style={styles.categorySection}>
                {categoryPairs.map((pair, index) => (
                  <div key={index} style={styles.categoryPairColumn}>
                    <div style={styles.box}>
                      <select
                        value={pair.main}
                        onChange={(e) => handleCategoryPairChange(index, 'main', e.target.value)}
                        style={styles.categorySelect}
                        disabled={loadingData}
                        required
                      >
                        <option value="">Select main category</option>
                        {availableMainCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      
                      <select
                        value={pair.sub}
                        onChange={(e) => handleCategoryPairChange(index, 'sub', e.target.value)}
                        style={styles.categorySelect}
                        disabled={loadingData}
                        required
                      >
                        <option value="">Select subcategory</option>
                        {availableSubCategories.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                    {categoryPairs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCategoryPair(index)}
                        style={styles.removeCategoryButton}
                        disabled={loadingData}
                      >
                        Remove this pair
                      </button>
                    )}
                  </div>
                ))}
                
                <div style={styles.addCategoryContainer}>
                  <button
                    type="button"
                    onClick={addCategoryPair}
                    style={styles.addCategoryButton}
                    disabled={loadingData}
                  >
                    + Add Another Category Pair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Кнопки действий */}
        <div style={styles.formActions}>
          <button
            type="submit"
            style={styles.saveButton}
            disabled={loading || loadingData || uploadingDesktop || uploadingMobile}
            onMouseEnter={(e) => {
              if (!loading && !loadingData && !uploadingDesktop && !uploadingMobile) {
                e.target.style.backgroundColor = '#2559cc';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !loadingData && !uploadingDesktop && !uploadingMobile) {
                e.target.style.backgroundColor = '#3176FF';
              }
            }}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Project' : 'Save Project'}
          </button>
          
          <button
            type="button"
            style={styles.resetButton}
            onClick={resetForm}
            disabled={loading || loadingData}
            onMouseEnter={(e) => {
              if (!loading && !loadingData) {
                e.target.style.borderColor = '#ffffff';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !loadingData) {
                e.target.style.borderColor = '#5e5e5e';
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            Reset
          </button>
        </div>
      </form>
      
      {(loading || loadingData || uploadingDesktop || uploadingMobile) && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner}></div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus, textarea:focus, select:focus {
          border-bottom-color: #3176FF !important;
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        label[for*="upload"]:hover:not(:disabled) {
          background-color: #5e5e5e !important;
        }
        
        .add-category-button:hover:not(:disabled) {
          border-color: #3176FF;
          color: #3176FF;
        }
        
        select {
          background-color: #161719 !important;
          color: #dfdede !important;
        }
        
        option {
          background-color: #161719 !important;
          color: #dfdede !important;
        }
        
        select option {
          background-color: #161719 !important;
          color: #dfdede !important;
          padding: 10px !important;
        }
        
        select option:hover,
        select option:focus,
        select option:checked {
          background-color: #242527 !important;
          color: #ffffff !important;
        }
        
        select::-ms-expand {
          display: none;
        }
        
        @-moz-document url-prefix() {
          select {
            background-color: #161719 !important;
            color: #dfdede !important;
          }
          
          select option {
            background-color: #161719 !important;
            color: #dfdede !important;
          }
        }
        
        @media (max-width: 768px) {
          .two-column-container {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          
          .photo-row-container {
            flex-direction: column !important;
            gap: 30px !important;
          }
          
          .form-actions {
            flex-direction: column !important;
            gap: 15px !important;
          }
          
          .save-button, .reset-button {
            width: 100% !important;
          }
          
          .table-switch {
            flex-direction: column !important;
            width: 100% !important;
          }
          
          .table-option {
            min-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NewProject;