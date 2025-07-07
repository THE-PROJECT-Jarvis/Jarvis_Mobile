import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

export async function saveToken(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

export async function getToken(key: string) {
  return await SecureStore.getItemAsync(key);
}

export async function deleteToken(key: string) {
  await SecureStore.deleteItemAsync(key);
}
export const decodeToken = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};
