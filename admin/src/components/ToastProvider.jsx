import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, AlertTriangle, Info, CircleX, X } from "lucide-react";

const ToastContext = createContext({
  showToast: () => {},
});

let toastSeed = 0;

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (payload) => {
      const next = {
        id: ++toastSeed,
        title: payload?.title || "Update",
        message: payload?.message || "Action completed",
        type: payload?.type || "info",
      };

      setToasts((prev) => [next, ...prev].slice(0, 5));
      setTimeout(() => removeToast(next.id), 4000);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => {
          const Icon =
            toast.type === "success"
              ? CheckCircle2
              : toast.type === "warning"
                ? AlertTriangle
                : toast.type === "error"
                  ? CircleX
                  : Info;

          return (
            <div key={toast.id} className={`toast-item toast-${toast.type}`}>
              <div className="toast-icon-wrap">
                <Icon size={16} />
              </div>
              <div className="toast-content">
                <p className="toast-title">{toast.title}</p>
                <p className="toast-message">{toast.message}</p>
              </div>
              <button
                type="button"
                className="toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
