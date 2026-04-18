import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import theme from "../../theme";
import { horizontalScale, verticalScale } from "../../theme/sizing";
import CustomIcon from "../../assets/icons/CustomIcon";
import {
  replaceScheduleFromImage,
  getSchedules,
} from "../../api/endpoints/schedules";
import { useAuth } from "../../context/AuthContext";

export default function UpdateTimetableScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { updateScheduleItems } = useAuth();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const scale = useSharedValue(1);
  const checkOpacity = useSharedValue(0);

  const onPickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: "Error",
          text1: "Permission denied",
          text2: "Gallery access is required to upload your timetable",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled) {
        scale.value = withSpring(0.95, { damping: 10 }, () => {
          scale.value = withSpring(1, { damping: 12 });
        });
        checkOpacity.value = withTiming(1, { duration: 250 });
        setImage(result.assets[0]);
      }
    } catch (e) {
      Toast.show({
        type: "Error",
        text1: "Image picker failed",
        text2: e.message || "Could not open the image library.",
      });
    }
  };

  const onSubmit = async () => {
    if (!image || loading) return;
    setLoading(true);
    try {
      await replaceScheduleFromImage({ image });
      const schedules = await getSchedules();
      updateScheduleItems(schedules);
      Toast.show({
        type: "Success",
        text1: "Timetable updated",
        text2: "Your schedule has been refreshed",
      });
      navigation.goBack();
    } catch (e) {
      Toast.show({
        type: "Error",
        text1: "Something went wrong",
        text2: e.message ?? "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploaderAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));

  return (
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
        <Text style={styles.screenTitle}>Update Timetable</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.body}>
        <Text style={styles.heading}>Upload a new timetable</Text>
        <Text style={styles.subheading}>
          Take a photo or select an image of your class schedule.{"\n"}
          AI will extract and update your timetable automatically.
        </Text>

        <Animated.View style={uploaderAnimStyle}>
          <Pressable
            onPress={onPickImage}
            style={({ pressed }) => [
              styles.uploader,
              image && styles.uploaderActive,
              pressed && { opacity: 0.85 },
            ]}
          >
            {image ? (
              <Animated.View style={checkAnimStyle}>
                <CustomIcon
                  name="check"
                  size={horizontalScale(32)}
                  color={theme.colors.secondary}
                />
              </Animated.View>
            ) : (
              <CustomIcon
                name="check"
                size={horizontalScale(32)}
                color="rgba(255,255,255,0.15)"
              />
            )}
            <Text
              style={[
                styles.uploaderLabel,
                image && styles.uploaderLabelActive,
              ]}
            >
              {image ? "Image selected" : "Tap to choose image"}
            </Text>
            {image && (
              <Text style={styles.uploaderHint} numberOfLines={1}>
                {image.fileName ?? "timetable.jpg"}
              </Text>
            )}
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={onSubmit}
          disabled={!image || loading}
          style={({ pressed }) => [
            styles.submitBtn,
            (!image || loading) && styles.submitBtnDisabled,
            pressed && image && !loading && { opacity: 0.85 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text style={styles.submitText}>Analyse & Update</Text>
          )}
        </Pressable>

        <Text style={styles.disclaimer}>
          Your current schedule will be replaced with the new one.
        </Text>
      </View>
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
    height: verticalScale(260),
    zIndex: 0,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(14),
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
  body: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(40),
    gap: verticalScale(12),
  },
  heading: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(20),
    fontFamily: theme.fontFamily.semiBold,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  subheading: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.normal,
    textAlign: "center",
    lineHeight: horizontalScale(20),
    marginBottom: verticalScale(16),
  },
  uploader: {
    width: horizontalScale(200),
    height: horizontalScale(200),
    borderRadius: horizontalScale(20),
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.03)",
    justifyContent: "center",
    alignItems: "center",
    gap: verticalScale(10),
  },
  uploaderActive: {
    borderColor: "rgba(170, 204, 0, 0.55)",
    backgroundColor: "rgba(170, 204, 0, 0.05)",
  },
  uploaderLabel: {
    color: "rgba(255,255,255,0.35)",
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.medium,
    marginTop: verticalScale(4),
  },
  uploaderLabelActive: {
    color: theme.colors.secondary,
  },
  uploaderHint: {
    color: "rgba(255,255,255,0.25)",
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.normal,
    maxWidth: horizontalScale(160),
  },
  submitBtn: {
    marginTop: verticalScale(12),
    width: "100%",
    paddingVertical: verticalScale(15),
    borderRadius: horizontalScale(14),
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    opacity: 0.3,
  },
  submitText: {
    color: "#000",
    fontSize: horizontalScale(15),
    fontFamily: theme.fontFamily.semiBold,
    letterSpacing: 0.2,
  },
  disclaimer: {
    color: "rgba(255,255,255,0.2)",
    fontSize: horizontalScale(11),
    fontFamily: theme.fontFamily.normal,
    textAlign: "center",
    marginTop: verticalScale(4),
  },
});
