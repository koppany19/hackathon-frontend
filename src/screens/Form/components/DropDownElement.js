import { Pressable, StyleSheet, Text } from "react-native";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import theme from "../../../theme";

export default function DropDownElement({ item, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
        styles.rootContainer,
      ]}
      onPress={() => onPress(item)}
    >
      <Text style={styles.text}>{item.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    width: "100%",
    paddingHorizontal: horizontalScale(5),
    paddingVertical: verticalScale(3),
    borderBottomColor: "rgba(255,255,255,0.35)",
    borderBottomWidth: 1,
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: 12,
    fontFamily: theme.fontFamily.medium,
  },
});
