export const checkAuth = async (): Promise<boolean> => {
  // Ваша логика проверки авторизации
  return localStorage.getItem('token') !== null;
};

export const checkAdmin = async (): Promise<boolean> => {
  // Ваша логика проверки прав администратора
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'admin';
};