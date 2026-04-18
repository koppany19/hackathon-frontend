import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Skeleton from "react-native-reanimated-skeleton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../../context/AuthContext";
import theme from "../../theme";
import { horizontalScale, verticalScale } from "../../theme/sizing";
import { getFeed } from "../../api/endpoints/feed";

const AVATAR_SIZE = horizontalScale(36);
const IMAGE_H = verticalScale(210);
const STACK_OFFSET = verticalScale(9);
const MAX_STACK = 3;

const CATEGORY_COLOR = {
  meal: "#f59e0b",
  sport: "#3b82f6",
  mental_health: "#8b5cf6",
  social: "#ec4899",
};

const CATEGORY_LABEL = {
  meal: "Nutrition",
  sport: "Sport",
  mental_health: "Mental",
  social: "Social",
};

const SKELETON_BONE = "rgba(255,255,255,0.07)";
const SKELETON_HIGHLIGHT = "rgba(255,255,255,0.13)";

function FeedCardSkeleton() {
  return (
    <Skeleton
      isLoading
      duration={1050}
      animationType="shiver"
      boneColor={SKELETON_BONE}
      highlightColor={SKELETON_HIGHLIGHT}
      containerStyle={styles.skeletonCard}
    >
      {/* Header row */}
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonHeaderText}>
          <View style={styles.skeletonName} />
          <View style={styles.skeletonSubtitle} />
        </View>
      </View>
      {/* Image block */}
      <View style={styles.skeletonImage} />
    </Skeleton>
  );
}

function groupByUser(posts) {
  if (!Array.isArray(posts) || posts.length === 0) return [];
  const map = new Map();
  for (const post of posts) {
    const key = post.user_name ?? "unknown";
    if (!map.has(key)) {
      map.set(key, {
        user: { name: post.user_name, profile_image: post.profile_image },
        posts: [],
      });
    }
    map.get(key).posts.push(post);
  }
  return Array.from(map.values());
}

function normalizeFeed(res, tab) {
  const sameUni = res?.same_university ?? [];
  const others = res?.other_universities ?? [];
  const posts = tab === "university" ? sameUni : [...sameUni, ...others];
  return groupByUser(posts);
}

function Avatar({ uri, name }) {
  const initials = name?.slice(0, 2).toUpperCase() ?? "??";
  return (
    <View style={styles.avatar}>
      {uri ? (
        <Image source={{ uri }} style={styles.avatarImg} contentFit="cover" />
      ) : (
        <Text style={styles.avatarInitials}>{initials}</Text>
      )}
    </View>
  );
}

function PostImage({ post }) {
  const cat = post?.task?.category;
  const color = CATEGORY_COLOR[cat] ?? theme.colors.secondary;
  const label = CATEGORY_LABEL[cat] ?? null;

  return (
    <View style={styles.imageWrapper}>
      {post?.photo_url ? (
        <Image
          source={{ uri: post.photo_url }}
          style={styles.postImage}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.postImage, styles.imagePlaceholder]} />
      )}

      <LinearGradient
        style={styles.imageGradient}
        colors={["transparent", "rgba(0,0,0,0.68)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />

      {label ? (
        <View
          style={[
            styles.categoryPill,
            { borderColor: color + "80", backgroundColor: color + "22" },
          ]}
        >
          <Text style={[styles.categoryText, { color }]}>{label}</Text>
        </View>
      ) : null}

      {post?.task?.title ? (
        <Text style={styles.taskLabel} numberOfLines={1}>
          {post.task.title}
        </Text>
      ) : null}
    </View>
  );
}

function StackedImages({ posts }) {
  const [topIdx, setTopIdx] = useState(0);

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);
  const opa = useSharedValue(1);

  const remaining = posts.length - topIdx;
  const count = Math.min(remaining, MAX_STACK);
  const canFlip = remaining > 1;

  const advance = () => {
    setTopIdx((i) => i + 1);
    tx.value = 0;
    ty.value = 0;
    rot.value = 0;
    opa.value = 1;
  };

  const onFlip = () => {
    if (!canFlip) return;
    tx.value = withTiming(500, { duration: 320 });
    ty.value = withTiming(-70, { duration: 320 });
    rot.value = withTiming(22, { duration: 320 });
    opa.value = withTiming(0, { duration: 260 }, (done) => {
      if (done) runOnJS(advance)();
    });
  };

  const topAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
    ],
    opacity: opa.value,
  }));

  const containerH = IMAGE_H + (count - 1) * STACK_OFFSET;

  return (
    <View style={{ height: containerH }}>
      {Array.from({ length: count })
        .map((_, i) => i)
        .reverse()
        .map((i) => {
          const post = posts[topIdx + i];
          const isTop = i === 0;

          const cardBase = {
            position: "absolute",
            top: i * STACK_OFFSET,
            left: 0,
            right: 0,
            height: IMAGE_H,
            borderRadius: horizontalScale(14),
            overflow: "hidden",
            zIndex: MAX_STACK - i,
          };

          if (isTop) {
            return (
              <Animated.View
                key={post?.id ?? i}
                style={[cardBase, topAnimStyle]}
              >
                <Pressable
                  onPress={onFlip}
                  style={StyleSheet.absoluteFill}
                  disabled={!canFlip}
                >
                  <PostImage post={post} />
                </Pressable>

                {canFlip && (
                  <View style={styles.counterBadge} pointerEvents="none">
                    <Text style={styles.counterText}>
                      {topIdx + 1} / {posts.length}
                    </Text>
                  </View>
                )}
              </Animated.View>
            );
          }

          return (
            <View
              key={post?.id ?? i}
              style={[
                cardBase,
                {
                  transform: [{ scale: 1 - i * 0.025 }],
                  opacity: 1 - i * 0.18,
                },
              ]}
            >
              <PostImage post={post} />
            </View>
          );
        })}
    </View>
  );
}

function PostCard({ item }) {
  const { user, posts } = item;
  const hasPosts = Array.isArray(posts) && posts.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar uri={user?.profile_image} name={user?.name} />
        <View style={styles.headerMeta}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name ?? "—"}
          </Text>
          {hasPosts && (
            <Text style={styles.postCount}>
              {posts.length} {posts.length === 1 ? "task" : "tasks"} today
            </Text>
          )}
        </View>
      </View>

      {hasPosts && (
        <View style={styles.imageArea}>
          {posts.length === 1 ? (
            <View style={styles.singleWrap}>
              <PostImage post={posts[0]} />
            </View>
          ) : (
            <StackedImages posts={posts} />
          )}
        </View>
      )}
    </View>
  );
}

const TABS = [
  { key: "university", label: "University" },
  { key: "global", label: "Global" },
];

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [tab, setTab] = useState("university");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const universityId = user?.university?.id ?? null;
  const [rawFeed, setRawFeed] = useState(null);

  const load = useCallback(async () => {
    if (!universityId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await getFeed(universityId);
      setRawFeed(res);
    } catch (e) {
      setError(e.message ?? "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [universityId]);

  useEffect(() => {
    load();
  }, [load]);

  const feed = rawFeed ? normalizeFeed(rawFeed, tab) : [];

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

      <View style={styles.header}>
        <Text style={styles.screenTitle}>Feed</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={({ pressed }) => [
                styles.tabPill,
                active && styles.tabPillActive,
                pressed && !active && { opacity: 0.55 },
              ]}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <ScrollView
          contentContainerStyle={styles.skeletonList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <FeedCardSkeleton key={i} />
          ))}
        </ScrollView>
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
      ) : feed.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubtext}>
            Complete tasks to see posts here
          </Text>
        </View>
      ) : (
        <FlashList
          data={feed}
          renderItem={({ item }) => <PostCard item={item} />}
          estimatedItemSize={320}
          keyExtractor={(item, index) => item.user?.name ?? String(index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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

  // Header
  header: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(12),
  },
  screenTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(17),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.2,
  },

  tabRow: {
    flexDirection: "row",
    marginHorizontal: horizontalScale(24),
    marginBottom: verticalScale(16),
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: horizontalScale(12),
    padding: horizontalScale(3),
    gap: horizontalScale(3),
  },
  tabPill: {
    flex: 1,
    paddingVertical: verticalScale(8),
    borderRadius: horizontalScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  tabPillActive: {
    backgroundColor: theme.colors.secondary,
  },
  tabLabel: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.4,
  },
  tabLabelActive: {
    color: "#050706",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(8),
  },
  errorText: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.normal,
    textAlign: "center",
    paddingHorizontal: horizontalScale(32),
  },
  retryBtn: {
    marginTop: verticalScale(4),
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
    color: "rgba(255,255,255,0.25)",
    fontSize: horizontalScale(14),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.3,
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.12)",
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.normal,
    letterSpacing: 0.2,
  },

  listContent: {
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(24),
  },
  separator: {
    height: verticalScale(12),
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: horizontalScale(16),
    overflow: "visible",
    padding: horizontalScale(12),
    gap: verticalScale(10),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(10),
  },
  headerMeta: {
    flex: 1,
    gap: verticalScale(1),
  },
  userName: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.1,
  },
  postCount: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.normal,
    letterSpacing: 0.2,
  },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  avatarImg: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarInitials: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.5,
  },

  imageArea: {},
  singleWrap: {
    height: IMAGE_H,
    borderRadius: horizontalScale(14),
    overflow: "hidden",
  },

  imageWrapper: {
    flex: 1,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  categoryPill: {
    position: "absolute",
    top: horizontalScale(10),
    left: horizontalScale(10),
    borderWidth: 1,
    borderRadius: horizontalScale(6),
    paddingHorizontal: horizontalScale(7),
    paddingVertical: verticalScale(2),
  },
  categoryText: {
    fontSize: horizontalScale(9),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  taskLabel: {
    position: "absolute",
    bottom: verticalScale(10),
    left: horizontalScale(10),
    right: horizontalScale(10),
    color: "rgba(255,255,255,0.9)",
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.1,
  },

  counterBadge: {
    position: "absolute",
    top: horizontalScale(10),
    right: horizontalScale(10),
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: horizontalScale(8),
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(3),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  counterText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: horizontalScale(9),
    fontFamily: theme.fontFamily.medium,
    letterSpacing: 0.3,
  },

  // Skeleton
  skeletonList: {
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(24),
    gap: verticalScale(12),
  },
  skeletonCard: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: horizontalScale(16),
    padding: horizontalScale(12),
    gap: verticalScale(10),
  },
  skeletonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(10),
  },
  skeletonAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  skeletonHeaderText: {
    flex: 1,
    gap: verticalScale(5),
  },
  skeletonName: {
    width: horizontalScale(110),
    height: verticalScale(11),
    borderRadius: horizontalScale(5),
  },
  skeletonSubtitle: {
    width: horizontalScale(70),
    height: verticalScale(9),
    borderRadius: horizontalScale(5),
  },
  skeletonImage: {
    height: IMAGE_H,
    borderRadius: horizontalScale(14),
  },
});
