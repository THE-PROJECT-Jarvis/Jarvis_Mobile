import { Platform } from "react-native";
import {
  PERMISSIONS,
  RESULTS,
  check,
  openSettings,
  request,
} from "react-native-permissions";

export const ensureMicrophonePermission = async () => {
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
  });

  const status = await check(permission!);

  if (status === RESULTS.GRANTED) {
    // Permission already granted
    return true;
  }

  if (status === RESULTS.DENIED) {
    const result = await request(permission!);
    return result === RESULTS.GRANTED;
  }

  if (status === RESULTS.BLOCKED) {
    // User denied permanently – ask to go to settings
    alert("Please enable microphone permission from settings.");
    openSettings(); // optionally open app settings
    return false;
  }

  return false;
};
