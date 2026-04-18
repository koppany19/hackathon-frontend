import { Pressable, StyleSheet, Text, View } from "react-native";
import theme from "../../../theme";
import { horizontalScale, verticalScale } from "../../../theme/sizing";

function Spinner({ value, onIncrement, onDecrement }) {
  return (
    <View style={styles.spinner}>
      <Pressable
        onPress={onIncrement}
        hitSlop={8}
        style={({ pressed }) => [styles.arrow, pressed && styles.arrowPressed]}
      >
        <Text style={styles.arrowText}>▲</Text>
      </Pressable>
      <Text style={styles.value}>{String(value).padStart(2, "0")}</Text>
      <Pressable
        onPress={onDecrement}
        hitSlop={8}
        style={({ pressed }) => [styles.arrow, pressed && styles.arrowPressed]}
      >
        <Text style={styles.arrowText}>▼</Text>
      </Pressable>
    </View>
  );
}

export default function TimePicker({ label, hour, minute, onChange }) {
  const setHour = (h) => onChange({ hour: h, minute });
  const setMinute = (m) => onChange({ hour, minute: m });

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Spinner
          value={hour}
          onIncrement={() => setHour(hour === 23 ? 0 : hour + 1)}
          onDecrement={() => setHour(hour === 0 ? 23 : hour - 1)}
        />
        <Text style={styles.colon}>:</Text>
        <Spinner
          value={minute}
          onIncrement={() => setMinute(minute >= 55 ? 0 : minute + 5)}
          onDecrement={() => setMinute(minute <= 0 ? 55 : minute - 5)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    gap: verticalScale(8),
  },
  label: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.medium,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },
  spinner: {
    alignItems: "center",
    gap: verticalScale(6),
  },
  arrow: {
    width: horizontalScale(36),
    height: verticalScale(28),
    borderRadius: horizontalScale(8),
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowPressed: {
    backgroundColor: "rgba(170,204,0,0.12)",
  },
  arrowText: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(10),
  },
  value: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(28),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 1,
    minWidth: horizontalScale(52),
    textAlign: "center",
  },
  colon: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(24),
    fontFamily: theme.fontFamily.semiBold,
    marginTop: verticalScale(-4),
  },
});
