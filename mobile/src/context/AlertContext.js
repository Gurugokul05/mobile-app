import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import CustomAlert from "../components/CustomAlert";
import { hapticError, hapticSuccess } from "../utils/haptics";

const AlertContext = createContext();

export const useAppAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const timeoutRef = useRef(null);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "OK",
    cancelText: null,
    onConfirm: () => {},
    onCancel: () => {},
    duration: 3000,
  });

  const showAlert = useCallback((options) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const type = options.type || "info";
    if (type === "success") hapticSuccess();
    if (type === "error") hapticError();

    const onConfirm =
      typeof options.onConfirm === "function" ? options.onConfirm : () => {};

    setAlertConfig({
      visible: true,
      title: options.title || "Notice",
      message: options.message || "",
      type,
      confirmText: options.confirmText || "OK",
      cancelText: options.cancelText || null,
      onConfirm,
      onCancel:
        typeof options.onCancel === "function" ? options.onCancel : () => {},
      duration: Number(options.duration) > 0 ? Number(options.duration) : 3000,
    });

    timeoutRef.current = setTimeout(
      () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        onConfirm();
      },
      Number(options.duration) > 0 ? Number(options.duration) : 3000,
    );
  }, []);

  const hideAlert = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </AlertContext.Provider>
  );
};
