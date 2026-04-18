import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useEffect, useState } from "react";
import theme from "../../../theme";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import CheckboxItem from "./CheckboxItem";

const HOBBIES = [
  { key: "reading", label: "Reading" },
  { key: "movies_series", label: "Movies & Series" },
  { key: "gaming", label: "Gaming" },
  { key: "music", label: "Music" },
  { key: "art_drawing", label: "Art & Drawing" },
  { key: "photography", label: "Photography" },
  { key: "cooking", label: "Cooking" },
  { key: "travel", label: "Travel" },
  { key: "concerts", label: "Concerts" },
  { key: "theater", label: "Theater" },
  { key: "dancing", label: "Dancing" },
  { key: "board_games", label: "Board Games" },
  { key: "volunteering", label: "Volunteering" },
  { key: "coffee_culture", label: "Coffee Culture" },
];

const SOCIAL_STYLE = [
  { key: "prefers_indoor", label: "Indoor Activities" },
  { key: "prefers_outdoor", label: "Outdoor Activities" },
  { key: "large_groups", label: "Large Groups" },
  { key: "small_gatherings", label: "Small Gatherings" },
  { key: "night_owl", label: "Night Owl" },
  { key: "early_bird", label: "Early Bird" },
];

const buildInitialState = (items) =>
  items.reduce((acc, item) => ({ ...acc, [item.key]: false }), {});

export default function SocialForm({ rootAnimation, onChange }) {
  const [hobbies, setHobbies] = useState(buildInitialState(HOBBIES));
  const [socialStyle, setSocialStyle] = useState(buildInitialState(SOCIAL_STYLE));

  useEffect(() => {
    onChange?.({ ...hobbies, ...socialStyle });
  }, [hobbies, socialStyle]);

  const toggleHobby = (key) =>
    setHobbies((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleSocialStyle = (key) =>
    setSocialStyle((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Animated.View style={[styles.rootContainer, rootAnimation]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FormSection
          title="Hobbies & Interests"
          hint="What do you enjoy doing in your free time?"
          items={HOBBIES}
          state={hobbies}
          onToggle={toggleHobby}
        />
        <FormSection
          title="Your Social Style"
          hint="How do you prefer to spend time with others?"
          items={SOCIAL_STYLE}
          state={socialStyle}
          onToggle={toggleSocialStyle}
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
