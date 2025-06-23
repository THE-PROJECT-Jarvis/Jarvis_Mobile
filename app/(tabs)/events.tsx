import { getToken } from "@/utils/token";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Card, Divider } from "react-native-paper";

const mockEvents = {
  lifeAlerts: [
    { id: 1, title: "Doctor Appointment", time: "10:00 AM" },
    { id: 2, title: "Take Medication", time: "9:00 PM" },
  ],
  reminders: [
    { id: 3, title: "Call Mom", time: "6:00 PM" },
    { id: 4, title: "Pay Bills", time: "8:00 PM" },
  ],
  normal: [
    { id: 5, title: "Read Book", time: "9:30 PM" },
    { id: 6, title: "Stretching Routine", time: "7:00 AM" },
  ],
};

const Events = () => {
  const [error, setError] = useState("");
  const [todos, setTodos] = useState<{ title: string; description: string }[]>(
    []
  );

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
      <Section title="Life Alerts" events={todos} />
      <Section title="Reminders" events={mockEvents.reminders} />
      <Section title="Normal Events" events={mockEvents.normal} />
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
      <Card
        key={idx}
        style={{
          marginBottom: 8,
          backgroundColor: "rgba(12, 135, 196, 0.33)",
        }}
      >
        <Card.Content>
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {event.title}
          </Text>
          {/* <Text style={{ color: "white" }}>{event.time}</Text> */}
        </Card.Content>
      </Card>
    ))}
    <Divider style={{ marginBottom: 8 }} />
  </View>
);

export default Events;
