import Toast from "react-native-toast-message";

export const useToast = () => {
  const showToast = (type: "success" | "error" | "info", message: string) => {
    Toast.show({
      type,
      text1: message,
      position: "top",
      visibilityTime: 3000,
    });
  };

  return {
    success: (message: string) => showToast("success", message),
    error: (message: string) => showToast("error", message),
    info: (message: string) => showToast("info", message),
  };
};
