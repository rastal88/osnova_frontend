import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../authStore';
import {register, login} from "../../api";
import './Register.css';
import { getApiError, getErrorMessage } from '../../../../api/errors';


const Register = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      setError(t('register.passwordsMismatch'));
      return;
    }
    try {
      await register(email, password);
      await login(email, password);
      const user = await fetchUser();

      if (user?.role === 'root' || user?.role === 'moderator') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err: unknown) {
      // Until per-field form errors arrive, show the first field message if any
      setError(getApiError(err)?.fields?.[0]?.message ?? getErrorMessage(err));
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister} className="register-form">
        <h2>{t('register.title')}</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder={t('register.repeatPassword')}
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          required
        />

        <button type="submit">{t('register.submit')}</button>

        <p>
          {t('register.haveAccount')} <Link to="/login">{t('register.toLogin')}</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;