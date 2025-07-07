import { socket } from "@/utils/socket";
import { getToken } from "@/utils/token";
import Voice from "@react-native-voice/voice";
import { useEffect, useRef, useState } from "react";

import {
  Alert,
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
import Markdown from "react-native-markdown-display";
import { Icon } from "react-native-paper";
import Tts from "react-native-tts";
export interface IChat {
  role: string;
  content: string;
}
const Jarvis = () => {
  const [started, setStarted] = useState(false);
  const [replyTo, setReplyTo] = useState<IChat | null>(null);
  const [messages, setMessages] = useState<IChat[]>([
    { role: "assistant", content: "Hi, I’m Lyra." },
  ]);
  const [text, setText] = useState("");
  const [streamingResponse, setStreamingResponse] = useState("");
  const streamingResponseRef = useRef("");
  const scrollRef = useRef<ScrollView>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [speaking, setSpeaking] = useState<boolean>(false);

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
      Voice.onSpeechResults = async (e) => {
        if (e.value && e.value[0]) {
          const spokenText = e.value[0];
          addMessage("user", spokenText);
          const prompt = [...messages, { role: "user", content: spokenText }];
          console.log("prompt", prompt);
          const token = await getToken("jwt");
          socket.emit("/askGpt", {
            userToken: token,
            prompt: prompt,
          });
        }
      };
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
    Voice.onSpeechError = (error) => {
      console.error("Speech error:", error);
      Alert.alert("Speech Error", JSON.stringify(error));
      setStarted(false);
    };
  }, [messages]);
  useEffect(() => {
    Tts.setDefaultLanguage("en-US");
    Tts.speak(`Hi, I’m Lyra.`, {
      iosVoiceId: "com.apple.ttsbundle.Moira-compact",
      rate: 0.5,
      androidParams: {
        KEY_PARAM_PAN: -1,
        KEY_PARAM_VOLUME: 0.5,
        KEY_PARAM_STREAM: "STREAM_MUSIC",
      },
    });
    const onStart = () => {
      console.log("🔊 TTS started");
      setSpeaking(true);
    };
    const onFinish = () => {
      console.log("✅ TTS finished");
    };
    // const onProgress = (event) => {
    //   console.log("📍 TTS progress:", event);
    // };

    Tts.addEventListener("tts-start", onStart);
    Tts.addEventListener("tts-finish", onFinish);

    return () => {
      Tts.removeAllListeners("tts-start");
    };
  }, []);

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
          <TouchableOpacity
            onLongPress={() => setReplyTo(msg)}
            key={index}
            style={[
              styles.messageBubble,
              msg.role === "user" ? styles.userBubble : styles.jarvisBubble,
            ]}
          >
            <Markdown
              style={{
                body: {
                  color: "white",
                  fontSize: 16,
                  paddingHorizontal: 10,
                },
                heading1: {
                  color: "#13b3e9",
                  fontSize: 22,
                  fontWeight: "bold",
                  marginBottom: 10,
                },
                heading2: {
                  color: "#13b3e9",
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 8,
                },
                heading3: {
                  color: "#13b3e9",
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 8,
                },
                paragraph: { color: "white", marginBottom: 8 },
                strong: { fontWeight: "bold", color: "#ffffff" },
                list_item: { color: "#ffffff" },
                bullet_list: { marginBottom: 8 },
                code_inline: {
                  backgroundColor: "#222",
                  color: "#13b3e9",
                  padding: 4,
                  borderRadius: 4,
                },
                blockquote: {
                  backgroundColor: "#1e1e1e",
                  padding: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: "#13b3e9",
                },
              }}
            >
              {typeof msg.content === "string" ? msg.content : ""}
            </Markdown>
          </TouchableOpacity>
        ))}
        {streamingResponse && (
          <View style={[styles.messageBubble, styles.jarvisBubble]}>
            <Text selectable style={styles.messageText}>
              {streamingResponse}
            </Text>
          </View>
        )}
      </ScrollView>
      <KeyboardAvoidingView
        // style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={112}
      >
        {replyTo && (
          <View
            style={{
              backgroundColor: "#093957",
              padding: 10,
              paddingHorizontal: 25,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#13b3e9", fontWeight: "bold" }}>
                Replying to:
              </Text>
              <Text style={{ color: "grey" }} numberOfLines={1}>
                {replyTo.content}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Icon source="close" color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        )}
        <View
          style={[
            styles.inputContainer,
            replyTo && { backgroundColor: "#093957" },
          ]}
        >
          <View style={styles.inputTextContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type or say what’s on your mind"
              value={text}
              onChangeText={setText}
              placeholderTextColor={"#13b3e9"}
              multiline
              scrollEnabled
              textAlignVertical="center"
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
    padding: 10,
  },
  input: {
    flex: 1,
    color: "white",
    alignItems: "center",
    maxHeight: 50,
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
