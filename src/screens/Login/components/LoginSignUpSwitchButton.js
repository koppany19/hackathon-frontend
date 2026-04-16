import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import theme from "../../../theme";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const LOGIN_LEFT = horizontalScale(3);
const PILL_WIDTH_RATIO = 0.48;
export default function LoginSignUpSwitchButton({ isLogin, onPress }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const pillAnimation = useSharedValue(LOGIN_LEFT);
  const signUpLeft =
    containerWidth - horizontalScale(3) - containerWidth * PILL_WIDTH_RATIO;

  useEffect(() => {
    pillAnimation.value = withSpring(isLogin ? LOGIN_LEFT : signUpLeft, {
      damping: 15,
    });
  }, [isLogin, signUpLeft, pillAnimation]);

  const onLoginPressHandler = () => {
    if (isLogin) return;
    onPress?.(true);
    pillAnimation.value = withSpring(LOGIN_LEFT, {
      duration: 350,
      damping: 15,
    });
  };

  const onSignUpPressHandler = () => {
    if (!isLogin) return;
    onPress?.(false);
    pillAnimation.value = withSpring(signUpLeft, {
      duration: 350,
      damping: 15,
    });
  };

  const pillAnimatedStyle = useAnimatedStyle(() => {
    return {
      left: pillAnimation.value,
    };
  });

  return (
    <View
      style={styles.rootContainer}
      onLayout={({ nativeEvent }) => {
        setContainerWidth(nativeEvent.layout.width);
      }}
    >
      <BlurView intensity={55} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={["rgba(86,94,75,0.55)", "rgba(44,50,38,0.6)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassLayer}
        >
          <Animated.View style={[styles.activePill, pillAnimatedStyle]}>
            <LinearGradient
              colors={["rgba(151,159,135,0.42)", "rgba(95,104,84,0.34)"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.pillGradient]}
            />
          </Animated.View>
          <Pressable
            style={({ pressed }) => [
              pressed && { opacity: 0.98, transform: [{ scale: 0.98 }] },
              styles.sideContainer,
            ]}
            onPress={onLoginPressHandler}
          >
            <Text style={[styles.text, !isLogin && styles.inactiveText]}>
              Login
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              pressed && { opacity: 0.98, transform: [{ scale: 0.98 }] },
              styles.sideContainer,
            ]}
            onPress={onSignUpPressHandler}
          >
            <Text style={[styles.text, isLogin && styles.inactiveText]}>
              Sign up
            </Text>
          </Pressable>
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    width: "100%",
    height: verticalScale(50),
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(203,214,187,0.2)",
    backgroundColor: "rgba(23,27,19,0.52)",
    marginVertical: verticalScale(25),
  },
  blurContainer: {
    flex: 1,
    borderRadius: 100,
    overflow: "hidden",
  },
  glassLayer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  activePill: {
    position: "absolute",
    height: "90%",
    width: "48%",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(215,223,201,0.22)",
    overflow: "hidden",
  },
  pillGradient: {
    flex: 1,
  },
  sideContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  text: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontFamily: theme.fontFamily.medium,
  },
  inactiveText: {
    color: theme.colors.text.disabled,
  },
});
