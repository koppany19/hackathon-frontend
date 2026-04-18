import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import CustomIcon from "../../../assets/icons/CustomIcon";
import theme from "../../../theme";
import { horizontalScale, verticalScale } from "../../../theme/sizing";

export default function CheckboxItem({ label, checked, onPress }) {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withTiming(0.93, { duration: 70 });
  };

  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 140 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.container}
    >
      <Animated.View
        style={[styles.checkbox, checked && styles.checkboxChecked, animatedStyle]}
      >
        {checked && (
          <CustomIcon name="check" size={10} color={theme.colors.secondary} />
        )}
      </Animated.View>
      <Text style={[styles.label, checked && styles.labelChecked]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(9),
    paddingVertical: verticalScale(7),
    width: "48%",
  },
  checkbox: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.03)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  checkboxChecked: {
    borderColor: "rgba(170, 204, 0, 0.75)",
    backgroundColor: "rgba(170, 204, 0, 0.1)",
  },
  label: {
    flex: 1,
    color: theme.colors.text.disabled,
    fontSize: 13,
    fontFamily: theme.fontFamily.medium,
    lineHeight: 18,
  },
  labelChecked: {
    color: theme.colors.text.primary,
    fontFamily: theme.fontFamily.semiBold,
  },
});
