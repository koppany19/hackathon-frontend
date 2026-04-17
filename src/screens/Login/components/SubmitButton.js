import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { verticalScale } from "../../../theme/sizing";
import theme from "../../../theme";

export default function SubmitButton({ onPress, title, loading = false, disabled = false }) {
  return (
    <Pressable
      style={({ pressed }) => [
        pressed && !disabled && { opacity: 0.98, transform: [{ scale: 0.98 }] },
        styles.rootContainer,
        (disabled || loading) && styles.rootContainerDisabled,
      ]}
      onPress={!loading && !disabled ? onPress : undefined}
    >
      <LinearGradient
        colors={["#D4F85A", "#CDF24C", "#C5E93F"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#2E3A14" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    width: "100%",
    height: verticalScale(55),
    borderRadius: 100,
    overflow: "hidden",
    marginTop: verticalScale(10),
  },
  gradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  text: {
    color: "#2E3A14",
    fontSize: 18,
    fontFamily: theme.fontFamily.extra,
  },
  rootContainerDisabled: {
    opacity: 0.6,
  },
});
