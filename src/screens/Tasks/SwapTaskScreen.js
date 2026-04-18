import { useState } from "react";
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
import { swapTask } from "../../api/endpoints/tasks";

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

function groupBySubcategory(tasks) {
  const individual = [];
  const group = [];
  const customGroup = [];
  for (const t of tasks) {
    const sid = t.subcategory_id;
    const name = t.subcategory?.name;
    if (sid === 3 || name === "custom_group") customGroup.push(t);
    else if (sid === 2 || name === "group") group.push(t);
    else individual.push(t);
  }
  return { individual, group, customGroup };
}

function CurrentTaskCard({ task }) {
  const t = task.task;
  const color = CATEGORY_COLOR[t?.category] ?? theme.colors.secondary;
  return (
    <View style={styles.currentCard}>
      <View style={styles.currentCardLeft}>
        <View style={[styles.badge, { backgroundColor: color + "22", borderColor: color + "55" }]}>
          <Text style={[styles.badgeText, { color }]}>
            {CATEGORY_LABEL[t?.category] ?? t?.category}
          </Text>
        </View>
        <Text style={styles.currentTitle} numberOfLines={2}>{t?.title}</Text>
        <Text style={styles.currentDesc} numberOfLines={2}>{t?.description}</Text>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.difficultyDot,
              {
                backgroundColor:
                  t?.difficulty === "hard" ? "#ef4444"
                  : t?.difficulty === "medium" ? "#f59e0b"
                  : "#10b981",
              },
            ]}
          />
          <Text style={styles.difficultyText}>{t?.difficulty}</Text>
        </View>
      </View>
      <View style={styles.currentBadge}>
        <Text style={styles.currentBadgeText}>Current</Text>
      </View>
    </View>
  );
}

function TaskOption({ item, onSelect, isSelecting, disabled }) {
  return (
    <Pressable
      onPress={() => onSelect(item)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.optionCard,
        pressed && !disabled && { opacity: 0.7, backgroundColor: "rgba(170, 204, 0, 0.06)" },
        disabled && !isSelecting && styles.optionCardDisabled,
      ]}
    >
      <View style={styles.optionLeft}>
        <Text style={styles.optionTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.optionDesc} numberOfLines={2}>{item.description}</Text>
        {item.location ? (
          <Text style={styles.optionLocation} numberOfLines={1}>{item.location}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <View
            style={[
              styles.difficultyDot,
              {
                backgroundColor:
                  item.difficulty === "hard" ? "#ef4444"
                  : item.difficulty === "medium" ? "#f59e0b"
                  : "#10b981",
              },
            ]}
          />
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
          {item.time ? (
            <Text style={styles.timeText}>{item.time.slice(0, 5)}</Text>
          ) : null}
        </View>
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

function Section({ title, tasks, onSelect, selectingId }) {
  if (tasks.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{tasks.length}</Text>
      </View>
      {tasks.map((t, i) => (
        <View key={t.id}>
          <TaskOption
            item={t}
            onSelect={onSelect}
            isSelecting={selectingId === t.id}
            disabled={selectingId !== null}
          />
          {i < tasks.length - 1 && <View style={{ height: verticalScale(6) }} />}
        </View>
      ))}
    </View>
  );
}

export default function SwapTaskScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { dailyTask, availableTasks = [], onSwapped } = route.params;

  const [selectingId, setSelectingId] = useState(null);

  const { individual, group, customGroup } = groupBySubcategory(availableTasks);

  const onSelect = async (targetTask) => {
    if (selectingId !== null) return;
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

  const hasAny = individual.length > 0 || group.length > 0 || customGroup.length > 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        style={styles.topGlow}
        colors={["rgba(170, 204, 0, 0.30)", "rgba(86, 121, 20, 0.12)", "rgba(0, 0, 0, 0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={16}
          disabled={selectingId !== null}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && selectingId === null && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.screenTitle}>Switch Task</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + verticalScale(24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Currently assigned</Text>
        <CurrentTaskCard task={dailyTask} />

        <View style={styles.divider} />

        <Text style={styles.label}>Choose a replacement</Text>

        {!hasAny ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No alternative tasks available</Text>
          </View>
        ) : (
          <>
            <Section
              title="Individual"
              tasks={individual}
              onSelect={onSelect}
              selectingId={selectingId}
            />
            <Section
              title="Group"
              tasks={group}
              onSelect={onSelect}
              selectingId={selectingId}
            />
            <Section
              title="Created Group"
              tasks={customGroup}
              onSelect={onSelect}
              selectingId={selectingId}
            />
          </>
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

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: horizontalScale(16),
    gap: verticalScale(4),
  },

  label: {
    color: "#4a4a4a",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: verticalScale(8),
    marginTop: verticalScale(4),
  },

  divider: {
    height: 1,
    backgroundColor: "#FFFFFF08",
    marginVertical: verticalScale(12),
  },

  // Current task card
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
  currentBadge: {
    backgroundColor: "rgba(170, 204, 0, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(170, 204, 0, 0.35)",
    borderRadius: horizontalScale(8),
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    alignSelf: "flex-start",
  },
  currentBadgeText: {
    color: theme.colors.secondary,
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.5,
  },

  // Section
  section: {
    marginBottom: verticalScale(12),
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

  // Task option
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
  optionCardDisabled: {
    opacity: 0.4,
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
  optionLocation: {
    color: "rgba(255,255,255,0.2)",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.normal,
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

  // Shared
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
  metaRow: {
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
  timeText: {
    color: "rgba(255,255,255,0.2)",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.medium,
  },

  empty: {
    paddingTop: verticalScale(32),
    alignItems: "center",
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.normal,
  },
});
