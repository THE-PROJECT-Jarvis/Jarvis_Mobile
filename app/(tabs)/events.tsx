import React from "react";
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
  return (
    <ScrollView style={{ padding: 16 }}>
      <Section title="Life Alerts" events={mockEvents.lifeAlerts} />
      <Section title="Reminders" events={mockEvents.reminders} />
      <Section title="Normal Events" events={mockEvents.normal} />
    </ScrollView>
  );
};

const Section = ({ title, events }: { title: string; events: any[] }) => (
  <View style={{ marginBottom: 24 }}>
    <Divider style={{ marginBottom: 8 }} />
    {events.map((event) => (
      <Card key={event.id} style={{ marginBottom: 8 }}>
        <Card.Content>
          <Text>{event.title}</Text>
          <Text>{event.time}</Text>
        </Card.Content>
      </Card>
    ))}
  </View>
);

export default Events;
