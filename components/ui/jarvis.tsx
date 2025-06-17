import Voice from "@react-native-voice/voice";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  Keyboard,
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
import { io } from "socket.io-client";

export const socket = io("https://jarvisbackend-production.up.railway.app", {
  transports: ["websocket"],
});

const Jarvis = () => {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [{ role: "assistant", content: "Hello boss how can i help ?" }]
  );
  const [text, setText] = useState("");
  const [streamingResponse, setStreamingResponse] = useState("");
  const streamingResponseRef = useRef("");
  const scrollRef = useRef<ScrollView>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    let responseTimer: number | null = null;

    Voice.onSpeechResults = (e) => {
      if (e.value && e.value[0]) {
        const spokenText = e.value[0];
        if (responseTimer) clearTimeout(responseTimer);
        responseTimer = setTimeout(() => {
          addMessage("user", spokenText);
          const prompt = [...messages, { role: "user", content: spokenText }];
          console.log("prompt", prompt);
          socket.emit("/askGpt", prompt);
        }, 2000);
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
      addMessage("assistant", response);
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
      addMessage("assistant", reply ? reply : "");
      setStreamingResponse("");
    });
  }, []);

  useEffect(() => {
    const keyboardListener = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      keyboardListener.remove();
    };
  }, []);

  const addMessage = (role: string, content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
    if (isAtBottom) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
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
      addMessage("user", text);
      const prompt = [...messages, { role: "user", content: text }];
      if (isAtBottom) {
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
      socket.emit("/askGpt", prompt);
      setText("");
    }
  };
  useEffect(() => {
    console.log("messages : ", messages);
  }, [messages]);

  const handleTabChange = (route: any) => {
    router.navigate(route);
  };

  return (
    <View style={{ width: "100%", height: "100%" }}>
      <ScrollView
        style={styles.chatContainer}
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        onScroll={(event) => {
          const { layoutMeasurement, contentOffset, contentSize } =
            event.nativeEvent;
          const paddingToBottom = 100;
          const isBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
          setIsAtBottom(isBottom);
        }}
        scrollEventThrottle={100}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.role === "user" ? styles.userBubble : styles.jarvisBubble,
            ]}
          >
            <Text style={styles.messageText}>{msg.content}</Text>
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
        keyboardVerticalOffset={112}
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
    </View>
  );
};

export default Jarvis;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    maxWidth: "85%",
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
    color: "white",
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
  navLinkText: {
    color: "white",
  },
});
