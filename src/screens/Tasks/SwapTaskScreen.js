import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import theme from "../../theme";
import { horizontalScale, verticalScale } from "../../theme/sizing";
import { getAvailableTasks, swapTask } from "../../api/endpoints/tasks";

const CATEGORY_LABEL = {
  meal: "Nutrition",
  sport: "Sport",
  mental_health: "Mental",
  social: "Social",
};

const CATEGORY_COLOR = {
  meal: "#f59e0b",
  sport: "#3b82f6",
  mental_health: "#8b5cf6",
  social: "#ec4899",
};

const TASK_TYPE_LABEL = {
  individual: "Individual",
  group: "Group",
  custom_group: "Custom Group",
};

function CategoryBadge({ category }) {
  const label = CATEGORY_LABEL[category] ?? category;
  const color = CATEGORY_COLOR[category] ?? theme.colors.secondary;
  return (
    <View style={[styles.badge, { backgroundColor: color + "22", borderColor: color + "55" }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function DifficultyDot({ difficulty }) {
  const color =
    difficulty === "hard" ? "#ef4444" : difficulty === "medium" ? "#f59e0b" : "#10b981";
  return (
    <View style={styles.difficultyRow}>
      <View style={[styles.difficultyDot, { backgroundColor: color }]} />
      <Text style={styles.difficultyText}>{difficulty}</Text>
    </View>
  );
}

function CurrentTaskCard({ task }) {
  const t = task.task;
  return (
    <View style={styles.currentCard}>
      <View style={styles.currentCardLeft}>
        <CategoryBadge category={t.category} />
        <Text style={styles.currentTitle} numberOfLines={2}>{t.title}</Text>
        <Text style={styles.currentDesc} numberOfLines={2}>{t.description}</Text>
        <DifficultyDot difficulty={t.difficulty} />
      </View>
      <View style={styles.currentCardBadge}>
        <Text style={styles.currentCardBadgeText}>Current</Text>
      </View>
    </View>
  );
}

function TaskOption({ item, onSelect, isSelecting }) {
  return (
    <Pressable
      onPress={() => onSelect(item)}
      disabled={isSelecting}
      style={({ pressed }) => [
        styles.optionCard,
        pressed && { opacity: 0.7, backgroundColor: "rgba(170, 204, 0, 0.06)" },
      ]}
    >
      <View style={styles.optionLeft}>
        <CategoryBadge category={item.category} />
        <Text style={styles.optionTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.optionDesc} numberOfLines={2}>{item.description}</Text>
        <DifficultyDot difficulty={item.difficulty} />
      </View>
      <View style={styles.optionAction}>
        {isSelecting ? (
          <ActivityIndicator color={theme.colors.secondary} size="small" />
        ) : (
          <Text style={styles.optionActionText}>Select</Text>
        )}
      </View>
    </Pressable>
  );
}

function SectionHeader({ title, count }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count > 0 && <Text style={styles.sectionCount}>{count}</Text>}
    </View>
  );
}

function groupTasks(tasks) {
  const individual = [];
  const group = [];
  const customGroup = [];

  for (const t of tasks) {
    const type = t.type ?? (t.subcategory_id === 3 ? "custom_group" : t.subcategory_id === 2 ? "group" : "individual");
    if (type === "custom_group") customGroup.push(t);
    else if (type === "group") group.push(t);
    else individual.push(t);
  }

  return { individual, group, customGroup };
}

export default function SwapTaskScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { dailyTask, onSwapped } = route.params;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectingId, setSelectingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAvailableTasks();
      const list = Array.isArray(res) ? res : res.tasks ?? res.data ?? [];
      setTasks(list);
    } catch (e) {
      setError(e.message ?? "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSelect = async (targetTask) => {
    if (selectingId) return;
    setSelectingId(targetTask.id);
    try {
      await swapTask(dailyTask.id, targetTask.id);
      Toast.show({ type: "success", text1: "Task swapped", text2: targetTask.title });
      onSwapped?.();
      navigation.goBack();
    } catch (e) {
      Toast.show({ type: "error", text1: "Swap failed", text2: e.message ?? "Please try again" });
      setSelectingId(null);
    }
  };

  const { individual, group, customGroup } = groupTasks(tasks);
  const sections = [
    { key: "individual", label: TASK_TYPE_LABEL.individual, data: individual },
    { key: "group", label: TASK_TYPE_LABEL.group, data: group },
    { key: "custom_group", label: TASK_TYPE_LABEL.custom_group, data: customGroup },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        style={styles.topGlow}
        colors={["rgba(170, 204, 0, 0.30)", "rgba(86, 121, 20, 0.12)", "rgba(0, 0, 0, 0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={16}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.screenTitle}>Switch Task</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + verticalScale(24) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Current task */}
        <Text style={styles.sectionLabel}>Currently assigned</Text>
        <CurrentTaskCard task={dailyTask} />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Choose a replacement</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.secondary} size="large" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              onPress={load}
              style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          sections.map(({ key, label, data }) => (
            <View key={key} style={styles.section}>
              <SectionHeader title={label} count={data.length} />
              {data.length === 0 ? (
                <Text style={styles.emptyText}>No tasks available</Text>
              ) : (
                data.map((t, i) => (
                  <View key={t.id}>
                    <TaskOption
                      item={t}
                      onSelect={onSelect}
                      isSelecting={selectingId === t.id}
                    />
                    {i < data.length - 1 && <View style={styles.optionSeparator} />}
                  </View>
                ))
              )}
            </View>
          ))
        )}
      </ScrollView>
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

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(16),
    gap: verticalScale(4),
  },

  sectionLabel: {
    color: "#4a4a4a",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: verticalScale(8),
    marginTop: verticalScale(4),
  },

  /* Current task card */
  currentCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(170, 204, 0, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(170, 204, 0, 0.2)",
    borderRadius: horizontalScale(16),
    padding: horizontalScale(14),
    gap: horizontalScale(10),
  },
  currentCardLeft: {
    flex: 1,
    gap: verticalScale(6),
  },
  currentTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(14),
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: horizontalScale(20),
  },
  currentDesc: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.normal,
    lineHeight: horizontalScale(17),
  },
  currentCardBadge: {
    backgroundColor: "rgba(170, 204, 0, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(170, 204, 0, 0.35)",
    borderRadius: horizontalScale(8),
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    alignSelf: "flex-start",
  },
  currentCardBadgeText: {
    color: theme.colors.secondary,
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: "#FFFFFF08",
    marginVertical: verticalScale(12),
  },

  /* Sections */
  section: {
    marginBottom: verticalScale(8),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
    marginBottom: verticalScale(8),
  },
  sectionTitle: {
    color: "#4a4a4a",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  sectionCount: {
    color: "#2e2e2e",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.medium,
  },

  /* Task option */
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: horizontalScale(14),
    padding: horizontalScale(14),
    gap: horizontalScale(10),
  },
  optionLeft: {
    flex: 1,
    gap: verticalScale(5),
  },
  optionTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: horizontalScale(18),
  },
  optionDesc: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.normal,
    lineHeight: horizontalScale(16),
  },
  optionAction: {
    borderWidth: 1,
    borderColor: "rgba(170, 204, 0, 0.3)",
    borderRadius: horizontalScale(10),
    paddingVertical: verticalScale(6),
    paddingHorizontal: horizontalScale(12),
    minWidth: horizontalScale(52),
    alignItems: "center",
    justifyContent: "center",
  },
  optionActionText: {
    color: theme.colors.secondary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.3,
  },
  optionSeparator: {
    height: verticalScale(6),
  },

  /* Category badge */
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: horizontalScale(6),
    paddingHorizontal: horizontalScale(7),
    paddingVertical: verticalScale(2),
  },
  badgeText: {
    fontSize: horizontalScale(9),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  /* Difficulty */
  difficultyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(5),
  },
  difficultyDot: {
    width: horizontalScale(6),
    height: horizontalScale(6),
    borderRadius: horizontalScale(3),
  },
  difficultyText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.medium,
    textTransform: "capitalize",
  },

  center: {
    paddingTop: verticalScale(40),
    alignItems: "center",
    gap: verticalScale(12),
  },
  errorText: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.normal,
  },
  retryBtn: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
    borderRadius: horizontalScale(12),
    borderWidth: 1,
    borderColor: theme.colors.secondary + "55",
  },
  retryText: {
    color: theme.colors.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.medium,
  },
  emptyText: {
    color: "#2e2e2e",
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.normal,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(4),
  },
});
