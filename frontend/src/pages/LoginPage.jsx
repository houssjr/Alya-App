import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import { showToast } from '../components/ToastContainer';

const validateLogin = (username, password) => {
  if (!username || username.trim().length < 3) {
    return 'Le nom d’utilisateur doit contenir au moins 3 caractères.';
  }

  if (!password || password.length < 6) {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }

  return '';
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateLogin(form.username, form.password);
    if (validationMessage) {
      setError(validationMessage);
      showToast('error', validationMessage);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await loginUser(form.username, form.password);

      if (!result.success) {
        setError(result.message || 'Erreur de connexion');
        showToast('error', result.message || 'Erreur de connexion');
        return;
      }

      localStorage.setItem('appUser', result.user || form.username);
      showToast('success', 'Connexion réussie');
      navigate('/form');
    } catch (err) {
      const message = 'Impossible de se connecter pour le moment.';
      setError(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="card auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #2957ff 0%, #1c41c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800
          }}>
            A
          </div>
          <div>
            <strong style={{ fontSize: 14, color: '#2957ff', letterSpacing: 1.2, textTransform: 'uppercase' }}>Alya App</strong>
          </div>
        </div>

        <h1>Connexion</h1>
        <p className="subtitle">Accédez à votre espace sécurisé pour remplir et soumettre le formulaire.</p>

        <form onSubmit={handleSubmit}>
          {error ? <div data-testid="login-error" className="error">{error}</div> : null}

          <div className="field">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="field" style={{ marginTop: '18px' }}>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="actions" style={{ marginTop: '20px' }}>
            <button data-testid="login-submit" type="submit" className="primary-btn" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
