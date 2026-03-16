import { IconCheck, IconX } from "@tabler/icons-react";

export function ToastMessage({ title, message, onClose }) {
  return (
    <div className="lc-toast" role="status" aria-live="polite">
      <div className="lc-announcement-meta">
        <IconCheck size={18} stroke={2} />
        <div className="lc-stack" style={{ gap: "0.15rem" }}>
          <strong>{title}</strong>
          <span>{message}</span>
        </div>
      </div>
      <button type="button" className="lc-toast-close" onClick={onClose} aria-label="Close success message">
        <IconX size={18} stroke={1.9} />
      </button>
    </div>
  );
}