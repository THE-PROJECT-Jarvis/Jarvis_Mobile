import { socket } from "@/utils/socket";
import { getToken } from "@/utils/token";
import { Stack, router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";

type JwtPayload = {
  exp: number;
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: JwtPayload = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (err) {
    return true;
  }
};

const AppLayout = () => {
  useEffect(() => {
    if (!socket.connected) {
      console.log("socket");
      socket.connect();
      socket.on("connect", () => {
        console.log("Socket connected: ", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    } else {
      console.log("socket not connected ");
    }
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    (async () => {
      const token = await getToken("jwt");
      if (token && !isTokenExpired(token)) {
        router.replace("/userInfo.component");
      } else if (!token) {
        router.navigate("/signUp");
      } else {
        router.replace("/login");
      }
    })();
  }, []);

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
};

export default AppLayout;
