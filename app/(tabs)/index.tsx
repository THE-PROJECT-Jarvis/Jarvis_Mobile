import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { text }: { text: string } = useLocalSearchParams();
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const apiCall = async () => {
    try {
      const res = await fetch(
        "https://jarvisbackend-production.up.railway.app/test"
      );
      const result = await res.text(); // ✅ parse as plain text
      console.log("Response:", result);
    } catch (err) {
      console.error("API call failed:", err);
    }
  };
  useEffect(() => {
    apiCall();
  }, []);
  useEffect(() => {
    if (text) {
      // Tts.speak(`${text}`, {
      //   iosVoiceId: "com.apple.ttsbundle.Moira-compact",
      //   rate: 0.5,
      //   androidParams: {
      //     KEY_PARAM_PAN: -1,
      //     KEY_PARAM_VOLUME: 0.5,
      //     KEY_PARAM_STREAM: "STREAM_MUSIC",
      //   },
      // });
      setChatHistory([...chatHistory, text]);
    }
  }, [text]);
  return (
    <ScrollView contentContainerStyle={styles.homeContainer}>
      <View style={styles.textContainer}>
        {chatHistory.length > 0 ? (
          chatHistory.map((chat, idx) => {
            return (
              <Text style={styles.textStyle} key={idx}>
                {chat}
                <View style={styles.speakIcon}>
                  {/* <Icon source="account-voice" color={"fffff"} size={30} /> */}
                </View>
              </Text>
            );
          })
        ) : (
          <Text>{""}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    // height: "100%",
    width: "100%",
    backgroundColor: "#282D2A",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    overflow: "scroll",
    paddingBottom: 100,
  },
  textContainer: {
    display: "flex",
    width: "100%",
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
    padding: 20,
    margin: 10,
  },
  textStyle: {
    color: "white",
    padding: 20,
    margin: 10,
    borderWidth: 2,
    borderBlockColor: "black",
    borderStyle: "solid",
    borderRadius: 10,
    position: "relative",
  },
  speakIcon: {
    display: "flex",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});
