import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../../theme";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import TimePicker from "./TimePicker";

const SPRING = { damping: 22, stiffness: 260, mass: 0.8 };

const ORDERED_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const DAY_SHORT = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

function parseTime(str) {
  if (!str) return { hour: 8, minute: 0 };
  const [h, m] = str.split(":").map(Number);
  return { hour: h || 0, minute: m || 0 };
}

function formatTime({ hour, minute }) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export default function ScheduleFormSheet({ visible, item, defaultDay, existingItems = [], onSave, onClose }) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(600);
  const backdropOpacity = useSharedValue(0);
  const inputRef = useRef(null);

  const isEditing = !!item;

  const [day, setDay] = useState(defaultDay ?? "monday");
  const [subject, setSubject] = useState("");
  const [startTime, setStartTime] = useState({ hour: 8, minute: 0 });
  const [endTime, setEndTime] = useState({ hour: 9, minute: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      if (item) {
        setDay(item.day_of_week);
        setSubject(item.subject_name);
        setStartTime(parseTime(item.start_time));
        setEndTime(parseTime(item.end_time));
      } else {
        setDay(defaultDay ?? "monday");
        setSubject("");
        setStartTime({ hour: 8, minute: 0 });
        setEndTime({ hour: 9, minute: 0 });
      }
      setError("");
      translateY.value = withSpring(0, SPRING);
      backdropOpacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withSpring(600, SPRING);
      backdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleSave = async () => {
    const trimmed = subject.trim();
    if (!trimmed) {
      setError("Subject name is required");
      return;
    }
    const startMins = startTime.hour * 60 + startTime.minute;
    const endMins = endTime.hour * 60 + endTime.minute;
    if (endMins <= startMins) {
      setError("End time must be after start time");
      return;
    }
    const conflict = existingItems.find((i) => {
      if (i.id === item?.id) return false;
      if (i.day_of_week !== day) return false;
      const [sh, sm] = i.start_time.split(":").map(Number);
      const [eh, em] = i.end_time.split(":").map(Number);
      const iStart = sh * 60 + sm;
      const iEnd = eh * 60 + em;
      return startMins < iEnd && iStart < endMins;
    });
    if (conflict) {
      setError(
        `Overlaps with "${conflict.subject_name}" (${conflict.start_time.slice(0, 5)}–${conflict.end_time.slice(0, 5)})`
      );
      return;
    }
    setError("");
    Keyboard.dismiss();
    setLoading(true);
    try {
      await onSave({
        id: item?.id,
        day_of_week: day,
        subject_name: trimmed,
        start_time: formatTime(startTime),
        end_time: formatTime(endTime),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, { paddingBottom: insets.bottom + verticalScale(16) }, sheetStyle]}
        >
          <View style={styles.handle} />

          <Text style={styles.title}>{isEditing ? "Edit Class" : "Add Class"}</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.sectionLabel}>Day of week</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.daysRow}
            >
              {ORDERED_DAYS.map((d) => {
                const active = d === day;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setDay(d)}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                  >
                    <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                      {DAY_SHORT[d]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionLabel}>Subject name</Text>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={subject}
              onChangeText={(t) => { setSubject(t); setError(""); }}
              placeholder="e.g. Mathematics, OOP lecture"
              placeholderTextColor="rgba(255,255,255,0.2)"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              selectionColor={theme.colors.secondary}
            />

            <Text style={styles.sectionLabel}>Time</Text>
            <View style={styles.timeRow}>
              <TimePicker
                label="Start"
                hour={startTime.hour}
                minute={startTime.minute}
                onChange={setStartTime}
              />
              <View style={styles.timeSeparator}>
                <View style={styles.timeLine} />
                <Text style={styles.timeArrow}>→</Text>
                <View style={styles.timeLine} />
              </View>
              <TimePicker
                label="End"
                hour={endTime.hour}
                minute={endTime.minute}
                onChange={setEndTime}
              />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>

          <Pressable
            onPress={handleSave}
            disabled={loading}
            style={({ pressed }) => [
              styles.saveBtn,
              loading && styles.saveBtnDisabled,
              pressed && !loading && { opacity: 0.85 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>{isEditing ? "Save Changes" : "Add Class"}</Text>
            )}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  sheet: {
    backgroundColor: "#111411",
    borderTopLeftRadius: horizontalScale(24),
    borderTopRightRadius: horizontalScale(24),
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(12),
    maxHeight: "88%",
  },
  handle: {
    width: horizontalScale(40),
    height: verticalScale(4),
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "center",
    marginBottom: verticalScale(18),
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(17),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.2,
    marginBottom: verticalScale(20),
  },
  scrollContent: {
    gap: verticalScale(8),
    paddingBottom: verticalScale(16),
  },
  sectionLabel: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.medium,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: verticalScale(8),
    marginBottom: verticalScale(4),
  },
  daysRow: {
    flexDirection: "row",
    gap: horizontalScale(8),
    paddingVertical: verticalScale(4),
  },
  dayChip: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(8),
    borderRadius: horizontalScale(20),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  dayChipActive: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  dayChipText: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.medium,
  },
  dayChipTextActive: {
    color: "#000",
    fontFamily: theme.fontFamily.semiBold,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: horizontalScale(12),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(13),
    color: theme.colors.text.primary,
    fontSize: horizontalScale(14),
    fontFamily: theme.fontFamily.normal,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: horizontalScale(16),
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(12),
    marginTop: verticalScale(4),
  },
  timeSeparator: {
    alignItems: "center",
    gap: verticalScale(4),
  },
  timeLine: {
    width: horizontalScale(20),
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  timeArrow: {
    color: "rgba(255,255,255,0.2)",
    fontSize: horizontalScale(14),
  },
  errorText: {
    color: "#ff5555",
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.normal,
    marginTop: verticalScale(4),
  },
  saveBtn: {
    marginTop: verticalScale(12),
    backgroundColor: theme.colors.secondary,
    paddingVertical: verticalScale(15),
    borderRadius: horizontalScale(14),
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: "#000",
    fontSize: horizontalScale(15),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.2,
  },
});
