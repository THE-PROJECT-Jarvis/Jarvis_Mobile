import { socket } from "@/utils/socket";
import { getToken } from "@/utils/token";
import Voice from "@react-native-voice/voice";
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
        responseTimer = setTimeout(async () => {
          addMessage("user", spokenText);
          const prompt = [...messages, { role: "user", content: spokenText }];
          console.log("prompt", prompt);
          const token = await getToken("jwt");
          socket.emit("/askGpt", {
            userToken: token,
            prompt: prompt,
          });
        }, 2000);
      }
    };
    socket.on("/gptResponse", (response) => {
      setStreamingResponse((prev) => prev + response);
    });

    socket.on("/toolCallResponse", (response) => {
      addMessage("assistant", response);
    });

    return () => {
      Voice.removeAllListeners();
      Voice.destroy().catch((e) => console.error("Voice destroy error", e));
      Voice.onSpeechError = (error) => {
        console.error("Speech error:", error);
        setStarted(false);
      };
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

  const handleSend = async () => {
    if (text.trim()) {
      addMessage("user", text);
      const prompt = [...messages, { role: "user", content: text }];
      if (isAtBottom) {
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
      console.log("Token : ", getToken("jwt"));
      const token = await getToken("jwt");
      socket.emit("/askGpt", { userToken: token, prompt: prompt });
      setText("");
    }
  };
  useEffect(() => {
    console.log("messages : ", messages);
  }, [messages]);

  return (
    <View style={{ flex: 1 }}>
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
              placeholderTextColor={"#13b3e9"}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Icon source="send" color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={!started ? startListening : stopListening}
            style={styles.micButton}
            disabled={true}
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
    // backgroundColor: "#111",
    // backgroundColor: "rgba(17, 17, 17, 0.2)",
    backgroundColor: "transparent",
  },
  header: {
    padding: 20,
    // backgroundColor: "#1e1e1e",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(30, 30, 30, 0.3)",
    backdropFilter: "blur(8px)",
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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  jarvisBubble: {
    backgroundColor: "rgba(12, 135, 196, 0.59)",
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: "#093957",
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: 20,
    //   1.	#04263c – Deep navy blue (great for background)
    // 2.	#0e4979 – Cool electric blue
    // 3.	#13b3e9 – Bright cyan (accent/highlight)
    // 4.	#093957 – Muted blue-gray
    // 5.	#0a6399 – Medium blue
    // 6.	#0c87c4 – Vivid sky blue
  },
  messageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputTextContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    backgroundColor: "rgba(51, 51, 51, 0.4)",
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
    backgroundColor: "#13b3e9",
    padding: 10,
    borderRadius: 20,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#222",
    backgroundColor: "rgba(30, 30, 30, 0.3)",
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
