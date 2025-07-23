// ProfileDrawer.tsx
import { deleteToken } from "@/utils/token";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileDrawer = ({
  setProfileDrawer,
}: {
  setProfileDrawer: (state: boolean) => void;
}) => {
  const handleLogout = async () => {
    await deleteToken("jwt");
    console.log("Logged out");
    router.navigate("/login");
  };
  return (
    <View style={styles.container}>
      <SafeAreaView
        style={styles.drawerContainer}
        edges={["left", "right", "top", "bottom"]}
      >
        <View style={styles.header}>
          <Text style={styles.name}>John Doe</Text>
          <IconButton
            icon="close"
            iconColor="white"
            size={24}
            onPress={() => {
              setProfileDrawer(false);
            }}
            style={styles.closeIcon}
          />
        </View>

        <View style={styles.drawerSection}>
          <TouchableOpacity style={styles.itemContainer} onPress={() => {}}>
            <Text style={styles.label}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.itemContainer} onPress={() => {}}>
            <Text style={styles.label}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              handleLogout();
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <TouchableOpacity
        onPress={() => {
          setProfileDrawer(false);
        }}
        style={styles.emptyContainer}
      >
        <View style={styles.emptyContainer}></View>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileDrawer;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    right: 0,
    display: "flex",
    flexDirection: "row",
    zIndex: 100,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: "#7674a5",
    height: "100%",
    width: "75%",
    paddingHorizontal: 25,
    flexDirection: "column",
  },
  header: {
    marginBottom: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  name: {
    color: "white",
    fontSize: 20,
    marginTop: 10,
    fontWeight: "bold",
  },
  closeIcon: {},
  drawerSection: {
    marginTop: 20,
    flex: 1,
  },
  footer: {
    alignItems: "center",
    width: "100%",
  },
  logoutButton: {
    backgroundColor: "#48466d",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutText: {
    color: "white",
    fontSize: 16,
  },
  drawerItem: {
    color: "white",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  icon: {
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  emptyContainer: {
    height: "100%",
    width: "25%",
    backgroundColor: "transparent",
  },
});
