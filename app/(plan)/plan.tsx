// PlanGenerator.tsx
import { socket } from "@/utils/socket";
import { getToken } from "@/utils/token";
import Voice from "@react-native-voice/voice";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
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
import { Button, Icon } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { height, width } = Dimensions.get("window");

const PlanGenerator = () => {
  const { category }: { category: string } = useLocalSearchParams();
  console.log("Category : ", category);
  const [aiState, setAiState] = useState<string>("Generating the plan .....");
  const [started, setStarted] = useState(false);
  const [text, setText] = useState("");
  const [planText, setPlanText] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<{
    title: string;
    majorGoal: string;
    timeline: string[];
    daily: string[];
    weekly: string[];
    motivations: string[];
    notes: string[];
    voiceOutputText: string;
    markdownFormat: string;
  }>();

  const scrollViewRef = useRef<ScrollView>(null);
  useEffect(() => {
    const initSocket = async () => {
      const token = await getToken("jwt");
      setAiState(
        `Generating ${category.split(",")[0].toLowerCase()} plan ....`
      );
      socket.emit("/generatePlan", {
        token: token,
        category: category.split(",")[0].toLowerCase().toLowerCase(),
      });

      socket.on("/planStream", (data) => {
        setPlanText((prev) => {
          const updated = prev + data;
          requestAnimationFrame(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          });
          return updated;
        });
      });
      socket.on("/plan", (plan) => {
        setPlan(plan);
        setPlanText("");
        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        });
        console.log("plan : ", plan);
        // if (plan?.voiceOutputText) {
        //   console.log("voice ");
        //   Tts.stop(); // Stop any existing speech
        //   Tts.speak(`${plan.voiceOutputText}`, {
        //     iosVoiceId: "com.apple.ttsbundle.Moira-compact",
        //     rate: 0.5,
        //     androidParams: {
        //       KEY_PARAM_PAN: -1,
        //       KEY_PARAM_VOLUME: 0.5,
        //       KEY_PARAM_STREAM: "STREAM_MUSIC",
        //     },
        //   });
        // }
      });
    };

    initSocket();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("/generatePlan");
      socket.off("/planStream");
      socket.off("/plan");
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
      const token = await getToken("jwt");
      setPlan(undefined);
      setPlanText("");
      setAiState(
        `Modifing ${category.split(",")[0].toLowerCase()} plan ..... `
      );
      socket.emit("/generatePlan", {
        token: token,
        category: category.split(",")[0].toLowerCase(),
        userPrompt: text,
        existingPlan: plan?.markdownFormat || "No existing plan",
      });
      setText("");
    }
  };

  useEffect(() => {
    let responseTimer: number | null = null;
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value[0]) {
        const spokenText = e.value[0];
        setText(spokenText);
        if (responseTimer) clearTimeout(responseTimer);
        responseTimer = setTimeout(async () => {
          const token = await getToken("jwt");
          setPlanText("");
          setPlan(undefined);
          setAiState(
            `Modifing ${category.split(",")[0].toLowerCase()} plane ....."`
          );
          socket.emit("/generatePlan", {
            token: token,
            category: category.split(",")[0].toLowerCase(),
            userPrompt: text,
            existingPlan: plan?.markdownFormat || "No existing plan",
          });
          setText("");
        }, 1000);
      }
    };
    return () => {
      Voice.removeAllListeners();
      Voice.destroy().catch((e) => console.error("Voice destroy error", e));
      Voice.onSpeechError = (error) => {
        console.error("Speech error:", error);
        setStarted(false);
      };
    };
  }, []);
  const handleConfirmPlan = async () => {
    try {
      setLoading(true);
      let categoryData = category.split(",");
      const token = await getToken("jwt");
      if (!token) throw new Error("Token not found");
      const slectedCategory = categoryData[0].toLowerCase();
      console.log("selected Category : ", slectedCategory);
      await axios.post(
        `https://jarvisbackend-production.up.railway.app/api/plan/${slectedCategory}`,
        {
          plan: JSON.stringify(plan),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSaved(true);
      if (categoryData.length > 1) {
        categoryData.shift();
        router.push({
          pathname: "/plan",
          params: {
            category: categoryData.join(","),
          },
        });
      } else {
        router.navigate("/jarvis");
      }
    } catch (error: any) {
      console.error("API Error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to save",
        text2: error?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/jarvisChatWallpaper.jpeg")}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#111",
        flex: 1,
      }}
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "top", "bottom"]}
      >
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>
            {plan ? "Plan generated " : aiState}
          </Text>
          {plan && (
            <Button
              mode="contained"
              style={styles.GenerateButton}
              onPress={handleConfirmPlan}
              textColor="white"
            >
              {loading ? "Confirming ... " : "Confirm Plan"}
            </Button>
          )}
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={100}
        >
          <View style={styles.container}>
            <Text style={styles.generatingText}>{planText}</Text>
            <Markdown
              style={{
                body: { color: "white", fontSize: 16, padding: 10 },
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
              {typeof plan?.markdownFormat === "string"
                ? plan.markdownFormat
                : ""}
            </Markdown>
          </View>
        </ScrollView>
      </SafeAreaView>
      {plan && (
        <KeyboardAvoidingView
          // style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={112}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputTextContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type the modifications you want ..."
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
      )}
    </ImageBackground>
  );
};

export default PlanGenerator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  headingContainer: {
    display: "flex",
    flexDirection: "row",
    position: "fixed",
    zIndex: 99,
    backgroundColor: "#04263c",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
  heading: {
    color: "#13b3e9",
    fontSize: 18,
  },
  generatingText: {
    color: "#13b3e9",
    padding: 10,
  },
  inputContainer: {
    position: "fixed",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 30,
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
  GenerateButton: {
    backgroundColor: "#007AFF",
    borderRadius: 35,
    position: "fixed",
    justifyContent: "center",
    alignItems: "center",
  },
});
