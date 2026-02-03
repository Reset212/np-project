// Простая аутентификация для админки
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'mpadmin123'; // Измените на свой пароль

export const login = (username, password) => {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
};

export const isAuthenticated = () => {
  return localStorage.getItem('admin_authenticated') === 'true';
};

export const logout = () => {
  localStorage.removeItem('admin_authenticated');
};