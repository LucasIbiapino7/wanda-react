import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./AppModal.css";

export default function AppModal({
  open,
  title,
  children,
  onClose,
  variant = "default",
  primaryAction,
  secondaryAction,
  initialFocus, 
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (initialFocus) {
      const el = document.getElementById(initialFocus);
      if (el) setTimeout(() => el.focus(), 0);
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, initialFocus]);

  if (!open) return null;

  const className =
    "app-modal " +
    (variant === "success" ? "app-modal--success" : variant === "error" ? "app-modal--error" : "");

  const handleBackdrop = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return (
    <div
      ref={overlayRef}
      className="app-modal-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={handleBackdrop}
    >
      <div className={className}>
        {title ? <h3 className="app-modal-title">{title}</h3> : null}
        <div className="app-modal-body">{children}</div>
        {(primaryAction || secondaryAction) && (
          <div className="app-modal-actions">
            {secondaryAction && (
              <button
                id={secondaryAction.id}
                className="app-btn"
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled}
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                id={primaryAction.id}
                className="app-btn app-btn--primary"
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

AppModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(["default", "success", "error"]),
  primaryAction: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  }),
  secondaryAction: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  }),
  initialFocus: PropTypes.string,
};
