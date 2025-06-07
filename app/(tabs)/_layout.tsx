import Voice from "@react-native-voice/voice";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-paper";
import { io } from "socket.io-client";

export const socket = io("https://jarvisbackend-production.up.railway.app", {
  transports: ["websocket"], // important for mobile
});

export default function TabLayout() {
  const router = useRouter();
  const [started, setStarted] = useState<boolean | undefined>(undefined);

  let timer: any;
  const askGptApi = (voiceText: string) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      console.log("result : ", voiceText);
      router.push({
        pathname: "/",
        params: { text: voiceText },
      });
      socket.emit("/askGpt", voiceText);
    }, 1000);
    console.log("timer : ", timer);
  };

  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value[0]) {
        const spokenText = e.value[0];
        console.log("spoken token : ", spokenText);
        askGptApi(spokenText);
      }
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      setStarted(false);
    };
  }, []);
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected : ", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected.");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const startListening = async () => {
    try {
      setStarted(true);
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Icon source="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => (
              <Icon source="compass" color={color} size={size} />
            ),
          }}
        />
      </Tabs>

      <View style={styles.recordButtonContainer}>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={
            !started
              ? startListening
              : async () => {
                  await Voice.stop();
                  setStarted(false);
                }
          }
        >
          <Icon
            source={started ? "pause" : "microphone"}
            color={"#fff"}
            size={30}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  recordButtonContainer: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    zIndex: 999,
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
