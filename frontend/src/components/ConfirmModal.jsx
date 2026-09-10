export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Annuler
          </button>
          <button type="button" className="primary-btn" onClick={onConfirm}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
