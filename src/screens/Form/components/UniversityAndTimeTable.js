import { Pressable, StyleSheet, Text, View } from "react-native";
import theme from "../../../theme";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import InputWithDropDown from "./InputWithDropDown";
import { useEffect, useState } from "react";
import CustomIcon from "../../../assets/icons/CustomIcon";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  searchCities,
  searchUniversities,
} from "../../../api/endpoints/search";

export default function UniversityAndTimeTable({
  setUniversity,
  setCity,
  university,
  city,
  setTimeTableImage,
  rootAnimation,
}) {
  const [universityText, setUniversityText] = useState("");
  const [cityText, setCityText] = useState("");
  const [hasImage, setHasImage] = useState(false);

  const [universityData, setUniversityData] = useState([]);
  const [cityData, setCityData] = useState([]);

  const upalodOpacity = useSharedValue(0);

  useEffect(() => {
    if (city && university) {
      upalodOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [city, university]);

  const onUniversityChangeHandler = async (text) => {
    setUniversityText(text);
    if (text.length >= 4) {
      try {
        const res = await searchUniversities({ q: text });
        setUniversityData(res);
      } catch {
        setUniversityData([]);
      }
    } else {
      setUniversityData([]);
    }
  };

  const onCityChangeHandler = async (text) => {
    setCityText(text);
    if (text.length >= 4) {
      try {
        const res = await searchCities({ q: text });
        setCityData(res);
      } catch {
        setCityData([]);
      }
    } else {
      setCityData([]);
    }
  };

  const onPickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: "Warning",
          text1: "Permission denied",
          text2: "You have to upload your timetable to continue",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const image = result.assets[0];
        setHasImage(true);
        setTimeTableImage(image);
      }
    } catch (e) {
      Toast.show({
        type: "Error",
        text1: "Image picker failed",
        text2: e.message || "Could not open the image library.",
      });
    }
  };

  const UploadAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: upalodOpacity.value,
    };
  });

  const unsetUniversity = () => {
    setUniversityData([]);
  };

  const unsetCity = () => {
    setCityData([]);
  };

  return (
    <Animated.View style={[styles.rootContainer, rootAnimation]}>
      <View style={styles.inputsHolder}>
        <InputWithDropDown
          value={universityText}
          setText={setUniversityText}
          onChangeText={onUniversityChangeHandler}
          placeHolder={"Search your university"}
          icon={"username"}
          data={universityData}
          setValue={setUniversity}
          unsetValue={unsetUniversity}
        />
        <InputWithDropDown
          value={cityText}
          setText={setCityText}
          onChangeText={onCityChangeHandler}
          placeHolder={"Search your city"}
          icon={"username"}
          data={cityData}
          setValue={setCity}
          unsetValue={unsetCity}
        />
      </View>

      <Animated.View style={[styles.uploadSection, UploadAnimatedStyle]}>
        <Text style={styles.sectionLabel}>Upload your timetable</Text>
        <Text style={styles.sectionHint}>
          We'll use this to find the best habits for your schedule
        </Text>

        <Pressable
          style={({ pressed }) => [
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            styles.uploaderContainer,
            hasImage && styles.uploaderContainerActive,
          ]}
          disabled={!city || !university}
          onPress={onPickImage}
        >
          <CustomIcon
            name={"check"}
            color={
              hasImage ? theme.colors.secondary : theme.colors.text.disabled
            }
            size={28}
          />
          <Text
            style={[
              styles.uploaderLabel,
              hasImage && styles.uploaderLabelActive,
            ]}
          >
            {hasImage ? "Timetable uploaded" : "Tap to upload"}
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  inputsHolder: {
    width: "100%",
    paddingTop: verticalScale(30),
    gap: verticalScale(15),
  },
  uploadSection: {
    alignItems: "center",
    paddingTop: verticalScale(40),
    gap: verticalScale(8),
  },
  sectionLabel: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    textAlign: "center",
  },
  sectionHint: {
    color: theme.colors.text.disabled,
    fontSize: 11,
    fontFamily: theme.fontFamily.medium,
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  uploaderContainer: {
    width: horizontalScale(150),
    height: horizontalScale(150),
    borderRadius: horizontalScale(15),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
    gap: verticalScale(8),
  },
  uploaderContainerActive: {
    borderColor: "rgba(170, 204, 0, 0.6)",
    backgroundColor: "rgba(170, 204, 0, 0.06)",
  },
  uploaderLabel: {
    color: theme.colors.text.disabled,
    fontSize: 11,
    fontFamily: theme.fontFamily.medium,
  },
  uploaderLabelActive: {
    color: theme.colors.secondary,
  },
});
