import { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import theme from "../../theme";
import { horizontalScale, verticalScale } from "../../theme/sizing";
import { DAY_FULL, MONTH_NAMES } from "./constants";
import DayPager from "./components/DayPager";
import SettingsDropdown from "./components/SettingsDropdown";
import CustomIcon from "../../assets/icons/CustomIcon";

const DAYS_AHEAD = 42;

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatHeader(date) {
  return `${DAY_FULL[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

export default function TimetableScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const pagerRef = useRef(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const currentWeekMonday = useMemo(() => getMondayOfWeek(today), [today]);

  const dates = useMemo(
    () =>
      Array.from({ length: DAYS_AHEAD }, (_, i) =>
        addDays(currentWeekMonday, i),
      ),
    [currentWeekMonday],
  );

  const initialIndex = useMemo(
    () =>
      Math.max(
        0,
        dates.findIndex((d) => d.toDateString() === today.toDateString()),
      ),
    [dates, today],
  );

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const canGoBack = selectedIndex > 0;
  const selectedDate = dates[selectedIndex];
  const scheduleItems = user?.scheduleItems ?? [];

  const onPrevDay = () => {
    if (!canGoBack) return;
    const next = selectedIndex - 1;
    setSelectedIndex(next);
    pagerRef.current?.scrollToIndex(next);
  };

  const onNextDay = () => {
    const next = selectedIndex + 1;
    if (next >= dates.length) return;
    setSelectedIndex(next);
    pagerRef.current?.scrollToIndex(next);
  };

  const onIndexChange = useCallback((index) => {
    setSelectedIndex(index);
  }, []);

  const onDropdownSelect = (key) => {
    setDropdownVisible(false);
    if (key === "upload") navigation.navigate("UpdateTimetable");
    else if (key === "edit") navigation.navigate("EditSchedule");
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        style={styles.topGlow}
        colors={[
          "rgba(170, 204, 0, 0.35)",
          "rgba(86, 121, 20, 0.15)",
          "rgba(0, 0, 0, 0)",
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      <View style={styles.topBarWrapper}>
        <View style={styles.topBar}>
          <Text style={styles.screenTitle}>Timetable</Text>
          <Pressable
            onPress={() => setDropdownVisible((v) => !v)}
            hitSlop={12}
            style={({ pressed }) => [
              styles.settingsBtn,
              pressed && { opacity: 0.5 },
            ]}
          >
            <CustomIcon name="setting" color={theme.colors.surface} size={18} />
          </Pressable>
        </View>

        <SettingsDropdown
          visible={dropdownVisible}
          onSelect={onDropdownSelect}
          onDismiss={() => setDropdownVisible(false)}
        />
      </View>

      <View style={styles.dayNav}>
        <Pressable
          onPress={onPrevDay}
          disabled={!canGoBack}
          hitSlop={16}
          style={({ pressed }) => [
            styles.navArrow,
            !canGoBack && styles.navArrowDisabled,
            pressed && canGoBack && { opacity: 0.5 },
          ]}
        >
          <Text
            style={[styles.navArrowText, !canGoBack && styles.navArrowTextDim]}
          >
            ‹
          </Text>
        </Pressable>

        <Text style={styles.dateText}>{formatHeader(selectedDate)}</Text>

        <Pressable
          onPress={onNextDay}
          hitSlop={16}
          style={({ pressed }) => [
            styles.navArrow,
            pressed && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.navArrowText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.separator} />

      <DayPager
        ref={pagerRef}
        dates={dates}
        initialIndex={initialIndex}
        onIndexChange={onIndexChange}
        scheduleItems={scheduleItems}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#050706",
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(230),
    zIndex: 0,
  },
  topBarWrapper: {
    zIndex: 10,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(14),
  },
  settingsBtn: {
    width: horizontalScale(32),
    height: horizontalScale(32),
    alignItems: "center",
    justifyContent: "center",
  },
  settingsGlyph: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(18),
  },
  screenTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(17),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.2,
  },
  dayNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(8),
    paddingBottom: verticalScale(12),
  },
  navArrow: {
    width: horizontalScale(36),
    alignItems: "center",
    justifyContent: "center",
  },
  navArrowDisabled: {
    opacity: 0.2,
  },
  navArrowText: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(26),
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: horizontalScale(30),
  },
  navArrowTextDim: {
    color: theme.colors.text.secondary,
  },
  dateText: {
    flex: 1,
    textAlign: "center",
    color: theme.colors.text.primary,
    fontSize: horizontalScale(15),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.2,
  },
  separator: {
    height: 1,
    backgroundColor: "#FFFFFF08",
    marginBottom: verticalScale(4),
  },
});
