import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from "react-native-vision-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import theme from "../../theme";
import { horizontalScale, verticalScale } from "../../theme/sizing";
import { uploadTaskPhoto } from "../../api/endpoints/tasks";

export default function CameraScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { taskId } = route.params;

  const [facing, setFacing] = useState("back");
  const [taking, setTaking] = useState(false);
  const [capturedUri, setCapturedUri] = useState(null);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(facing);
  const photoOutput = usePhotoOutput();
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (!hasPermission) requestPermission().catch(() => {});
  }, [hasPermission, requestPermission]);

  const onDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setFacing((f) => (f === "back" ? "front" : "back"));
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const onCapture = async () => {
    if (taking) return;
    setTaking(true);
    try {
      const { filePath } = await photoOutput.capturePhotoToFile({}, {});
      setCapturedUri(`file://${filePath}`);
      const asset = {
        uri: `file://${filePath}`,
        fileName: "task_photo.jpg",
        mimeType: "image/jpeg",
      };
      await uploadTaskPhoto(taskId, asset);
      Toast.show({
        type: "Success",
        text1: "Photo uploaded",
        text2: "Task evidence saved",
      });
      navigation.goBack();
    } catch (e) {
      Toast.show({
        type: "Error",
        text1: "Upload failed",
        text2: e.status === 422 ? "Not a healthy food!" : (e.message || "Please try again"),
      });
      setCapturedUri(null);
      setTaking(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permHint}>
          Allow camera access to take task photos
        </Text>
        <Pressable
          onPress={requestPermission}
          style={({ pressed }) => [styles.permBtn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={16}
          style={({ pressed }) => [
            styles.cancelBtn,
            pressed && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.secondary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Camera
        style={StyleSheet.absoluteFill}
        isActive={!capturedUri}
        device={device}
        outputs={[photoOutput]}
      />

      {capturedUri && (
        <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      )}

      {/* Double-tap zone — above camera, below controls */}
      <Pressable style={styles.doubleTapZone} onPress={onDoubleTap} />

      {/* Top bar */}
      <View
        style={[styles.topBar, { paddingTop: insets.top + verticalScale(8) }]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={16}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.hint}>Double tap to flip</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Shutter */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + verticalScale(24) },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={onCapture}
          style={({ pressed }) => [
            styles.shutterOuter,
            taking && { opacity: 0.4 },
            pressed && !taking && { transform: [{ scale: 0.94 }] },
          ]}
        >
          {taking ? (
            <ActivityIndicator color="#050706" size="small" />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    backgroundColor: "#050706",
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(12),
    paddingHorizontal: horizontalScale(32),
  },
  permTitle: {
    color: theme.colors.text.primary,
    fontSize: horizontalScale(18),
    fontFamily: theme.fontFamily.semiBold,
    textAlign: "center",
  },
  permHint: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.normal,
    textAlign: "center",
    lineHeight: horizontalScale(19),
  },
  permBtn: {
    marginTop: verticalScale(8),
    backgroundColor: theme.colors.secondary,
    borderRadius: horizontalScale(14),
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(32),
  },
  permBtnText: {
    color: "#050706",
    fontSize: horizontalScale(14),
    fontFamily: theme.fontFamily.semiBold,
  },
  cancelBtn: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
  },
  cancelBtnText: {
    color: theme.colors.text.secondary,
    fontSize: horizontalScale(13),
    fontFamily: theme.fontFamily.medium,
  },
  doubleTapZone: {
    ...StyleSheet.absoluteFillObject,
    bottom: verticalScale(120),
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(12),
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backBtn: {
    width: horizontalScale(36),
    height: horizontalScale(36),
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    color: "#fff",
    fontSize: horizontalScale(28),
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: horizontalScale(32),
  },
  hint: {
    color: "rgba(255,255,255,0.45)",
    fontSize: horizontalScale(12),
    fontFamily: theme.fontFamily.normal,
    letterSpacing: 0.3,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingTop: verticalScale(24),
    zIndex: 100,
  },
  shutterOuter: {
    width: horizontalScale(72),
    height: horizontalScale(72),
    borderRadius: horizontalScale(36),
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: horizontalScale(58),
    height: horizontalScale(58),
    borderRadius: horizontalScale(29),
    backgroundColor: "#fff",
  },
});
