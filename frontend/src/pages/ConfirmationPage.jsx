import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLatestForm } from '../api';
import { showToast } from '../components/ToastContainer';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const result = await getLatestForm();

        if (!result.success) {
          setError(result.message || 'Impossible de récupérer les données.');
          showToast('error', result.message || 'Impossible de récupérer les données.');
          return;
        }

        setSubmission(result.submission);
      } catch (err) {
        const message = 'La récupération des données a échoué.';
        setError(message);
        showToast('error', message);
      }
    };

    fetchSubmission();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('appUser');
    showToast('success', 'Déconnexion réussie');
    navigate('/');
  };

  if (!submission && !error) {
    return (
      <div className="app-shell">
        <div className="card">
          <h2>Chargement de la confirmation...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="card">
        <div className="page-header">
          <h1>Confirmation</h1>
          <button data-testid="logout" type="button" className="secondary-btn" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
        {error ? <div className="error">{error}</div> : null}

        {submission ? (
          <div className="submission">
            <div data-testid="confirmation-success" className="success">Votre formulaire a bien été soumis.</div>

            <div className="meta">Soumis le : {new Date(submission.submitted_at).toLocaleString()}</div>

            <div data-testid="confirmation-details">
              <div><strong>Nom :</strong> {submission.first_name} {submission.last_name}</div>
              <div><strong>Email :</strong> {submission.email}</div>
              <div><strong>Département :</strong> {submission.department}</div>
              <div><strong>Expérience :</strong> {submission.experience}</div>
              <div><strong>Rôle :</strong> {submission.role}</div>
              <div><strong>Centres d'intérêt :</strong> {submission.interests?.join(', ') || 'Aucun'}</div>
              <div><strong>Newsletter :</strong> {submission.newsletter ? 'Oui' : 'Non'}</div>
              <div><strong>Commentaires :</strong> {submission.comments || 'Aucun commentaire'}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
