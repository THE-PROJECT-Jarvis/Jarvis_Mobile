import { socket } from "@/utils/socket";
import { getToken } from "@/utils/token";
import Clipboard from "@react-native-clipboard/clipboard";
import Voice from "@react-native-voice/voice";
import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { useChatStore } from "../../store/chatStore";
export interface IChat {
  role: string;
  content: string;
}
const Jarvis = () => {
  const {
    messages,
    streamingResponse,
    addMessage,
    resetMessages,
    setStreamingResponse,
    appendStreamingResponse,
    resetStreamingResponse,
  } = useChatStore();
  const [started, setStarted] = useState(false);
  const [replyTo, setReplyTo] = useState<IChat | null>(null);
  const [text, setText] = useState("");
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
          addMessage({ role: "user", content: spokenText });
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
    socket.off("/gptResponse");
    socket.off("/toolCallResponse");
    socket.off("/streamComplete");

    socket.on("/gptResponse", (response) => {
      appendStreamingResponse(response);
      scrollRef.current?.scrollToEnd({ animated: true });
    });

    socket.on("/toolCallResponse", (response) => {
      addMessage({ role: "assistant", content: response });
    });

    socket.on("/streamComplete", (respone) => {
      const reply = streamingResponseRef.current;
      console.log("response :", streamingResponse);
      if (reply) {
        addMessage({ role: "assistant", content: reply });
        scrollRef.current?.scrollToEnd({ animated: true });
      }
      setStreamingResponse("");
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
      socket.off("/streamComplete");
      if (responseTimer) clearTimeout(responseTimer);
    };
  }, []);
  useEffect(() => {
    streamingResponseRef.current = streamingResponse;
  }, [streamingResponse]);

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

  // const addMessage = (role: string, content: string) => {
  //   setMessages((prev) => [...prev, { role, content }]);
  //   if (isAtBottom) {
  //     setTimeout(() => {
  //       scrollRef.current?.scrollToEnd({ animated: true });
  //     }, 100);
  //   }
  // };

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
      addMessage({ role: "user", content: text });
      scrollRef.current?.scrollToEnd({ animated: true });

      const prompt: IChat[] = replyTo
        ? [replyTo, { role: "user", content: text }]
        : [...messages, { role: "user", content: text }];
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
      Alert.alert("Speech Error", "Voice not recognised , Try again . ");
      setStarted(false);
    };
  }, [messages]);
  useEffect(() => {
    Tts.setDefaultLanguage("en-US");
    Tts.speak(`Hi, I’m Jarvis.`, {
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
    <View style={{ flex: 1, position: "relative" }}>
      {!isAtBottom && (
        <TouchableOpacity
          style={styles.toBottomIcon}
          onPress={() => {
            scrollRef.current?.scrollToEnd({ animated: true });
          }}
        >
          <Icon source={"chevron-double-down"} color="#fff" size={24} />
        </TouchableOpacity>
      )}

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
        {messages.map((msg, index) => {
          let lastTap = 0;
          return (
            <Pressable
              onPress={() => {
                const now = Date.now();
                if (now - lastTap < 300) {
                  setReplyTo(msg); // Double tap detected
                }
                lastTap = now;
              }}
              onLongPress={() => {
                Clipboard.setString(
                  typeof msg.content === "string" ? msg.content : ""
                );
                Alert.alert("Copied", "Message copied to clipboard");
              }}
              key={index}
              style={[
                styles.messageBubble,
                msg.role === "user" ? styles.userBubble : styles.jarvisBubble,
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  msg.role === "user" ? { right: -15 } : { left: -15 },
                ]}
              >
                {msg.role === "user" ? (
                  <Icon source="account-circle" size={24} color={"#fff"} />
                ) : (
                  <Image
                    source={require("../../assets/images/jarvisIcon.png")}
                    style={{ width: 29, height: 29, borderRadius: 12 }}
                  />
                )}
              </View>
              {msg.role === "user" ? (
                <Text
                  style={{
                    color: "#5D5A8C",
                    fontSize: 16,
                    paddingHorizontal: 10,
                  }}
                >
                  {msg.content}
                </Text>
              ) : (
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
              )}
            </Pressable>
          );
        })}
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
              placeholderTextColor={"#e6e6e6"}
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
    marginBottom: 8,
    marginTop: 8,
    position: "relative",
  },
  avatar: {
    position: "absolute",
    height: 30,
    width: 30,
    bottom: -15,
    backgroundColor: "black",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  jarvisBubble: {
    backgroundColor: "#7674a5",
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: "#e6e6e6",
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: 20,
    //   1.	#04263c – Deep navy blue (great for background)

    // light purple : #7674a5
    // dark purple :

    // #48466d
    // Dusty Indigo
    // #ffffff
    // Pure White
    // #5d5a8c
    // Slate Purple
    // #33324e
    // Charcoal Blue
    // #e6e6e6
    // Light Grey
    // #7674a5
    // Lavender Grey

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
    backgroundColor: "#33324e",
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
  toBottomIcon: {
    borderRadius: "50%",
    backgroundColor: "rgba(51, 51, 51, 0.4)",
    position: "absolute",
    bottom: 60,
    right: 10,
    zIndex: 999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
});
