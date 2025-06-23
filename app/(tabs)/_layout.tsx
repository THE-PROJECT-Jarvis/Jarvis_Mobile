import { Link, Slot } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const [activeTab, setActiveTab] = useState("jarvis");
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <ImageBackground
        source={require("../../assets/images/jarvisChatWallpaper2.jpeg")}
        style={{ width: "100%", height: "100%", backgroundColor: "#111" }}
        imageStyle={{ opacity: 0.3 }}
      >
        <StatusBar
          backgroundColor="transparent" // or any hex code like "#111111"
          barStyle="dark-content" // light-content for white icons, dark-content for black
          translucent={true} // allows background to go under status bar
        />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{"J.A.R.V.I.S"}</Text>
            <Icon source="cog-outline" size={24} color="#fff" />
          </View>

          <View
            style={{
              flex: 1,
            }}
          >
            <Slot initialRouteName="jarvis" />
          </View>

          <View style={styles.tabBar}>
            <Link href={"/jarvis"} asChild>
              <TouchableOpacity
                onPress={() => handleTabChange("jarvis")}
                style={styles.NavLink}
              >
                <Icon
                  source="brain"
                  size={24}
                  color={
                    activeTab === "jarvis" ? "rgba(12, 135, 196, 0.59)" : "#aaa"
                  }
                />
                <Text style={styles.navLinkText}>Jarvis</Text>
              </TouchableOpacity>
            </Link>
            <Link href={"/events"} asChild>
              <TouchableOpacity
                onPress={() => handleTabChange("events")}
                style={styles.NavLink}
              >
                <Icon
                  source="calendar-star"
                  size={24}
                  color={
                    activeTab === "events" ? "rgba(12, 135, 196, 0.59)" : "#aaa"
                  }
                />
                <Text style={styles.navLinkText}>Events</Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity
              onPress={() => handleTabChange("today")}
              style={styles.NavLink}
            >
              <Icon source="clipboard-text-outline" size={24} color="#aaa" />
              <Text style={styles.navLinkText}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTabChange("tools")}
              style={styles.NavLink}
            >
              <Icon source="tools" size={24} color="#aaa" />
              <Text style={styles.navLinkText}>Tools</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "red",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#222",
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
