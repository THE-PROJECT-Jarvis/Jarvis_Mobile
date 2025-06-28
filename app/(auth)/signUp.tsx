import { saveToken } from "@/utils/token";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

const SignupScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signUpApi = async () => {
    try {
      const response = await fetch(
        "https://jarvisbackend-production.up.railway.app/api/auth/signUp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
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

  const handleSignup = () => {
    if (name && email && password) {
      signUpApi().then((token) => {
        if (token) {
          console.log("Login successful, token:", token);
          saveToken("jwt", token);
          router.navigate("/userInfo.component");
        }
      });
    } else {
      setError("All fields are required");
    }
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    // TODO: Add signup logic here (API call)
  };

  return (
    <ImageBackground
      source={require("../../assets/images/jarvisChatWallpaper.jpeg")}
      style={{ width: "100%", height: "100%", backgroundColor: "#111" }}
      imageStyle={{ opacity: 0.3 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.inner}>
            <Text variant="titleLarge" style={styles.heading}>
              Create Account
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Type your name here ...."
              value={name}
              onChangeText={setName}
              placeholderTextColor={"#13b3e9"}
              textColor="white"
            />
            <TextInput
              style={styles.input}
              placeholder="Enter a valid email here ...."
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={"#13b3e9"}
              textColor="white"
            />
            <TextInput
              style={styles.input}
              placeholder="Type your password here ...."
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={"#13b3e9"}
              textColor="white"
            />

            <Button
              mode="contained"
              onPress={handleSignup}
              style={styles.button}
            >
              Sign Up
            </Button>
            {error && <Text style={styles.error}>{error}</Text>}
            <Text style={styles.redirectingLink}>
              Already have a account ?{" "}
              <Link href={"/login"} style={styles.link}>
                Login
              </Link>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  inner: {
    justifyContent: "center",
    padding: 24,
  },
  heading: {
    marginBottom: 14,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 10,
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
  link: {
    color: "#13b3e9",
    fontWeight: "bold",
  },
});
