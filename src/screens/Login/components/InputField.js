import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import theme from "../../../theme";
import { useState } from "react";
import CustomIcon from "../../../assets/icons/CustomIcon";
export default function InputField({
  value,
  onChangeText,
  placeHolder,
  icon,
  secureTextEntry,
  error,
}) {
  const [hide, setHide] = useState(secureTextEntry);
  const onIconPressHandler = () => {
    if (!secureTextEntry) return;
    setHide((prev) => !prev);
  };
  return (
    <View style={[styles.rootContainer]}>
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
        secureTextEntry={hide}
        style={styles.textInput}
        placeholderTextColor={theme.colors.text.disabled}
        cursorColor={theme.colors.text.primary}
        autoCapitalize={"none"}
        autoCorrect={false}
        inputMode={placeHolder === "Email Address" && "email"}
      />

      {secureTextEntry && (
        <Pressable
          onPress={onIconPressHandler}
          hitSlop={10}
          style={({ presssed }) => [
            presssed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
          ]}
        >
          <CustomIcon
            name={hide ? "visible" : "hide"}
            color={theme.colors.text.disabled}
            size={15}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
