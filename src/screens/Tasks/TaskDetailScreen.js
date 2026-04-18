import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../../theme";
import { horizontalScale, verticalScale } from "../../theme/sizing";

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

function DailyTaskCard({ item }) {
  const completed = item.status === "completed";
  return (
    <View style={[styles.dailyCard, completed && styles.dailyCardCompleted]}>
      {item.photo_url ? (
        <Image
          source={{ uri: item.photo_url }}
          style={styles.dailyPhoto}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.dailyPhotoPlaceholder}>
          <Text style={styles.dailyPhotoPlaceholderText}>No photo</Text>
        </View>
      )}
      <View style={styles.dailyInfo}>
        <Text style={styles.dailyTitle} numberOfLines={2}>
          {item.task?.title}
        </Text>
        <Text style={styles.dailyDesc} numberOfLines={3}>
          {item.task?.description}
        </Text>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.difficultyDot,
              {
                backgroundColor:
                  item.task?.difficulty === "hard"
                    ? "#ef4444"
                    : item.task?.difficulty === "medium"
                      ? "#f59e0b"
                      : "#10b981",
              },
            ]}
          />
          <Text style={styles.difficultyText}>{item.task?.difficulty}</Text>
          {completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>Completed</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function AvailableTaskCard({ item }) {
  return (
    <View style={styles.availableCard}>
      <View style={styles.availableInfo}>
        <Text style={styles.availableTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.availableDesc} numberOfLines={2}>
          {item.description}
        </Text>
        {item.location ? (
          <Text style={styles.availableLocation} numberOfLines={1}>
            📍 {item.location}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <View
            style={[
              styles.difficultyDot,
              {
                backgroundColor:
                  item.difficulty === "hard"
                    ? "#ef4444"
                    : item.difficulty === "medium"
                      ? "#f59e0b"
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
    </View>
  );
}

function SectionBlock({ title, tasks }) {
  if (tasks.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{tasks.length}</Text>
      </View>
      {tasks.map((t, i) => (
        <View key={t.id}>
          <AvailableTaskCard item={t} />
          {i < tasks.length - 1 && <View style={styles.gap} />}
        </View>
      ))}
    </View>
  );
}

export default function TaskDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { dailyTasks = [], availableTasks = [], category } = route.params ?? {};

  const label = CATEGORY_LABEL[category] ?? category ?? "Tasks";
  const color = CATEGORY_COLOR[category] ?? theme.colors.secondary;

  const { individual, group, customGroup } = groupBySubcategory(availableTasks);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        style={styles.topGlow}
        colors={[color + "55", color + "22", "rgba(0, 0, 0, 0)"]}
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
        <Text style={styles.screenTitle}>{label}</Text>
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
        {dailyTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YOUR TASK TODAY</Text>
            {dailyTasks.map((item) => (
              <DailyTaskCard key={item.id} item={item} />
            ))}
          </View>
        )}

        {(individual.length > 0 ||
          group.length > 0 ||
          customGroup.length > 0) && <View style={styles.divider} />}

        <SectionBlock title="Individual Tasks" tasks={individual} />
        <SectionBlock title="Group Tasks" tasks={group} />
        <SectionBlock title="Created-Group Tasks" tasks={customGroup} />

        {dailyTasks.length === 0 &&
          individual.length === 0 &&
          group.length === 0 &&
          customGroup.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No {label.toLowerCase()} tasks found
              </Text>
            </View>
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
    gap: verticalScale(12),
  },

  sectionLabel: {
    color: "#4a4a4a",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: verticalScale(8),
  },

  divider: {
    height: 1,
    backgroundColor: "#FFFFFF08",
    marginVertical: verticalScale(4),
  },

  section: {
    gap: verticalScale(0),
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
  gap: {
    height: verticalScale(8),
  },

  // Daily task card
  dailyCard: {
    flexDirection: "row",
    borderRadius: horizontalScale(16),
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    padding: horizontalScale(12),
    gap: horizontalScale(12),
  },
  dailyCardCompleted: {
    borderColor: "rgba(170, 204, 0, 0.25)",
    backgroundColor: "rgba(170, 204, 0, 0.04)",
  },
  dailyPhoto: {
    width: horizontalScale(72),
    height: horizontalScale(72),
    borderRadius: horizontalScale(10),
    flexShrink: 0,
  },
  dailyPhotoPlaceholder: {
    width: horizontalScale(72),
    height: horizontalScale(72),
    borderRadius: horizontalScale(10),
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dailyPhotoPlaceholderText: {
    color: "rgba(255,255,255,0.2)",
    fontSize: horizontalScale(9),
    fontFamily: theme.fontFamily.medium,
  },
  dailyInfo: {
    flex: 1,
    gap: verticalScale(4),
    justifyContent: "center",
  },
  dailyTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: horizontalScale(18),
  },
  dailyDesc: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.normal,
    lineHeight: horizontalScale(16),
  },

  // Available task card
  availableCard: {
    borderRadius: horizontalScale(14),
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: horizontalScale(14),
  },
  availableInfo: {
    gap: verticalScale(5),
  },
  availableTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: horizontalScale(18),
  },
  availableDesc: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.normal,
    lineHeight: horizontalScale(16),
  },
  availableLocation: {
    color: "rgba(255,255,255,0.25)",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.normal,
  },
  timeText: {
    color: "rgba(255,255,255,0.25)",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.medium,
    marginLeft: horizontalScale(4),
  },

  // Shared
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(5),
    flexWrap: "wrap",
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
  completedBadge: {
    backgroundColor: "rgba(170, 204, 0, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(170, 204, 0, 0.3)",
    borderRadius: horizontalScale(6),
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(1),
  },
  completedBadgeText: {
    color: theme.colors.secondary,
    fontSize: horizontalScale(9),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.4,
  },

  empty: {
    paddingTop: verticalScale(60),
    alignItems: "center",
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.normal,
  },
});
