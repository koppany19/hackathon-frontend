import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import theme from "../../theme";
import { horizontalScale, verticalScale } from "../../theme/sizing";
import { getTodayTasks, uploadTaskPhoto, getAvailableDailyTasks } from "../../api/endpoints/tasks";

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

function CategoryBadge({ category }) {
  const label = CATEGORY_LABEL[category] ?? category;
  const color = CATEGORY_COLOR[category] ?? theme.colors.secondary;
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + "22", borderColor: color + "55" },
      ]}
    >
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function TaskCard({ item, onPhotoUploaded, onSwapped, cardHeight, navigation }) {
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState(item.photo_url ?? null);
  const completed = item.status === "completed";

  const scale = useSharedValue(1);
  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Permission denied",
          text2: "Gallery access is required",
        });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.85,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      scale.value = withSpring(0.96, { damping: 10 }, () => {
        scale.value = withSpring(1, { damping: 12 });
      });

      setUploading(true);
      try {
        await uploadTaskPhoto(item.id, asset);
        setPhoto(asset.uri);
        onPhotoUploaded(item.id);
        Toast.show({
          type: "success",
          text1: "Photo uploaded",
          text2: "Task evidence saved",
        });
      } catch (e) {
        Toast.show({
          type: "error",
          text1: "Upload failed",
          text2: e.message ?? "Please try again",
        });
      } finally {
        setUploading(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onSwap = () => {
    navigation.navigate("SwapTask", { dailyTask: item, onSwapped });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        { height: cardHeight },
        cardAnimStyle,
        completed && styles.cardCompleted,
      ]}
    >
      {/* Left — photo upload */}
      <Pressable
        onPress={onPickImage}
        disabled={uploading || completed}
        style={({ pressed }) => [
          styles.photoBox,
          photo && styles.photoBoxFilled,
          pressed && { opacity: 0.75 },
        ]}
      >
        {uploading ? (
          <ActivityIndicator color={theme.colors.secondary} size="small" />
        ) : photo ? (
          <Image
            source={{ uri: photo }}
            style={styles.photoImage}
            resizeMode="cover"
          />
        ) : (
          <>
            <View style={styles.uploadIcon}>
              <Text style={styles.uploadIconGlyph}>+</Text>
            </View>
            <Text style={styles.uploadLabel}>Add photo</Text>
          </>
        )}
      </Pressable>

      {/* Right — info */}
      <View style={styles.cardBody}>
        <CategoryBadge category={item.task.category} />

        <Text style={styles.taskTitle} numberOfLines={2}>
          {item.task.title}
        </Text>
        <Text style={styles.taskDesc} numberOfLines={3}>
          {item.task.description}
        </Text>

        <View style={styles.cardFooter}>
          <View
            style={[
              styles.difficultyDot,
              {
                backgroundColor:
                  item.task.difficulty === "hard"
                    ? "#ef4444"
                    : item.task.difficulty === "medium"
                      ? "#f59e0b"
                      : "#10b981",
              },
            ]}
          />
          <Text style={styles.difficultyText}>{item.task.difficulty}</Text>
        </View>

        <Pressable
          onPress={onSwap}
          disabled={completed}
          style={({ pressed }) => [
            styles.swapBtn,
            completed && styles.swapBtnDisabled,
            pressed && !completed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.swapBtnText}>
            {completed ? "Completed" : "Swap task"}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function TasksScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTodayTasks();
      const all = res.tasks ?? res ?? [];
      const picked = ["meal", "sport", "mental_health"].reduce((acc, cat) => {
        const match = all.find((t) => t.task?.category === cat);
        if (match) acc.push(match);
        return acc;
      }, []);
      setTasks(picked);
    } catch (e) {
      setError(e.message ?? "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getAvailableDailyTasks()
      .then((res) => console.log("Available daily tasks:", JSON.stringify(res, null, 2)))
      .catch((e) => console.log("Available daily tasks error:", e.message));
  }, []);

  const onPhotoUploaded = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "completed" } : t)),
    );
  }, []);

  const onSwapped = useCallback(() => {
    load();
  }, [load]);

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length || 3;

  const TOP_BAR_H = verticalScale(50);
  const PROGRESS_H = verticalScale(64);
  const BOTTOM_TAB_H = verticalScale(70);
  const availableHeight =
    screenHeight - insets.top - TOP_BAR_H - PROGRESS_H - BOTTOM_TAB_H;
  const cardHeight = Math.floor(availableHeight / total) - verticalScale(8);

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

      {/* Header */}
      <View style={[styles.topBar, { height: TOP_BAR_H }]}>
        <Text style={styles.screenTitle}>Today's Tasks</Text>
        <Text style={styles.dateLabel}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>

      {/* Progress */}
      <View style={[styles.progressSection, { height: PROGRESS_H }]}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Daily Progress</Text>
          <Text style={styles.progressCount}>
            <Text style={styles.progressCountHighlight}>{completedCount}</Text>
            <Text style={styles.progressCountDim}> / {total}</Text>
          </Text>
        </View>
        <View style={styles.progressTrack}>
          {Array.from({ length: total }).map((_, i) => {
            const filled = i < completedCount;
            const isLast = i === total - 1;
            return (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  !isLast && styles.progressSegmentGap,
                  filled
                    ? styles.progressSegmentFilled
                    : styles.progressSegmentEmpty,
                ]}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.separator} />

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.secondary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={load}
            style={({ pressed }) => [
              styles.retryBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.taskList}>
          {tasks.map((item) => (
            <TaskCard
              key={item.id}
              item={item}
              cardHeight={cardHeight}
              onPhotoUploaded={onPhotoUploaded}
              onSwapped={onSwapped}
              navigation={navigation}
            />
          ))}
        </View>
      )}
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(24),
  },
  screenTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(17),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.2,
  },
  dateLabel: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.normal,
  },

  progressSection: {
    paddingHorizontal: horizontalScale(24),
    justifyContent: "center",
    gap: verticalScale(8),
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.medium,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  progressCount: {},
  progressCountHighlight: {
    color: theme.colors.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.bold,
  },
  progressCountDim: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.normal,
  },
  progressTrack: {
    flexDirection: "row",
    height: verticalScale(6),
    borderRadius: horizontalScale(4),
    overflow: "hidden",
    gap: horizontalScale(4),
  },
  progressSegment: {
    flex: 1,
    borderRadius: horizontalScale(4),
  },
  progressSegmentGap: {},
  progressSegmentFilled: {
    backgroundColor: theme.colors.secondary,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  progressSegmentEmpty: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  separator: {
    height: 1,
    backgroundColor: "#FFFFFF08",
    marginBottom: verticalScale(8),
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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

  taskList: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
    gap: verticalScale(8),
  },

  card: {
    flexDirection: "row",
    borderRadius: horizontalScale(16),
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    padding: horizontalScale(12),
    gap: horizontalScale(12),
  },
  cardCompleted: {
    borderColor: "rgba(170, 204, 0, 0.25)",
    backgroundColor: "rgba(170, 204, 0, 0.04)",
  },

  photoBox: {
    width: horizontalScale(80),
    borderRadius: horizontalScale(12),
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(4),
    overflow: "hidden",
    flexShrink: 0,
  },
  photoBoxFilled: {
    borderColor: "rgba(170, 204, 0, 0.4)",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  uploadIcon: {
    width: horizontalScale(28),
    height: horizontalScale(28),
    borderRadius: horizontalScale(14),
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIconGlyph: {
    color: "rgba(255,255,255,0.3)",
    fontSize: horizontalScale(18),
    lineHeight: horizontalScale(22),
    fontFamily: theme.fontFamily.normal,
  },
  uploadLabel: {
    color: "rgba(255,255,255,0.25)",
    fontSize: horizontalScale(9),
    fontFamily: theme.fontFamily.medium,
    textAlign: "center",
  },

  cardBody: {
    flex: 1,
    justifyContent: "space-between",
  },
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
  taskTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: horizontalScale(18),
    flexShrink: 1,
  },
  taskDesc: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.normal,
    lineHeight: horizontalScale(16),
    flexShrink: 1,
  },
  cardFooter: {
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

  swapBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: horizontalScale(8),
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(10),
  },
  swapBtnDisabled: {
    opacity: 0.35,
  },
  swapBtnText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.medium,
    letterSpacing: 0.3,
  },
});
