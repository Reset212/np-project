import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/adminAuth';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (login(username, password)) {
      localStorage.setItem('admin_authenticated', 'true');
      navigate('/mpadmin');
    } else {
      setError('Неверные учетные данные');
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <h2>Вход в админ панель</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Логин:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;