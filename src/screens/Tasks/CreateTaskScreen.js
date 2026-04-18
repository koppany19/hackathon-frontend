import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import theme from "../../theme";
import { horizontalScale, verticalScale } from "../../theme/sizing";
import { createCustomTask } from "../../api/endpoints/tasks";
import TimePicker from "../Timetable/components/TimePicker";

const CATEGORIES = [
  { value: "sport", label: "Sport", color: "#3b82f6" },
  { value: "meal", label: "Nutrition", color: "#f59e0b" },
  { value: "mental_health", label: "Mental", color: "#8b5cf6" },
];

const SUBCATEGORIES = [
  { value: "individual_created", label: "Individual" },
  { value: "group_created", label: "Group" },
];

function formatTime({ hour, minute }) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function FieldLabel({ children }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function StyledInput({ value, onChangeText, placeholder, multiline }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        focused && styles.inputFocused,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(255,255,255,0.2)"
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export default function CreateTaskScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [time, setTime] = useState({ hour: 8, minute: 0 });
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim() && description.trim() && category && subcategory;

  const onSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        subcategory,
        time: formatTime(time),
        ...(location.trim() ? { location: location.trim() } : {}),
      };
      await createCustomTask(payload);
      Toast.show({ type: "Success", text1: "Task created", text2: title.trim() });
      navigation.goBack();
    } catch (e) {
      Toast.show({
        type: "Error",
        text1: "Failed to create task",
        text2: e.message ?? "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <LinearGradient
          style={styles.topGlow}
          colors={[
            "rgba(170, 204, 0, 0.30)",
            "rgba(86, 121, 20, 0.12)",
            "rgba(0, 0, 0, 0)",
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />

        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={16}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <Text style={styles.screenTitle}>New Task</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + verticalScale(32) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FieldLabel>Title</FieldLabel>
          <StyledInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Morning run"
          />

          <FieldLabel>Description</FieldLabel>
          <StyledInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your task..."
            multiline
          />

          <FieldLabel>Category</FieldLabel>
          <View style={styles.pillRow}>
            {CATEGORIES.map((c) => {
              const selected = category === c.value;
              return (
                <Pressable
                  key={c.value}
                  onPress={() => setCategory(c.value)}
                  style={[
                    styles.pill,
                    selected && {
                      backgroundColor: c.color + "22",
                      borderColor: c.color + "88",
                    },
                  ]}
                >
                  <Text style={[styles.pillText, selected && { color: c.color }]}>
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <FieldLabel>Type</FieldLabel>
          <View style={styles.toggleRow}>
            {SUBCATEGORIES.map((s) => {
              const selected = subcategory === s.value;
              return (
                <Pressable
                  key={s.value}
                  onPress={() => setSubcategory(s.value)}
                  style={[styles.toggleBtn, selected && styles.toggleBtnSelected]}
                >
                  <Text style={[styles.toggleText, selected && styles.toggleTextSelected]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <FieldLabel>Time</FieldLabel>
          <View style={styles.timeBox}>
            <TimePicker
              label="Hour"
              hour={time.hour}
              minute={time.minute}
              onChange={setTime}
            />
          </View>

          <FieldLabel>Location</FieldLabel>
          <StyledInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. City Park"
          />

          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit || submitting}
            style={({ pressed }) => [
              styles.submitBtn,
              (!canSubmit || submitting) && styles.submitBtnDisabled,
              pressed && canSubmit && !submitting && { opacity: 0.8 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#050706" size="small" />
            ) : (
              <Text style={styles.submitText}>Create Task</Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
    height: verticalScale(220),
    zIndex: 0,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(14),
    zIndex: 1,
  },
  backBtn: {
    width: horizontalScale(36),
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(26),
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: horizontalScale(30),
  },
  screenTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(17),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.2,
  },

  divider: {
    height: 1,
    backgroundColor: "#FFFFFF08",
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(20),
    gap: verticalScale(6),
  },

  fieldLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: verticalScale(10),
    marginBottom: verticalScale(4),
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: horizontalScale(12),
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(12),
    color: theme.colors.text.primary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.normal,
  },
  inputMultiline: {
    minHeight: verticalScale(80),
    paddingTop: verticalScale(12),
  },
  inputFocused: {
    borderColor: "rgba(170, 204, 0, 0.4)",
    backgroundColor: "rgba(170, 204, 0, 0.03)",
  },

  pillRow: {
    flexDirection: "row",
    gap: horizontalScale(8),
    flexWrap: "wrap",
  },
  pill: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: horizontalScale(10),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  pillText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.medium,
    letterSpacing: 0.3,
  },

  toggleRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: horizontalScale(12),
    padding: horizontalScale(3),
    gap: horizontalScale(3),
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: verticalScale(9),
    alignItems: "center",
    borderRadius: horizontalScale(10),
  },
  toggleBtnSelected: {
    backgroundColor: "rgba(170, 204, 0, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(170, 204, 0, 0.3)",
  },
  toggleText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.medium,
  },
  toggleTextSelected: {
    color: theme.colors.secondary,
    fontFamily: theme.fontFamily.semiBold,
  },

  timeBox: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: horizontalScale(16),
    paddingVertical: verticalScale(16),
    alignItems: "center",
  },

  submitBtn: {
    marginTop: verticalScale(24),
    backgroundColor: theme.colors.secondary,
    borderRadius: horizontalScale(14),
    paddingVertical: verticalScale(15),
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    opacity: 0.3,
  },
  submitText: {
    color: "#050706",
    fontSize: horizontalScale(14),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.3,
  },
});
