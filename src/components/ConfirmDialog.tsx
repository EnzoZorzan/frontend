// src/components/ConfirmDialog.tsx

import React from "react";
import "../styles/modal.css"; // mantém reutilização do modal base
import "../styles/confirm.css"; // estilos premium (vamos criar abaixo)

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  title = "Confirmar",
  message = "Deseja prosseguir?",
  onCancel,
  onConfirm
}: ConfirmDialogProps) {

  if (!open) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-box">

        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button className="confirm-btn cancel" onClick={onCancel}>
            Cancelar
          </button>

          <button className="confirm-btn confirm" onClick={onConfirm}>
            Confirmar
          </button>
        </div>

      </div>
    </div>
  );
}
