import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import theme from "../../theme";
import { horizontalScale, verticalScale } from "../../theme/sizing";
import { logout } from "../../api/endpoints/auth";
import { uploadProfileImage } from "../../api/endpoints/uploadImage";
import { Image } from "expo-image";

const AVATAR_SIZE = horizontalScale(96);

export default function ProfileScreen() {
  const { user, clearAuth } = useAuth();
  const insets = useSafeAreaInsets();
  const [localImage, setLocalImage] = useState(null);

  console.log(user);

  const onLogoutPress = async () => {
    try {
      await logout();
    } catch (_) {}
    await clearAuth();
  };

  const onAvatarPress = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        await uploadProfileImage({ image: result.assets[0] });
      } catch (err) {
        console.log("Failed to upload profile image", err);
      } finally {
        setLocalImage(result.assets[0].uri);
      }
    }
  };

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "??";

  const level = user?.level?.current ?? 1;
  const currentXp = user?.level?.currentXp ?? user?.xp ?? 0;
  const nextLevelXp = user?.level?.nextLevelXp ?? 100;
  const xpProgress = nextLevelXp > 0 ? Math.min(currentXp / nextLevelXp, 1) : 0;
  const streak = user?.streak ?? 0;

  const imageUri = localImage ?? user?.profileImage ?? null;

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
        <Text style={styles.screenTitle}>Profile</Text>
        <Pressable
          onPress={onLogoutPress}
          style={({ pressed }) => [pressed && { opacity: 0.4 }]}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={onAvatarPress}
          style={({ pressed }) => [
            styles.avatarWrap,
            pressed && { opacity: 0.75 },
          ]}
        >
          <View style={styles.avatar}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.initials}>{initials}</Text>
            )}
          </View>
          <View style={styles.editBadge}>
            <View style={styles.editPlus} />
            <View style={styles.editPlusV} />
          </View>
        </Pressable>

        <Text style={styles.name}>{user?.name ?? "—"}</Text>
        <Text style={styles.email}>{user?.email ?? "—"}</Text>
        {user?.city?.name || user?.university?.name ? (
          <Text style={styles.meta} numberOfLines={1}>
            {[user?.city?.name, user?.university?.name]
              .filter(Boolean)
              .join("  ·  ")}
          </Text>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LEVEL</Text>
          <View style={styles.statRow}>
            <Text style={styles.bigNumber}>{level}</Text>
            <Text style={styles.xpCount}>
              {currentXp} / {nextLevelXp} XP
            </Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.trackFill,
                { width: `${Math.max(xpProgress * 100, 1.5)}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STREAK</Text>
          <View style={styles.streakRow}>
            <Text style={styles.bigNumber}>{streak}</Text>
            <Text style={styles.streakUnit}>
              {streak === 1 ? "day" : "days"}
            </Text>
          </View>
        </View>
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
    height: verticalScale(230),
    zIndex: 0,
  },

  /* Top bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(14),
  },
  screenTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(17),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.2,
  },
  logoutText: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.medium,
  },

  /* Scroll */
  scroll: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(48),
    alignItems: "center",
  },

  /* Avatar */
  avatarWrap: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
    position: "relative",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#1c1a22",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  initials: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(28),
    fontFamily: theme.fontFamily.bold,
    letterSpacing: 2,
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: horizontalScale(24),
    height: horizontalScale(24),
    borderRadius: horizontalScale(12),
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  editPlus: {
    position: "absolute",
    width: horizontalScale(10),
    height: 1.5,
    backgroundColor: "#fff",
    borderRadius: 1,
  },
  editPlusV: {
    position: "absolute",
    width: 1.5,
    height: horizontalScale(10),
    backgroundColor: "#fff",
    borderRadius: 1,
  },

  /* Name / info */
  name: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(26),
    fontFamily: theme.fontFamily.bold,
    textTransform: "capitalize",
    letterSpacing: 0.3,
    marginBottom: verticalScale(4),
    textAlign: "center",
  },
  email: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.normal,
    textAlign: "center",
    marginBottom: verticalScale(6),
  },
  meta: {
    color: "#505050",
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.normal,
    textAlign: "center",
    letterSpacing: 0.3,
  },

  /* Divider */
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#FFFFFF0A",
    marginVertical: verticalScale(28),
  },

  /* Sections */
  section: {
    width: "100%",
    gap: verticalScale(10),
  },
  sectionLabel: {
    color: "#4a4a4a",
    fontSize: horizontalScale(10),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 2.5,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  bigNumber: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(48),
    fontFamily: theme.fontFamily.bold,
    lineHeight: horizontalScale(52),
  },
  xpCount: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.medium,
    marginBottom: verticalScale(6),
  },

  /* XP track */
  track: {
    width: "100%",
    height: verticalScale(3),
    backgroundColor: "#1e1e1e",
    borderRadius: 2,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    backgroundColor: theme.colors.secondary,
    borderRadius: 2,
  },

  /* Streak */
  streakRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: horizontalScale(8),
  },
  streakUnit: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(16),
    fontFamily: theme.fontFamily.medium,
    marginBottom: verticalScale(7),
  },
});
