import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../../../theme";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import { HOUR_START, HOUR_HEIGHT } from "../constants";

function timeToMinutes(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

function minutesToOffset(mins) {
  return ((mins - HOUR_START * 60) / 60) * HOUR_HEIGHT;
}

function calcHeight(start, end) {
  return ((timeToMinutes(end) - timeToMinutes(start)) / 60) * HOUR_HEIGHT;
}

export default function ClassBlock({ item }) {
  const top = minutesToOffset(timeToMinutes(item.start_time));
  const height = Math.max(
    calcHeight(item.start_time, item.end_time),
    verticalScale(28),
  );
  const isShort = height < verticalScale(44);

  return (
    <View style={[styles.block, { top, height }]}>
      <LinearGradient
        colors={["rgba(170,204,0,0.18)", "rgba(170,204,0,0.07)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.accent} />
      <Text
        style={[styles.name, isShort && styles.nameShort]}
        numberOfLines={isShort ? 1 : 2}
      >
        {item.subject_name}
      </Text>
      {!isShort && (
        <Text style={styles.time}>
          {item.start_time.slice(0, 5)} – {item.end_time.slice(0, 5)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: horizontalScale(10),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(170,204,0,0.18)",
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(6),
    justifyContent: "center",
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: horizontalScale(3),
    backgroundColor: theme.colors.secondary,
    borderTopLeftRadius: horizontalScale(10),
    borderBottomLeftRadius: horizontalScale(10),
  },
  name: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.1,
    paddingLeft: horizontalScale(6),
  },
  nameShort: {
    fontSize: horizontalScale(11),
  },
  time: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.normal,
    paddingLeft: horizontalScale(6),
    marginTop: verticalScale(2),
  },
});
