import { router, useNavigation } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, ScrollView, Text, View } from "react-native";
import { Button, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { categories, ICategory, styles } from "../../lib/userInfo.ias";
import QuestionCard from "./questionCard.component";

const UserInfo = () => {
  const navigation = useNavigation();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const toggleCategory = (area: ICategory) => {
    setSelectedAreas((prev) =>
      prev.includes(area.label)
        ? prev.filter((a) => a !== area.label)
        : [...prev, area.label]
    );
  };
  const handleGeneratePlan = () => {
    router.push({
      pathname: "/plan",
      params: {
        category: selectedAreas.join(","),
      },
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/jarvisChatWallpaper.jpeg")}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#111",
        flex: 1,
      }}
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          <Toast />
          <Text style={styles.header}>Where do you want to improve?</Text>
          <View style={styles.chipContainer}>
            {categories.map((cat, index) => (
              <Chip
                key={index}
                selected={selectedAreas.includes(cat.label)}
                onPress={() => toggleCategory(cat)}
                style={styles.chip}
                textStyle={{ color: "white" }}
                selectedColor="green"
              >
                {cat.label}
              </Chip>
            ))}
          </View>
          <View style={styles.questionContainer}>
            {selectedAreas.length > 0 &&
              selectedAreas.map((selected, idx) => {
                const selectedCategory = categories.filter((cat) => {
                  return cat.label === selected;
                });
                if (selectedCategory) {
                  return (
                    <QuestionCard category={selectedCategory[0]} key={idx} />
                  );
                } else {
                  return null;
                }
              })}
          </View>
        </ScrollView>
        <View style={styles.GenerateContainer}>
          <Button
            mode="contained"
            style={styles.GenerateButton}
            disabled={selectedAreas.length > 0 ? false : true}
            onPress={handleGeneratePlan}
            textColor="white"
          >
            {selectedAreas.length > 0
              ? "Generate Personlised Plan"
              : "Select atleast one Cateogry "}
          </Button>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default UserInfo;
