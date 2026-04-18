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

function TaskItem({ item }) {
  const completed = item.status === "completed";
  const color = CATEGORY_COLOR[item.task?.category] ?? theme.colors.secondary;

  return (
    <View style={[styles.taskCard, completed && styles.taskCardCompleted]}>
      {item.photo_url ? (
        <Image
          source={{ uri: item.photo_url }}
          style={styles.taskPhoto}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.taskPhotoPlaceholder, { borderColor: color + "44" }]}>
          <Text style={[styles.taskPhotoPlaceholderText, { color: color + "66" }]}>
            No photo
          </Text>
        </View>
      )}

      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle} numberOfLines={2}>
          {item.task?.title}
        </Text>
        <Text style={styles.taskDesc} numberOfLines={3}>
          {item.task?.description}
        </Text>

        <View style={styles.taskMeta}>
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

export default function TaskDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { tasks = [], category } = route.params ?? {};

  const label = CATEGORY_LABEL[category] ?? category ?? "Tasks";
  const color = CATEGORY_COLOR[category] ?? theme.colors.secondary;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        style={styles.topGlow}
        colors={[
          color + "55",
          color + "22",
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
        <Text style={styles.screenTitle}>{label} Tasks</Text>
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
        {tasks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No {label.toLowerCase()} tasks found</Text>
          </View>
        ) : (
          tasks.map((item) => <TaskItem key={item.id} item={item} />)
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
    gap: verticalScale(10),
  },

  taskCard: {
    flexDirection: "row",
    borderRadius: horizontalScale(16),
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    padding: horizontalScale(12),
    gap: horizontalScale(12),
  },
  taskCardCompleted: {
    borderColor: "rgba(170, 204, 0, 0.25)",
    backgroundColor: "rgba(170, 204, 0, 0.04)",
  },

  taskPhoto: {
    width: horizontalScale(80),
    height: horizontalScale(80),
    borderRadius: horizontalScale(12),
    flexShrink: 0,
  },
  taskPhotoPlaceholder: {
    width: horizontalScale(80),
    height: horizontalScale(80),
    borderRadius: horizontalScale(12),
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  taskPhotoPlaceholderText: {
    fontSize: horizontalScale(9),
    fontFamily: theme.fontFamily.medium,
  },

  taskInfo: {
    flex: 1,
    justifyContent: "space-between",
    gap: verticalScale(4),
  },
  taskTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: horizontalScale(18),
  },
  taskDesc: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.normal,
    lineHeight: horizontalScale(16),
    flex: 1,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(6),
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
