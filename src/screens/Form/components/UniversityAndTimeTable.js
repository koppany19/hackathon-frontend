import { Pressable, StyleSheet, Text, View } from "react-native";
import theme from "../../../theme";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import InputWithDropDown from "./InputWithDropDown";
import { useState } from "react";
import CustomIcon from "../../../assets/icons/CustomIcon";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";

export default function UniversityAndTimeTable({ setUniversity, setCity }) {
  const [universityText, setUniversityText] = useState("");
  const [cityText, setCityText] = useState("");
  const [hasImage, setHasImage] = useState(false);

  const onUniversityChangeHandler = (text) => {
    setUniversityText(text);
  };

  const onCityChangeHandler = (text) => {
    setCityText(text);
  };

  const onPickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: "error",
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
        console.log(image);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.rootContainer}>
      <View style={styles.inputsHolder}>
        <InputWithDropDown
          value={universityText}
          onChangeText={onUniversityChangeHandler}
          placeHolder={"Search your university"}
          icon={"username"}
        />
        <InputWithDropDown
          value={cityText}
          onChangeText={onCityChangeHandler}
          placeHolder={"Search your city"}
          icon={"username"}
        />
      </View>

      <View style={styles.uploadSection}>
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
          onPress={onPickImage}
        >
          <CustomIcon
            name={"check"}
            color={
              hasImage ? theme.colors.secondary : theme.colors.text.disabled
            }
            size={28}
          />
          <Text style={[styles.uploaderLabel, hasImage && styles.uploaderLabelActive]}>
            {hasImage ? "Timetable uploaded" : "Tap to upload"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    width: "100%",
    height: "100%",
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
