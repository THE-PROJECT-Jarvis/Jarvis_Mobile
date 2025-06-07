import { getToken } from "@/utils/token";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const App = () => {
  useEffect(() => {
    (async () => {
      const token = await getToken("jwt");
      if (token) {
        router.navigate("/(tabs)");
      } else {
        router.navigate("/(auth)");
      }
    })();
  }, []);
  return (
    <View style={Styles.container}>
      <Text>Hello</Text>
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
