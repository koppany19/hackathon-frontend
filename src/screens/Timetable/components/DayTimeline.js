import { View, Text, StyleSheet, ScrollView } from "react-native";
import theme from "../../../theme";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import {
  HOUR_START,
  TOTAL_HOURS,
  HOUR_HEIGHT,
  TIME_COL_WIDTH,
  EVENT_LEFT,
  EVENT_RIGHT,
  PAGE_WIDTH,
} from "../constants";
import ClassBlock from "./ClassBlock";

const HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => HOUR_START + i);

function timeToMinutes(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

function mergeConsecutive(items) {
  if (items.length === 0) return [];
  const sorted = [...items].sort(
    (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time),
  );
  const result = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = result[result.length - 1];
    const curr = sorted[i];
    const gap = timeToMinutes(curr.start_time) - timeToMinutes(last.end_time);
    if (curr.subject_name === last.subject_name && gap <= 15) {
      last.end_time = curr.end_time;
    } else {
      result.push({ ...curr });
    }
  }
  return result;
}

export default function DayTimeline({ scheduleItems }) {
  const merged = mergeConsecutive(scheduleItems);
  return (
    <ScrollView
      style={{ width: PAGE_WIDTH }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.timeline}>
        {HOURS.map((hour) => (
          <View
            key={hour}
            style={[styles.hourRow, { top: (hour - HOUR_START) * HOUR_HEIGHT }]}
          >
            <Text style={styles.hourLabel} numberOfLines={1}>
              {String(hour).padStart(2, "0")}:00
            </Text>
            <View style={styles.hourLine} />
          </View>
        ))}

        <View style={styles.eventsColumn}>
          {merged.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No classes</Text>
            </View>
          ) : (
            merged.map((item) => <ClassBlock key={item.id} item={item} />)
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(140),
  },
  timeline: {
    height: TOTAL_HOURS * HOUR_HEIGHT + verticalScale(8),
    position: "relative",
  },
  hourRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  hourLabel: {
    width: TIME_COL_WIDTH,
    paddingLeft: horizontalScale(16),
    color: "#3a3a3a",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.medium,
    letterSpacing: 0.3,
  },
  hourLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#FFFFFF08",
    marginRight: horizontalScale(16),
  },
  eventsColumn: {
    position: "absolute",
    left: EVENT_LEFT,
    right: EVENT_RIGHT,
    top: 0,
    bottom: 0,
  },
  empty: {
    position: "absolute",
    top: HOUR_HEIGHT * 3,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  emptyText: {
    color: "#3a3a3a",
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.normal,
  },
});
