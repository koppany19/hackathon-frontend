import { StyleSheet, View, Text } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { Image } from "expo-image";
import theme from "../../theme";
import { horizontalScale, verticalScale } from "../../theme/sizing";
const success = require("../../assets/icons/success.png");
const error = require("../../assets/icons/error.png");
const warning = require("../../assets/icons/warning.png");
export default function ToastStyle({ text1, text2, type }) {
  return (
    <View style={styles.rootContainer}>
      <Svg style={styles.svg}>
        <Defs>
          <RadialGradient id="grad" cx="0%" cy="0%" r="141%" fx="0%" fy="0%">
            <Stop offset="0" stopColor="#0b090a" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#CDF24C" stopOpacity="0.1" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad)" />
      </Svg>
      <View style={styles.innerHolder}>
        <Image
          source={
            type === "Success" ? success : type === "Error" ? error : warning
          }
          style={styles.icon}
          contentFit="contain"
        />
        <View style={styles.textHolder}>
          <Text style={styles.title} numberOfLines={1}>
            {text1}
          </Text>
          {text2 && (
            <Text style={styles.text} numberOfLines={1}>
              {text2}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    width: "80%",
    borderRadius: 15,
    overflow: "hidden",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 0.2,
    backgroundColor: theme.colors.primaryLight,
  },
  innerHolder: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(17),
    paddingVertical: verticalScale(20),
    gap: horizontalScale(15),
  },
  svg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  icon: {
    width: horizontalScale(17),
    height: horizontalScale(17),
  },
  textHolder: {
    flex: 1,
    gap: verticalScale(3),
    justifyContent: "center",
  },
  title: {
    color: theme.colors.surface,
    fontFamily: theme.fontFamily.medium,
    fontSize: 12,
  },
  text: {
    color: theme.colors.surface,
    fontFamily: theme.fontFamily.medium,
    marginLeft: horizontalScale(1),
  },
});
