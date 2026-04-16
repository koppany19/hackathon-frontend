import { StyleSheet, Text, View } from "react-native";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import theme from "../../../theme";

export default function OrLoginWith() {
  return (
    <View style={styles.rootContainer}>
      <View style={styles.lineContainer}>
        <View style={styles.line} />
        <View style={styles.pointer} />
      </View>
      <Text style={styles.loginWithText}>Or login with</Text>
      <View style={styles.lineContainer}>
        <View style={styles.pointer} />
        <View style={styles.line} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: horizontalScale(10),
    marginVertical: verticalScale(25),
  },
  lineContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  line: { flex: 1, height: 1, backgroundColor: theme.colors.text.disabled },
  pointer: {
    width: horizontalScale(3),
    height: verticalScale(3),
    backgroundColor: theme.colors.text.disabled,
    transform: [{ rotate: "45deg" }],
  },
  loginWithText: {
    color: theme.colors.text.disabled,
    fontSize: 10,
    fontFamily: theme.fontFamily.medium,
  },
});
