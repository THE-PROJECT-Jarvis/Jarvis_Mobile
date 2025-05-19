import { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import {
  Text,
  Surface,
  IconButton,
  MD3Colors,
  TextInput,
} from "react-native-paper";
export default function TabTwoScreen() {
  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [exercise, setExercise] = useState<string>("");
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
        style={styles.container}
      >
        <Surface style={styles.gymCal}>
          <TextInput
            label="Name"
            value={exercise}
            onChangeText={(text) => setExercise(text)}
            style={styles.textInput}
          />
          <View style={styles.counterContainer}>
            <View style={styles.displayText}>
              <Text variant="labelMedium">{weight} Kgs</Text>
            </View>

            <View style={styles.buttonColumn}>
              <View style={styles.buttonWithLabel}>
                {" "}
                <IconButton
                  icon="plus-circle"
                  iconColor={MD3Colors.neutralVariant50}
                  size={20}
                  onPress={() => setWeight((a) => a + 5)}
                />
                <Text variant="labelMedium">5Kgs</Text>
              </View>
              <View style={styles.buttonWithLabel}>
                {" "}
                <IconButton
                  icon="minus-circle"
                  iconColor={MD3Colors.neutralVariant50}
                  size={20}
                  onPress={() => setWeight((a) => (a - 5 > 0 ? a - 5 : 0))}
                />
                <Text variant="labelMedium">5Kgs</Text>
              </View>
            </View>
          </View>
          <View style={styles.counterContainer}>
            <View style={styles.displayText}>
              <Text variant="labelMedium">{reps} reps</Text>
            </View>

            <View style={styles.buttonColumn}>
              <View style={styles.buttonWithLabel}>
                {" "}
                <IconButton
                  icon="plus-circle"
                  iconColor={MD3Colors.neutralVariant50}
                  size={20}
                  onPress={() => setReps((a) => a + 1)}
                />
                <Text variant="labelMedium">1rep</Text>
              </View>
              <View style={styles.buttonWithLabel}>
                {" "}
                <IconButton
                  icon="minus-circle"
                  iconColor={MD3Colors.neutralVariant50}
                  size={20}
                  onPress={() => setReps((a) => (a - 1 > 0 ? a - 1 : 0))}
                />
                <Text variant="labelMedium">1rep</Text>
              </View>
            </View>
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    position: "relative",
  },
  counterContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    height: 100,
  },
  displayText: {
    width: "50%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonColumn: {
    display: "flex",
    flexDirection: "column",
    width: "50%",
    borderLeftWidth: 2,
    borderLeftColor: MD3Colors.neutral99,
  },
  buttonWithLabel: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  gymCal: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    position: "absolute",
    bottom: 85,
  },
  textInput: {
    width: "100%",
  },
});
