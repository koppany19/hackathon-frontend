import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useEffect, useState } from "react";
import theme from "../../../theme";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import CheckboxItem from "./CheckboxItem";

const FREQUENCY = [
  { key: "sport_daily", label: "Every day" },
  { key: "sport_4_5_week", label: "4–5× per week" },
  { key: "sport_2_3_week", label: "2–3× per week" },
  { key: "sport_once_week", label: "Once a week" },
  { key: "sport_rarely", label: "Rarely / Never" },
];

const SPORTS = [
  { key: "football", label: "Football" },
  { key: "basketball", label: "Basketball" },
  { key: "running", label: "Running" },
  { key: "cycling", label: "Cycling" },
  { key: "swimming", label: "Swimming" },
  { key: "tennis", label: "Tennis" },
  { key: "gym", label: "Gym / Weights" },
  { key: "yoga", label: "Yoga" },
  { key: "hiking", label: "Hiking" },
  { key: "martial_arts", label: "Martial Arts" },
  { key: "volleyball", label: "Volleyball" },
  { key: "badminton", label: "Badminton" },
];

const buildInitialState = (items) =>
  items.reduce((acc, item) => ({ ...acc, [item.key]: false }), {});

export default function SportsForm({ rootAnimation, onChange }) {
  const [frequency, setFrequency] = useState(buildInitialState(FREQUENCY));
  const [sports, setSports] = useState(buildInitialState(SPORTS));

  useEffect(() => {
    onChange?.({ ...frequency, ...sports });
  }, [frequency, sports]);

  const toggleFrequency = (key) => {
    setFrequency(() => {
      const reset = buildInitialState(FREQUENCY);
      return { ...reset, [key]: true };
    });
  };

  const toggleSport = (key) =>
    setSports((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Animated.View style={[styles.rootContainer, rootAnimation]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FormSection
          title="How often do you exercise?"
          hint="Pick your typical frequency"
          items={FREQUENCY}
          state={frequency}
          onToggle={toggleFrequency}
        />
        <FormSection
          title="Sports & Activities"
          hint="Select everything you enjoy"
          items={SPORTS}
          state={sports}
          onToggle={toggleSport}
        />
      </ScrollView>
    </Animated.View>
  );
}

function FormSection({ title, hint, items, state, onToggle }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <CheckboxItem
            key={item.key}
            label={item.label}
            checked={state[item.key]}
            onPress={() => onToggle(item.key)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  scrollContent: {
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(20),
    gap: verticalScale(32),
  },
  section: {
    gap: verticalScale(2),
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: 15,
    fontFamily: theme.fontFamily.semiBold,
  },
  sectionHint: {
    color: theme.colors.text.disabled,
    fontSize: 11,
    fontFamily: theme.fontFamily.medium,
    marginBottom: verticalScale(6),
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: horizontalScale(4),
  },
});
