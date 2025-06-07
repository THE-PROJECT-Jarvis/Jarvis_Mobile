import { saveToken } from "@/utils/token";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginApi = async () => {
    try {
      const response = await fetch(
        "https://jarvisbackend-production.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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

  const handleLogin = () => {
    if (email && password) {
      loginApi().then((token) => {
        if (token) {
          console.log("Login successful, token:", token);
          saveToken("jwt", token);
          router.navigate("/");
        }
      });
    } else {
      setError("All fields are required");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.inner}>
          <Text variant="titleLarge" style={styles.heading}>
            Welcome Back
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
          />

          <Button mode="contained" onPress={handleLogin} style={styles.button}>
            Login
          </Button>
          {error && <Text style={styles.error}>{error}</Text>}
          <Text style={styles.redirectingLink}>
            Don not have an account ? <Link href={"/signUp"}>Sing Up</Link>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  heading: {
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 12,
  },
  redirectingLink: {
    marginTop: 10,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});
