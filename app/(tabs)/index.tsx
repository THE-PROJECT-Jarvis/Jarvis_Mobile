import { StyleSheet, View } from "react-native";
import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function HomeScreen() {
  const { text } = useLocalSearchParams();

  return (
    <View style={styles.homeContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.textStyle}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: "#282D2A",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  textContainer: {
    position: "absolute",
    padding: 20,
    margin: 10,
    bottom: 100,
    zIndex: 999,
  },
  textStyle: {
    color: "white",
  },
  textLight: {
    color: "black",
  },
  textDark: {
    color: "white",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
