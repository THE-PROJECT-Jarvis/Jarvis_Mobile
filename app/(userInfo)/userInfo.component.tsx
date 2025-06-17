import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button, Chip, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { categories, ICategory, styles } from "../../lib/userInfo.ias";
import QuestionCard from "./questionCard.component";

const UserInfo = () => {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const toggleCategory = (area: ICategory) => {
    setSelectedAreas((prev) =>
      prev.includes(area.label)
        ? prev.filter((a) => a !== area.label)
        : [...prev, area.label]
    );
  };
  const handleGeneratePlan = () => {
    router.navigate("/(tabs)");
  };

  return (
    <SafeAreaProvider>
      <PaperProvider>
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
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default UserInfo;
