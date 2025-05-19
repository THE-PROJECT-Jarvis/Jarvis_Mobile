import { Button, StyleSheet, View } from "react-native";
import { Text } from "react-native";
import { useEffect, useState } from "react";
import Voice from "@react-native-voice/voice";

export default function HomeScreen() {
  const [result, setResult] = useState("");
  const [started, setStarted] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      if (e.value) {
        setResult(e.value[0]);
      }
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      setStarted(false);
    };
  }, []);

  const startListening = async () => {
    try {
      setStarted(started === undefined ? true : !started);
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <View style={styles.homeContainer}>
      <Button
        title={started ? "STOP " : "Start speaking "}
        onPress={
          !started
            ? startListening
            : () => {
                Voice.stop();
                setStarted(!started);
              }
        }
      />
      <Text>{result}</Text>
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
