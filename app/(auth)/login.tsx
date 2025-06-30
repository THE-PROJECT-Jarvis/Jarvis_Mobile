import { saveToken } from "@/utils/token";
import { Link, router } from "expo-router";
import { useRef, useState } from "react";
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const passwordInputRef = useRef<RNTextInput>(null);

  const loginApi = async () => {
    try {
      const response = await fetch(
        "https://jarvisbackend-production.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Login failed");
        return null;
      }
      return data.token;
    } catch (err) {
      setError("Something went wrong");
      return null;
    }
  };

  const handleLogin = () => {
    if (email && password) {
      loginApi().then((token) => {
        if (token) {
          saveToken("jwt", token);
          router.navigate("/jarvis");
        }
      });
    } else {
      setError("All fields are required");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/jarvisChatWallpaper.jpeg")}
      style={{ flex: 1, backgroundColor: "#111" }}
      imageStyle={{ opacity: 0.3 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.inner}>
              <Text variant="titleLarge" style={styles.heading}>
                Welcome Back
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Type your email here"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={"#13b3e9"}
                textColor="white"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />

              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder="Type your password here"
                value={password}
                onChangeText={setPassword}
                placeholderTextColor={"#13b3e9"}
                textColor="white"
                returnKeyType="done"
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
              >
                Login
              </Button>

              {error && <Text style={styles.error}>{error}</Text>}

              <Text style={styles.redirectingLink}>
                Don’t have an account?{" "}
                <Link href={"/signUp"} style={styles.link}>
                  Sign In
                </Link>
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};
export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: "white",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  inner: {
    justifyContent: "center",
    padding: 24,
    color: "white",
  },
  heading: {
    marginBottom: 24,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "rgba(12, 135, 196, 0.59)",
    color: "white",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#13b3e9",
  },
  redirectingLink: {
    marginTop: 10,
    color: "white",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
  },
  link: {
    color: "#13b3e9",
    fontWeight: "bold",
  },
});
