import * as Haptics from "expo-haptics";

export const hapticPress = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (_error) {
    // Fallback silently if haptics are unavailable on device.
  }
};

export const hapticSuccess = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (_error) {
    // Fallback silently if haptics are unavailable on device.
  }
};

export const hapticError = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (_error) {
    // Fallback silently if haptics are unavailable on device.
  }
};
