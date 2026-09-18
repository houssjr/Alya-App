import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitForm } from '../api';
import { showToast } from '../components/ToastContainer';
import ConfirmModal from '../components/ConfirmModal';

const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  department: 'RH',
  experience: 'Débutant',
  role: 'Support',
  interests: ['Technologie'],
  newsletter: true,
  comments: ''
};

const validateForm = (form) => {
  const trimmed = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    comments: form.comments.trim()
  };

  if (!trimmed.firstName || trimmed.firstName.length < 2) {
    return 'Le prénom doit contenir au moins 2 caractères.';
  }

  if (!trimmed.lastName || trimmed.lastName.length < 2) {
    return 'Le nom doit contenir au moins 2 caractères.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) {
    return 'L’adresse email est invalide.';
  }

  if (!['RH', 'Finance', 'IT', 'Marketing'].includes(form.department)) {
    return 'Le département sélectionné est invalide.';
  }

  if (!['Débutant', 'Intermédiaire', 'Confirmé', 'Expert'].includes(form.experience)) {
    return 'Le niveau d’expérience est invalide.';
  }

  if (!['Chef de projet', 'Support', 'Développeur', 'Analyste'].includes(form.role)) {
    return 'Le rôle sélectionné est invalide.';
  }

  if (!Array.isArray(form.interests) || form.interests.length === 0) {
    return 'Sélectionnez au moins un centre d’intérêt.';
  }

  if (trimmed.comments.length > 500) {
    return 'Les commentaires ne doivent pas dépasser 500 caractères.';
  }

  return '';
};

export default function FormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === 'checkbox') {
      setForm((current) => ({ ...current, [name]: checked }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleInterestChange = (event) => {
    const value = event.target.value;
    setForm((current) => {
      const interests = current.interests.includes(value)
        ? current.interests.filter((item) => item !== value)
        : [...current.interests, value];

      return { ...current, interests };
    });
  };

  const handleSubmitRequest = async () => {
    const validationMessage = validateForm(form);
    if (validationMessage) {
      setError(validationMessage);
      showToast('error', validationMessage);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        interests: form.interests,
        newsletter: Boolean(form.newsletter)
      };

      const result = await submitForm(payload);

      if (!result.success) {
        const message = result.message || 'Erreur lors de la soumission';
        setError(message);
        showToast('error', message);
        return;
      }

      localStorage.setItem('lastSubmission', JSON.stringify({ ...result, form }));
      showToast('success', 'Formulaire soumis avec succès');
      navigate('/confirmation');
    } catch (err) {
      const message = 'La soumission a échoué. Veuillez réessayer.';
      setError(message);
      showToast('error', message);
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="card">
        <div className="page-header">
          <div>
            <h1>Formulaire de demande</h1>
            <p className="subtitle" style={{ marginBottom: 0 }}>Complétez les informations ci-dessous pour valider votre demande.</p>
          </div>
        </div>

        <form onSubmit={(event) => {
          event.preventDefault();
          setModalOpen(true);
        }}>
          {error ? <div className="error">{error}</div> : null}

          <div className="form-grid">
            <div className="field">
              <label htmlFor="firstName">Prénom</label>
              <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>

            <div className="field">
              <label htmlFor="lastName">Nom</label>
              <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>

            <div className="field full-width">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>

            <div className="field">
              <label htmlFor="department">Département</label>
              <select id="department" name="department" value={form.department} onChange={handleChange}>
                <option value="RH">RH</option>
                <option value="Finance">Finance</option>
                <option value="IT">IT</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="experience">Niveau d'expérience</label>
              <select id="experience" name="experience" value={form.experience} onChange={handleChange}>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="field full-width">
              <label>Rôle</label>
              <div className="radio-group">
                {['Chef de projet', 'Support', 'Développeur', 'Analyste'].map((option) => (
                  <label key={option} className="radio-option">
                    <input
                      type="radio"
                      name="role"
                      value={option}
                      checked={form.role === option}
                      onChange={handleChange}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="field full-width">
              <label>Centres d'intérêt</label>
              <div className="checkbox-group">
                {['Technologie', 'Design', 'Formation', 'Business'].map((item) => (
                  <label key={item} className="checkbox-option">
                    <input
                      type="checkbox"
                      value={item}
                      checked={form.interests.includes(item)}
                      onChange={handleInterestChange}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="field full-width">
              <label htmlFor="comments">Commentaires</label>
              <textarea id="comments" name="comments" value={form.comments} onChange={handleChange} />
            </div>

            <div className="field full-width">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={form.newsletter}
                  onChange={handleChange}
                />
                Je souhaite recevoir la newsletter
              </label>
            </div>
          </div>

          <div className="actions">
            <button type="button" className="secondary-btn" onClick={() => navigate('/')}>
              Retour
            </button>
            <button data-testid="form-submit" type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Envoi...' : 'Soumettre le formulaire'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="Confirmer la soumission"
        message="Voulez-vous vraiment envoyer ce formulaire ?"
        onConfirm={handleSubmitRequest}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
