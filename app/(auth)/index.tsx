import { StyleSheet, Text, View } from "react-native";

const Auth = () => {
  return (
    <View style={Styles.container}>
      <Text>Hello Auth Screen</Text>
    </View>
  );
};
export default Auth;

const Styles = StyleSheet.create({
  container: {
    display: "flex",
    height: "100%",
    width: "100%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
});
