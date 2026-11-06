import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../../../../components/Seo/Seo';
import { useAuthStore } from '../../authStore';
import './Login.css';
import { login } from '../../api';
import { getErrorMessage } from '../../../../api/errors';

const Login = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const user = await fetchUser();
      if (user?.role === 'root' || user?.role === 'moderator') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="login-container">
      <Seo title={t('login.title')} noindex />
      <form onSubmit={handleLogin} className="login-form">
        <h2>{t('login.title')}</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('email')}
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('password')}
          required
        />
        <button type="submit">{t('login.submit')}</button>
        <p>
          {t('login.noAccount')} <Link to="/register">{t('login.toRegister')}</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
