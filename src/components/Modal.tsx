import "../styles/modal.css";

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
}

export default function Modal({ open, title, children, onClose, onSave }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">

        <h3 className="modal-title">{title}</h3>

        <div className="modal-body">{children}</div>

        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>
            Cancelar
          </button>

          <button className="modal-btn save" onClick={onSave}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
