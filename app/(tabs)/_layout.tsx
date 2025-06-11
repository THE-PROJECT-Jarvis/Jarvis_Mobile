import Voice from "@react-native-voice/voice";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { io } from "socket.io-client";

export const socket = io("https://jarvisbackend-production.up.railway.app", {
  transports: ["websocket"],
});

export default function TabLayout() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<
    { sender: string; message: string }[]
  >([{ sender: "Jarvis", message: "Hello boss how can i help ?" }]);
  const [text, setText] = useState("");
  const [streamingResponse, setStreamingResponse] = useState("");
  const streamingResponseRef = useRef("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let responseTimer: number | null = null;

    Voice.onSpeechResults = (e) => {
      if (e.value && e.value[0]) {
        const spokenText = e.value[0];
        if (responseTimer) clearTimeout(responseTimer);
        responseTimer = setTimeout(() => {
          addMessage("User", spokenText);
          socket.emit("/askGpt", spokenText);
        }, 500);
      }
    };

    socket.on("connect", () => {
      console.log("Socket connected: ", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("/gptResponse", (response) => {
      setStreamingResponse((prev) => prev + response);
    });

    socket.on("/toolCallResponse", (response) => {
      addMessage("Jarvis", response);
    });

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("/gptResponse");
      if (responseTimer) clearTimeout(responseTimer);
    };
  }, []);
  useEffect(() => {
    streamingResponseRef.current = streamingResponse;
  }, [streamingResponse]);
  useEffect(() => {
    socket.on("/streamComplete", (respone) => {
      const reply = streamingResponseRef.current;
      console.log("response :", streamingResponse);
      addMessage("Jarvis", reply ? reply : "");
      setStreamingResponse("");
    });
  }, []);

  const addMessage = (sender: string, message: string) => {
    setMessages((prev) => [...prev, { sender, message }]);
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const startListening = async () => {
    try {
      setStarted(true);
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setStarted(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = () => {
    if (text.trim()) {
      addMessage("User", text);
      socket.emit("/askGpt", text);
      setText("");
    }
  };
  useEffect(() => {
    console.log("messages : ", messages);
  }, [messages]);
  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Jarvis</Text>
          <Icon source="cog-outline" size={24} color="#fff" />
        </View>

        <ScrollView
          style={styles.chatContainer}
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                msg.sender === "User" ? styles.userBubble : styles.jarvisBubble,
              ]}
            >
              <Text style={styles.messageText}>{msg.message}</Text>
            </View>
          ))}
          {streamingResponse && (
            <View style={[styles.messageBubble, styles.jarvisBubble]}>
              <Text style={styles.messageText}>{streamingResponse}</Text>
            </View>
          )}
        </ScrollView>
        <KeyboardAvoidingView
          // style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={50}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputTextContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type or tap microphone..."
                value={text}
                onChangeText={setText}
              />
              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Icon source="send" color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={!started ? startListening : stopListening}
              style={styles.micButton}
            >
              <Icon
                source={started ? "pause" : "microphone"}
                color="#fff"
                size={24}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <View style={styles.tabBar}>
          <View style={styles.NavLink}>
            <Icon source="brain" size={24} color="#aaa" />
            <Text style={styles.navLinkText}>Jarvis</Text>
          </View>
          <View style={styles.NavLink}>
            <Icon source="calendar-star" size={24} color="#aaa" />
            <Text style={styles.navLinkText}>Events</Text>
          </View>
          <View style={styles.NavLink}>
            <Icon source="clipboard-text-outline" size={24} color="#aaa" />
            <Text style={styles.navLinkText}>Today</Text>
          </View>
          <View style={styles.NavLink}>
            <Icon source="tools" size={24} color="#aaa" />
            <Text style={styles.navLinkText}>Tools</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "red",
  },
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  header: {
    padding: 20,
    // backgroundColor: "#1e1e1e",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  jarvisBubble: {
    backgroundColor: "#2c2c2e",
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: "#3c3cfa",
    alignSelf: "flex-end",
  },
  messageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputTextContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#333",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginRight: 15,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    height: 40,
  },
  sendButton: {},
  micButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 20,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#222",
    backgroundColor: "#1e1e1e",
  },
  NavLink: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
  navLinkText: {
    color: "white",
  },
});
