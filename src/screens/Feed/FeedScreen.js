import { View, Text, StyleSheet } from "react-native";
import theme from "../../theme";

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Feed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontFamily: theme.fontFamily.bold,
  },
});
