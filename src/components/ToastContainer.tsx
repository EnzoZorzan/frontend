// src/components/ToastContainer.tsx
import React from "react";
import "../styles/toast.css";

export default function ToastContainer({ toasts }: { toasts: { id: number; type?: string; message: string }[] }) {
  return (
    <div className="toast-root">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || "info"}`}>
          <div className="toast-message">{t.message}</div>
        </div>
      ))}
    </div>
  );
}
