import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useEffect, useState } from "react";
import theme from "../../../theme";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import CheckboxItem from "./CheckboxItem";

const DIETARY_RESTRICTIONS = [
  { key: "lactose_intolerant", label: "Lactose Intolerant" },
  { key: "gluten_intolerant", label: "Gluten Intolerant" },
  { key: "vegan", label: "Vegan" },
  { key: "vegetarian", label: "Vegetarian" },
  { key: "nut_allergy", label: "Nut Allergy" },
  { key: "halal", label: "Halal" },
  { key: "kosher", label: "Kosher" },
  { key: "dairy_free", label: "Dairy Free" },
];

const FOOD_PREFERENCES = [
  { key: "loves_spicy", label: "Spicy Food Lover" },
  { key: "meal_prep", label: "Meal Prep Fan" },
  { key: "street_food", label: "Street Food" },
  { key: "fine_dining", label: "Fine Dining" },
  { key: "fast_food", label: "Fast Food" },
  { key: "home_cooking", label: "Home Cooking" },
];

const buildInitialState = (items) =>
  items.reduce((acc, item) => ({ ...acc, [item.key]: false }), {});

export default function FoodForm({ rootAnimation, onChange }) {
  const [restrictions, setRestrictions] = useState(
    buildInitialState(DIETARY_RESTRICTIONS)
  );
  const [preferences, setPreferences] = useState(
    buildInitialState(FOOD_PREFERENCES)
  );

  useEffect(() => {
    onChange?.({ ...restrictions, ...preferences });
  }, [restrictions, preferences]);

  const toggleRestriction = (key) =>
    setRestrictions((prev) => ({ ...prev, [key]: !prev[key] }));

  const togglePreference = (key) =>
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Animated.View style={[styles.rootContainer, rootAnimation]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FormSection
          title="Dietary Restrictions"
          hint="Select all that apply to you"
          items={DIETARY_RESTRICTIONS}
          state={restrictions}
          onToggle={toggleRestriction}
        />
        <FormSection
          title="Food Preferences"
          hint="What kind of food do you enjoy?"
          items={FOOD_PREFERENCES}
          state={preferences}
          onToggle={togglePreference}
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
