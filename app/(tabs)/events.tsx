import { getToken } from "@/utils/token";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { List } from "react-native-paper"; // Add this import

export interface ITodos {
  title: string;
  description: string;
  createdAt: string;
  completed: boolean;
}
const { width } = Dimensions.get("window");

const ShimmerItem = () => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.shimmerContainer}>
      <Animated.View
        style={[
          styles.shimmerLight,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const LoadingSplash = () => {
  const loaders = new Array(8).fill(null);

  return (
    <View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#fff",
          marginBottom: 10,
        }}
      >
        Events
      </Text>
      {loaders.map((_, index) => (
        <ShimmerItem key={index} />
      ))}
    </View>
  );
};
const Events = () => {
  const [error, setError] = useState("");
  const [todos, setTodos] = useState<ITodos[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getTodsApi = async () => {
    setIsLoading(true);
    const userToken = await getToken("jwt");
    try {
      const response = await axios.get(
        "https://jarvisbackend-production.up.railway.app/api/todos/",
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const data = await response.data;
      if (data) {
        console.log("data : ", data.todosData.todos);
        const todoData = data.todosData.todos;
        setTodos([...todoData]);
      }
    } catch (err) {
      setError("Something went wrong");
      console.log("error ", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getTodsApi();
  }, []);
  return (
    <ScrollView style={{ padding: 16 }}>
      {error && <Text>{error}</Text>}
      {/* <View
        style={{
          backgroundColor: "rgba(12, 135, 196, 0.33)",
          marginBottom: 8,
          borderRadius: 6,
          height: 80,
        }}
      ></View> */}

      {isLoading ? (
        <LoadingSplash />
      ) : (
        <Section
          title="Events"
          events={todos.sort(
            (a: ITodos, b: ITodos) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )}
        />
      )}
    </ScrollView>
  );
};

const Section = ({ title, events }: { title: string; events: any[] }) => (
  <View style={{ marginBottom: 24 }}>
    <Text
      style={{
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 10,
      }}
    >
      {title}
    </Text>
    {events.map((event, idx) => (
      <List.Accordion
        key={idx}
        title={event.title}
        titleStyle={{ color: "white", fontWeight: "bold" }}
        style={{
          backgroundColor: "rgba(12, 135, 196, 0.33)",
          marginBottom: 8,
          borderRadius: 6,
        }}
        description={event.completed ? "Completed" : "Pending"}
        descriptionStyle={{
          color: "grey",
          fontStyle: "italic",
        }}
        theme={{ colors: { background: "transparent" } }}
      >
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 12,
            backgroundColor: "rgba(12, 135, 196, 0.33)",
            marginBottom: 10,
            padding: 10,
          }}
        >
          <Text style={{ color: "#ccc" }}>{event.description}</Text>
        </View>
      </List.Accordion>
    ))}
  </View>
);

export default Events;

const styles = StyleSheet.create({
  shimmerContainer: {
    overflow: "hidden",
    backgroundColor: "rgba(12, 135, 196, 0.33)",
    marginBottom: 8,
    borderRadius: 6,
    height: 80,
  },
  shimmerLight: {
    position: "absolute",
    width: "40%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    opacity: 0.8,
  },
});
