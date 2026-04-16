import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import InputField from "./InputField";
import { useCallback, useState } from "react";
import SubmitButton from "./SubmitButton";
import { verticalScale } from "../../../theme/sizing";

export default function SignUpInputs({ rootAnimation, onLayout }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onNameChangeHandler = useCallback(
    (text) => {
      setName(text);
    },
    [setName],
  );
  const onEmailChangeHandler = useCallback(
    (text) => {
      setEmail(text);
    },
    [setEmail],
  );
  const onPasswordChangeHandler = useCallback(
    (text) => {
      setPassword(text);
    },
    [setPassword],
  );
  const onConfirmPasswordChangeHandler = useCallback(
    (text) => {
      setConfirmPassword(text);
    },
    [setConfirmPassword],
  );

  const onSignUpPressHandler = useCallback(() => {
    console.log("signUpPressed");
    // Handle sign up logic here
  }, []);

  return (
    <Animated.View
      style={[styles.rootContainer, rootAnimation]}
      onLayout={onLayout}
    >
      <InputField
        value={name}
        onChangeText={onNameChangeHandler}
        placeHolder="Name"
        icon={"username"}
      />
      <InputField
        value={email}
        onChangeText={onEmailChangeHandler}
        placeHolder="Email Address"
        icon={"email"}
      />

      <InputField
        value={password}
        onChangeText={onPasswordChangeHandler}
        placeHolder="Password"
        secureTextEntry={true}
        icon={"password"}
      />
      <InputField
        value={confirmPassword}
        onChangeText={onConfirmPasswordChangeHandler}
        placeHolder="Confirm Password"
        secureTextEntry={true}
        icon={"password"}
      />
      <SubmitButton title="Sign Up" onPress={onSignUpPressHandler} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    width: "100%",
    gap: verticalScale(15),
    position: "absolute",
  },
});
