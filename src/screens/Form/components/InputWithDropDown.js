import { StyleSheet, TextInput, View } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import theme from "../../../theme";
import CustomIcon from "../../../assets/icons/CustomIcon";
import { FlashList } from "@shopify/flash-list";
import DropDownElement from "./DropDownElement";

export default function InputWithDropDown({
  value = "",
  onChangeText,
  placeHolder = "Type at least 3 characters",
  icon = "username",
  minChars = 3,
  data,
}) {
  const showDropdown = value.trim().length >= minChars;
  const dropdownHeight = useSharedValue(0);
  const dropDownOpacity = useSharedValue(0);
  const DROPDOWN_HEIGHT = verticalScale(75);

  useEffect(() => {
    if (showDropdown) {
      dropdownHeight.value = withTiming(DROPDOWN_HEIGHT, { duration: 250 });
      dropDownOpacity.value = withTiming(1, { duration: 50 });
    } else {
      dropdownHeight.value = withTiming(0, { duration: 150 });
      setTimeout(() => {
        dropDownOpacity.value = withTiming(0, { duration: 0 });
      }, 100);
    }
  }, [showDropdown]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: dropdownHeight.value,
    overflow: "hidden",
    opacity: dropDownOpacity.value,
  }));

  const ListItem = ({ item }) => <DropDownElement item={item} />;

  return (
    <View style={styles.wrapper}>
      <View style={styles.rootContainer}>
        <CustomIcon
          name={icon}
          color={theme.colors.text.disabled}
          size={15}
          style={styles.icon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeHolder}
          style={styles.textInput}
          placeholderTextColor={theme.colors.text.disabled}
          cursorColor={theme.colors.text.primary}
          autoCapitalize={"none"}
          autoCorrect={false}
          inputMode={placeHolder === "Email Address" ? "email" : "text"}
        />
      </View>

      <Animated.View
        style={[styles.dropdownContainer, animatedStyle]}
        pointerEvents={showDropdown ? "auto" : "none"}
      >
        <FlashList
          data={data}
          renderItem={ListItem}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  rootContainer: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    paddingHorizontal: horizontalScale(10),
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(4),
  },
  textInput: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: 11,
    fontFamily: theme.fontFamily.medium,
  },
  icon: {
    marginRight: horizontalScale(5),
  },
  dropdownContainer: {
    width: "100%",
    marginTop: verticalScale(4),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  separator: {
    height: verticalScale(3),
  },
});
