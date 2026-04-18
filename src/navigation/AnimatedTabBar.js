import React from "react";
import { Platform, StyleSheet, View, Pressable } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomIcon from "../assets/icons/CustomIcon";
import { verticalScale } from "../theme/sizing";

const ACTIVE_COLOR = "#aacc00";
const INACTIVE_COLOR = "#FFFFFF";
const TAB_HEIGHT = verticalScale(56);

const ICON_NAMES = {
  Timetable: "timetable",
  Leaderboard: "leaderboard",
  Feed: "feed",
  Tasks: "clipboard",
  Profile: "profile",
};

export default function AnimatedTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = insets?.bottom ?? 0;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          bottom: bottomInset + verticalScale(12),
          height: TAB_HEIGHT,
        },
      ]}
    >
      <BlurView
        tint={Platform.OS === "ios" ? "systemMaterialDark" : "dark"}
        intensity={90}
        style={[StyleSheet.absoluteFill, styles.blurView]}
      />
      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPressIn={onPress}
            >
              <CustomIcon
                name={ICON_NAMES[route.name]}
                size={ICON_NAMES[route.name] === "feed" ? 50 : 22}
                color={color}
              />
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 25,
    right: 25,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "transparent",
    elevation: 0,
  },
  blurView: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(170, 204, 0, 0.15)",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
