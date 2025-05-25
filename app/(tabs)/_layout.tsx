import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Voice from "@react-native-voice/voice";
import { Icon } from "react-native-paper";
import { io } from "socket.io-client";

export const socket = io("http://172.20.10.2:3001", {
  transports: ["websocket"], // important for mobile
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [result, setResult] = useState("");
  const [started, setStarted] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value[0]) {
        const spokenText = e.value[0];
        setResult(spokenText);
        router.push({
          pathname: "/",
          params: { text: spokenText },
        });
      }
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      console.log("Voice To Text : ", result);
      socket.emit("askGpt", result);
      setStarted(false);
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
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
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
