import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import theme from "../../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UniversityAndTimeTable from "./components/UniversityAndTimeTable";
import { useEffect, useState } from "react";
import { horizontalScale, verticalScale } from "../../theme/sizing";
import { LinearGradient } from "expo-linear-gradient";
import SubmitButton from "../Login/components/SubmitButton";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import FoodForm from "./components/FoodForm";
import SportsForm from "./components/SportsForm";
import SocialForm from "./components/SocialForm";
import { timeTableToJson } from "../../api/endpoints/timetable";
import {
  register,
  googleAuthAndroid,
  googleOnboarding,
} from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";

const FORM_TITLES = [
  "Set up your \nuniversity profile",
  "Your food\npreferences",
  "Your sports\nactivity",
  "Your social life\n& hobbies",
];

const BUTTON_LABELS = ["Continue", "Continue", "Continue", "Complete Setup"];

export default function FormScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;

  const { email, name, password, accessToken, googleData } = route.params || {};
  const isGoogleFlow = !!accessToken;

  const [university, setUniversity] = useState(null);
  const [city, setCity] = useState(null);
  const [timeTableImage, setTimeTableImage] = useState(null);
  const [foodData, setFoodData] = useState({});
  const [sportsData, setSportsData] = useState({});
  const [socialData, setSocialData] = useState({});
  const [schedule, setSchedule] = useState(null);

  const [currentFormState, setCurrentFormState] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { saveAuth } = useAuth();

  const form1X = useSharedValue(0);
  const form2X = useSharedValue(screenWidth);
  const form3X = useSharedValue(screenWidth);
  const form4X = useSharedValue(screenWidth);

  useEffect(() => {
    if (currentFormState === 1) {
      form1X.value = withTiming(-screenWidth, { duration: 300 });
      form2X.value = withTiming(0, { duration: 300 });
    } else if (currentFormState === 2) {
      form2X.value = withTiming(-screenWidth, { duration: 300 });
      form3X.value = withTiming(0, { duration: 300 });
    } else if (currentFormState === 3) {
      form3X.value = withTiming(-screenWidth, { duration: 300 });
      form4X.value = withTiming(0, { duration: 300 });
    }
  }, [currentFormState]);

  const onBackPressHandler = () => {
    if (currentFormState === 2) {
      form3X.value = withTiming(screenWidth, { duration: 300 });
      form2X.value = withTiming(0, { duration: 300 });
      setCurrentFormState(1);
    } else if (currentFormState === 3) {
      form4X.value = withTiming(screenWidth, { duration: 300 });
      form3X.value = withTiming(0, { duration: 300 });
      setCurrentFormState(2);
    }
  };

  const oAuthOnboarding = (profileData) => {
    return googleOnboarding({
      google_id: googleData?.google_id,
      email: googleData?.email,
      name: googleData?.name,
      university_id: profileData.university_id,
      city_id: profileData.city_id,
      ...profileData,
    });
  };

  const onSubmitPressHandler = async () => {
    if (currentFormState === 0) {
      if (!university || !city || !timeTableImage) return;
      setLoadingMessage("Analysing your timetable…");
      setLoading(true);
      try {
        const res = await timeTableToJson({ image: timeTableImage });
        if (!res.data || res.data.length === 0) {
          Toast.show({
            type: "Warning",
            text1: "No timetable found",
            text2:
              "The image doesn't seem to contain a timetable. Please upload a different image.",
          });
          return;
        }
        setSchedule(res);
        setCurrentFormState(1);
      } catch (e) {
        Toast.show({
          type: "Error",
          text1: "Upload failed",
          text2: e.message || "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    } else if (currentFormState === 1) {
      setCurrentFormState(2);
    } else if (currentFormState === 2) {
      setCurrentFormState(3);
    } else if (currentFormState === 3) {
      const sharedProfile = {
        university_id: university,
        city_id: city,
        food: foodData,
        sports: sportsData,
        social: socialData,
        schedule,
      };
      setLoadingMessage("Creating your account…");
      setLoading(true);
      try {
        const res = isGoogleFlow
          ? await oAuthOnboarding(sharedProfile)
          : await register({ name, email, password, ...sharedProfile });
        if (res) {
          await saveAuth(res.token, res.user);
          Toast.show({
            type: "Success",
            text1: "Registration successful",
            text2: "Welcome!",
          });
          navigation.replace("Main");
        }
      } catch (e) {
        Toast.show({
          type: "Error",
          text1: "Registration failed",
          text2: e.message || "Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const anim1 = useAnimatedStyle(() => ({
    transform: [{ translateX: form1X.value }],
  }));
  const anim2 = useAnimatedStyle(() => ({
    transform: [{ translateX: form2X.value }],
  }));
  const anim3 = useAnimatedStyle(() => ({
    transform: [{ translateX: form3X.value }],
  }));
  const anim4 = useAnimatedStyle(() => ({
    transform: [{ translateX: form4X.value }],
  }));

  return (
    <KeyboardAvoidingView style={styles.rootContainer} behavior="padding">
      <LinearGradient
        style={styles.linear}
        colors={[
          "rgba(170, 204, 0, 0.4)",
          "rgba(86, 121, 20, 0.18)",
          "rgba(0, 0, 0, 0)",
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View
        style={[styles.titleRow, { marginTop: insets.top + verticalScale(35) }]}
      >
        {currentFormState >= 2 ? (
          <Pressable
            onPress={onBackPressHandler}
            style={styles.backButton}
            hitSlop={12}
          >
            <Text style={styles.backArrow}>{"←"}</Text>
          </Pressable>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <Text style={styles.title}>{FORM_TITLES[currentFormState]}</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>
      <View style={styles.contentHolder}>
        <UniversityAndTimeTable
          setUniversity={setUniversity}
          setCity={setCity}
          city={city}
          university={university}
          setTimeTableImage={setTimeTableImage}
          rootAnimation={anim1}
        />
        <FoodForm rootAnimation={anim2} onChange={setFoodData} />
        <SportsForm rootAnimation={anim3} onChange={setSportsData} />
        <SocialForm rootAnimation={anim4} onChange={setSocialData} />
      </View>
      <View
        style={[
          styles.buttonWrapper,
          { paddingBottom: insets.bottom + verticalScale(16) },
        ]}
      >
        <SubmitButton
          title={BUTTON_LABELS[currentFormState]}
          onPress={onSubmitPressHandler}
          loading={loading}
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <LinearGradient
            style={StyleSheet.absoluteFill}
            colors={[
              "rgba(170, 204, 0, 0.12)",
              "rgba(5, 7, 6, 0.97)",
              "#050706",
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <ActivityIndicator size={56} color="#aacc00" />
          <Text style={styles.loadingTitle}>{loadingMessage}</Text>
          <Text style={styles.loadingSubtitle}>
            This may take a few seconds…
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(15),
    backgroundColor: "#050706",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(4),
  },
  title: {
    flex: 1,
    fontSize: 28,
    color: theme.colors.text.primary,
    textAlign: "center",
    fontFamily: theme.fontFamily.bold,
  },
  backButton: {
    width: horizontalScale(36),
    alignItems: "center",
  },
  backButtonPlaceholder: {
    width: horizontalScale(36),
  },
  backArrow: {
    fontSize: 24,
    color: "#aacc00",
    fontFamily: theme.fontFamily.bold,
  },
  linear: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(230),
  },
  contentHolder: {
    flex: 1,
  },
  buttonWrapper: {
    width: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(14),
  },
  loadingTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontFamily: theme.fontFamily.bold,
    textAlign: "center",
  },
  loadingSubtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    textAlign: "center",
  },
});
