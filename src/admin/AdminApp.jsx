import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, logout } from '../utils/adminAuth';
import AdminLogin from './AdminLogin';
import VideoList from './VideoList';
import './AdminApp.css';

const AdminApp = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Проверяем аутентификацию при загрузке
    const auth = isAuthenticated();
    setAuthenticated(auth);
    
    // Если пользователь не аутентифицирован и не на странице логина, перенаправляем
    if (!auth && location.pathname !== '/mpadmin/login') {
      navigate('/mpadmin/login');
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    navigate('/mpadmin/login');
  };

  if (!authenticated && location.pathname !== '/mpadmin/login') {
    return null; // Или loading spinner
  }

  return (
    <div className="admin-app">
      {authenticated && (
        <header className="admin-header">
          <h1>Админ Панель MP Admin</h1>
          <button onClick={handleLogout} className="logout-button">
            Выйти
          </button>
        </header>
      )}
      
      <main className="admin-main">
        <Routes>
          <Route path="/" element={
            authenticated ? <VideoList /> : <AdminLogin onLogin={() => setAuthenticated(true)} />
          } />
          <Route path="/login" element={<AdminLogin onLogin={() => setAuthenticated(true)} />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminApp;