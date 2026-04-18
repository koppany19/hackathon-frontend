import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import theme from "../../../theme";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import CustomIcon from "../../../assets/icons/CustomIcon";

const DURATION = 200;
const EASING = Easing.out(Easing.cubic);

const OPTIONS = [
  { key: "upload", icon: "check", label: "Upload new timetable (AI)" },
  { key: "edit", icon: "clipboard", label: "Edit schedules" },
];

export default function SettingsDropdown({ visible, onSelect, onDismiss }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-8);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: DURATION, easing: EASING });
    translateY.value = withTiming(visible ? 0 : -8, { duration: DURATION, easing: EASING });
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <>
      {visible && <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />}
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[styles.dropdown, animStyle]}
      >
        {OPTIONS.map((opt, idx) => (
          <Pressable
            key={opt.key}
            onPress={() => onSelect(opt.key)}
            style={({ pressed }) => [
              styles.option,
              idx < OPTIONS.length - 1 && styles.optionBorder,
              pressed && styles.optionPressed,
            ]}
          >
            <CustomIcon
              name={opt.icon}
              size={horizontalScale(14)}
              color={theme.colors.text.secondary}
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>{opt.label}</Text>
          </Pressable>
        ))}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    top: verticalScale(44),
    right: horizontalScale(16),
    backgroundColor: "#141614",
    borderRadius: horizontalScale(12),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    zIndex: 100,
    minWidth: horizontalScale(210),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(13),
    gap: horizontalScale(10),
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  optionPressed: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  optionIcon: {},
  optionText: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.medium,
  },
});
