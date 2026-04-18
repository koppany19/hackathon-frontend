import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FlashList } from "@shopify/flash-list";
import Skeleton from "react-native-reanimated-skeleton";
import { fetchLeaderboard } from "../../api/endpoints/leaderboard";
import theme from "../../theme";
import { horizontalScale, verticalScale } from "../../theme/sizing";

const MEDAL_COLORS = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

const PODIUM_AVATAR = {
  1: horizontalScale(72),
  2: horizontalScale(58),
  3: horizontalScale(54),
};

const SKELETON_BONE = "rgba(255,255,255,0.07)";
const SKELETON_HIGHLIGHT = "rgba(255,255,255,0.13)";

function getInitials(name) {
  return name ? name.slice(0, 2).toUpperCase() : "?";
}

function Avatar({ uri, name, size, borderColor }) {
  return (
    <View
      style={[
        styles.avatarBase,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: borderColor ?? "transparent",
          borderWidth: borderColor ? 2 : 0,
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={[styles.avatarInitials, { fontSize: size * 0.3 }]}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}

function PodiumSlot({ user, rank }) {
  const avatarSize = PODIUM_AVATAR[rank];
  const medalColor = MEDAL_COLORS[rank];
  const isFirst = rank === 1;

  return (
    <View style={[styles.podiumSlot, isFirst && styles.podiumSlotFirst]}>
      <View style={styles.rankBadge}>
        <Text style={[styles.rankBadgeText, { color: medalColor }]}>
          {rank}
        </Text>
      </View>
      <Avatar
        uri={user.profile_image}
        name={user.name}
        size={avatarSize}
        borderColor={medalColor}
      />
      <Text style={styles.podiumName} numberOfLines={1}>
        {user.name}
      </Text>
      <Text style={[styles.podiumXp, { color: medalColor }]}>
        {user.xp ?? 0} XP
      </Text>
      <View
        style={[
          styles.podiumPillar,
          {
            height: isFirst
              ? verticalScale(60)
              : rank === 2
                ? verticalScale(42)
                : verticalScale(28),
            backgroundColor: medalColor + "22",
            borderTopWidth: 2,
            borderTopColor: medalColor + "66",
          },
        ]}
      />
    </View>
  );
}

function ListItem({ user, rank }) {
  return (
    <View style={styles.listItem}>
      <Text style={styles.listRank}>{rank}</Text>
      <Avatar
        uri={user.profile_image}
        name={user.name}
        size={horizontalScale(40)}
      />
      <View style={styles.listInfo}>
        <Text style={styles.listName} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.listLevel}>Level {user.level ?? 1}</Text>
      </View>
      <Text style={styles.listXp}>{user.xp ?? 0} XP</Text>
    </View>
  );
}

const SCREEN_W = Dimensions.get("window").width;
// podium slot width: (screen - horizontal padding 32 - two gaps 16) / 3
const SLOT_W = Math.floor((SCREEN_W - horizontalScale(48)) / 3);

function SkeletonBone({ w, h, r = 6, mt = 0 }) {
  return (
    <View
      style={{
        width: w,
        height: h,
        borderRadius: r,
        marginTop: mt,
      }}
    />
  );
}

function LeaderboardLoadingSkeleton() {
  const props = {
    isLoading: true,
    duration: 1050,
    animationType: "shiver",
    boneColor: SKELETON_BONE,
    highlightColor: SKELETON_HIGHLIGHT,
  };

  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.skeletonScroll}
    >
      {/* Podium */}
      <Skeleton {...props} containerStyle={styles.skeletonPodiumWrap}>
        <View style={styles.skeletonPodiumRow}>
          {/* 2nd place */}
          <View style={[styles.skeletonSlot, { marginTop: verticalScale(28) }]}>
            <SkeletonBone w={horizontalScale(22)} h={horizontalScale(22)} r={11} />
            <SkeletonBone w={PODIUM_AVATAR[2]} h={PODIUM_AVATAR[2]} r={PODIUM_AVATAR[2] / 2} mt={verticalScale(6)} />
            <SkeletonBone w={horizontalScale(50)} h={verticalScale(10)} mt={verticalScale(6)} />
            <SkeletonBone w={horizontalScale(36)} h={verticalScale(9)} mt={verticalScale(4)} />
            <SkeletonBone w={SLOT_W} h={verticalScale(42)} r={4} mt={verticalScale(6)} />
          </View>
          {/* 1st place */}
          <View style={styles.skeletonSlot}>
            <SkeletonBone w={horizontalScale(22)} h={horizontalScale(22)} r={11} />
            <SkeletonBone w={PODIUM_AVATAR[1]} h={PODIUM_AVATAR[1]} r={PODIUM_AVATAR[1] / 2} mt={verticalScale(6)} />
            <SkeletonBone w={horizontalScale(64)} h={verticalScale(10)} mt={verticalScale(6)} />
            <SkeletonBone w={horizontalScale(36)} h={verticalScale(9)} mt={verticalScale(4)} />
            <SkeletonBone w={SLOT_W} h={verticalScale(60)} r={4} mt={verticalScale(6)} />
          </View>
          {/* 3rd place */}
          <View style={[styles.skeletonSlot, { marginTop: verticalScale(28) }]}>
            <SkeletonBone w={horizontalScale(22)} h={horizontalScale(22)} r={11} />
            <SkeletonBone w={PODIUM_AVATAR[3]} h={PODIUM_AVATAR[3]} r={PODIUM_AVATAR[3] / 2} mt={verticalScale(6)} />
            <SkeletonBone w={horizontalScale(50)} h={verticalScale(10)} mt={verticalScale(6)} />
            <SkeletonBone w={horizontalScale(36)} h={verticalScale(9)} mt={verticalScale(4)} />
            <SkeletonBone w={SLOT_W} h={verticalScale(28)} r={4} mt={verticalScale(6)} />
          </View>
        </View>
      </Skeleton>

      {/* Rankings header */}
      <Skeleton {...props} containerStyle={styles.skeletonSectionHeader}>
        <SkeletonBone w={horizontalScale(86)} h={verticalScale(10)} />
      </Skeleton>

      {/* List rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} {...props} containerStyle={styles.skeletonRow}>
          <SkeletonBone w={horizontalScale(18)} h={verticalScale(12)} r={4} />
          <SkeletonBone w={horizontalScale(40)} h={horizontalScale(40)} r={20} />
          <View style={styles.skeletonRowInfo}>
            <SkeletonBone w={horizontalScale(120)} h={verticalScale(11)} />
            <SkeletonBone w={horizontalScale(72)} h={verticalScale(9)} mt={verticalScale(5)} />
          </View>
          <SkeletonBone w={horizontalScale(44)} h={verticalScale(11)} />
        </Skeleton>
      ))}
    </ScrollView>
  );
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchLeaderboard();
      const list = Array.isArray(res) ? res : (res.data ?? []);
      setData(list);
    } catch (e) {
      setError(e.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  const renderItem = useCallback(
    ({ item, index }) => <ListItem user={item} rank={index + 4} />,
    [],
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  const ListHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderText}>Rankings</Text>
    </View>
  );

  const ListEmpty = !loading && (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No more players yet.</Text>
    </View>
  );

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

      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Leaderboard</Text>
      </View>

      {loading ? (
        <LeaderboardLoadingSkeleton />
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
        <FlashList
          data={rest}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          estimatedItemSize={verticalScale(64)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flashContent}
          ListHeaderComponent={
            <>
              {/* Podium */}
              {top3.length > 0 && (
                <View style={styles.podium}>
                  {top3[1] && <PodiumSlot user={top3[1]} rank={2} />}
                  {top3[0] && <PodiumSlot user={top3[0]} rank={1} />}
                  {top3[2] && <PodiumSlot user={top3[2]} rank={3} />}
                </View>
              )}
              {rest.length > 0 && ListHeader}
            </>
          }
          ListEmptyComponent={ListEmpty}
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

  topBar: {
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(14),
  },
  screenTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(17),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.2,
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

  flashContent: {
    paddingBottom: verticalScale(120),
  },

  skeletonScroll: {
    paddingBottom: verticalScale(120),
  },
  skeletonPodiumWrap: {
    width: SCREEN_W,
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(8),
  },
  skeletonPodiumRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: horizontalScale(8),
  },
  skeletonSlot: {
    width: SLOT_W,
    alignItems: "center",
  },
  skeletonSectionHeader: {
    width: SCREEN_W,
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(12),
  },
  skeletonRow: {
    width: SCREEN_W,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(10),
    gap: horizontalScale(12),
  },
  skeletonRowInfo: {
    flex: 1,
  },

  /* Podium */
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(8),
    gap: horizontalScale(8),
  },
  podiumSlot: {
    flex: 1,
    alignItems: "center",
    gap: verticalScale(6),
  },
  podiumSlotFirst: {
    marginBottom: verticalScale(16),
  },
  rankBadge: {
    width: horizontalScale(22),
    height: horizontalScale(22),
    borderRadius: horizontalScale(11),
    backgroundColor: "#FFFFFF08",
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: {
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.bold,
  },
  podiumName: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.semiBold,
    textAlign: "center",
    textTransform: "capitalize",
  },
  podiumXp: {
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.medium,
  },
  podiumPillar: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  avatarBase: {
    backgroundColor: "#1c1a22",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInitials: {
    color: theme.colors.text.primary,
    fontFamily: theme.fontFamily.bold,
  },

  /* List */
  listHeader: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(12),
  },
  listHeaderText: {
    color: "#4a4a4a",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 2.5,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(10),
    gap: horizontalScale(12),
  },
  listRank: {
    width: horizontalScale(20),
    color: "#4a4a4a",
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.semiBold,
    textAlign: "center",
  },
  listInfo: {
    flex: 1,
    gap: verticalScale(2),
  },
  listName: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(14),
    fontFamily: theme.fontFamily.semiBold,
    textTransform: "capitalize",
  },
  listLevel: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.normal,
  },
  listXp: {
    color: theme.colors.secondary,
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.semiBold,
  },
  separator: {
    height: 1,
    backgroundColor: "#FFFFFF06",
    marginHorizontal: horizontalScale(24),
  },

  empty: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(16),
  },
  emptyText: {
    color: "#4a4a4a",
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.normal,
  },
});
