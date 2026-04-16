import { Pressable, StyleSheet, Text, View } from "react-native";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import { Image } from "expo-image";
import theme from "../../../theme";
const googleIcon = require("../../../assets/images/google.png");
export default function QuickLogin() {
  return (
    <View style={styles.rootContainer}>
      <Pressable
        style={({ pressed }) => [
          pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
          styles.buttonContainer,
        ]}
      >
        <Image source={googleIcon} style={styles.icon} />
        <Text style={styles.text}>Google</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: horizontalScale(15),
    paddingBottom: verticalScale(15),
  },
  buttonContainer: {
    width: horizontalScale(150),
    height: horizontalScale(45),
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: horizontalScale(7),
    paddingHorizontal: horizontalScale(15),
    paddingVertical: horizontalScale(10),
  },
  icon: {
    width: horizontalScale(20),
    height: horizontalScale(20),
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: 15,
    fontFamily: theme.fontFamily.medium,
  },
});
