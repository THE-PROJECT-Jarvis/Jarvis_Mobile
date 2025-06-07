import { getToken } from "@/utils/token";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";

type JwtPayload = {
  exp: number; // expiration in seconds since epoch
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: JwtPayload = jwtDecode(token);
    const currentTime = Date.now() / 1000; // in seconds
    return decoded.exp < currentTime;
  } catch (err) {
    return true; // consider invalid token as expired
  }
};

const App = () => {
  useEffect(() => {
    (async () => {
      const token = await getToken("jwt");
      if (token && !isTokenExpired(token)) {
        router.navigate("/(tabs)");
      } else {
        router.navigate("/login");
      }
    })();
  }, []);
  return (
    <View style={Styles.container}>
      <StatusBar
        translucent={false} // Prevents app content from rendering under the status bar
        backgroundColor="black" // Sets background color for Android
        barStyle="light-content" // Light text/icons (use "dark-content" for dark text/icons)
      />
      <Text>Root Level Screen</Text>
    </View>
  );
};
export default App;

const Styles = StyleSheet.create({
  container: {
    display: "flex",
    height: "100%",
    width: "100%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
});
