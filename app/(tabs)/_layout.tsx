import { ProfileDrawer } from "@/components";
import { Link, Slot } from "expo-router";
import React, { useState } from "react";
import {
  Image,
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
  const [profileDrawer, setProfileDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState("jarvis");
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  return (
    <ImageBackground
      source={require("../../assets/images/jarvisChatWallpaper2.jpeg")}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#111",
      }}
      imageStyle={{ opacity: 0.1 }}
    >
      <StatusBar
        backgroundColor="transparent" // or any hex code like "#111111"
        barStyle="light-content" // light-content for white icons, dark-content for black
        translucent={true} // allows background to go under status bar
      />
      {profileDrawer && <ProfileDrawer setProfileDrawer={setProfileDrawer} />}

      <SafeAreaView
        style={styles.safeArea}
        edges={["left", "right", "top", "bottom"]}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Image
                source={require("../../assets/images/NextULogo.png")}
                style={{ width: 24, height: 24, marginRight: 10 }}
              />
              <Text style={styles.headerText}>{"NextU"}</Text>
            </View>

            <TouchableOpacity onPress={() => setProfileDrawer(!profileDrawer)}>
              <Icon
                source="account-circle"
                size={24}
                color={profileDrawer ? "#33324e" : "#fff"}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flex: 1,
            }}
          >
            <Slot />
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
                  color={activeTab === "jarvis" ? "#33324e" : "#aaa"}
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
                  color={activeTab === "events" ? "#33324e" : "#aaa"}
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
              <Text style={styles.navLinkText}>Toolkit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 30,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
  iconContainer: {
    display: "flex",
    flexDirection: "row",
  },
});
