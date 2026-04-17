import { StyleSheet, Text, View } from "react-native";
import theme from "../../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UniversityAndTimeTable from "./components/UniversityAndTimeTable";
import { useState } from "react";
import { horizontalScale, verticalScale } from "../../theme/sizing";
import { LinearGradient } from "expo-linear-gradient";
import SubmitButton from "../Login/components/SubmitButton";

export default function FormScreen() {
  const insets = useSafeAreaInsets();
  const [university, setUniversity] = useState(null);
  const [city, setCity] = useState(null);

  return (
    <View style={styles.rootContainer}>
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
      <Text
        style={[styles.title, { marginTop: insets.top + verticalScale(35) }]}
      >
        {"Set up your \nuniversity profile"}
      </Text>
      <View style={styles.contentHolder}>
        <UniversityAndTimeTable
          setUniversity={setUniversity}
          setCity={setCity}
        />
      </View>
      <View
        style={[styles.buttonWrapper, { paddingBottom: insets.bottom + verticalScale(16) }]}
      >
        <SubmitButton title="Continue" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(15),
    backgroundColor: "#050706",
  },
  title: {
    fontSize: 28,
    color: theme.colors.text.primary,
    textAlign: "center",
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
});
