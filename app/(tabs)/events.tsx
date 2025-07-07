import { getToken } from "@/utils/token";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { List } from "react-native-paper"; // Add this import

export interface ITodos {
  title: string;
  description: string;
  createdAt: string;
  completed: boolean;
}
const Events = () => {
  const [error, setError] = useState("");
  const [todos, setTodos] = useState<ITodos[]>([]);

  const getTodsApi = async () => {
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
    }
  };
  useEffect(() => {
    getTodsApi();
  }, []);
  return (
    <ScrollView style={{ padding: 16 }}>
      <Section
        title="Events"
        events={todos.sort(
          (a: ITodos, b: ITodos) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )}
      />
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
