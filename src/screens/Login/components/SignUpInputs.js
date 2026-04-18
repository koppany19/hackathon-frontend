import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import InputField from "./InputField";
import { useCallback, useState } from "react";
import SubmitButton from "./SubmitButton";
import { verticalScale } from "../../../theme/sizing";
import { register } from "../../../api/endpoints/auth";
import Toast from "react-native-toast-message";
import {
  isValidEmail,
  isNonEmpty,
  hasMinLength,
} from "../../../utils/validators";
import { useNavigation } from "@react-navigation/native";

export default function SignUpInputs({
  rootAnimation,
  onLayout,
  onSignUpSuccess,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const onNameChangeHandler = useCallback((text) => {
    setName(text);
  }, []);

  const onEmailChangeHandler = useCallback((text) => {
    setEmail(text);
  }, []);

  const onPasswordChangeHandler = useCallback((text) => {
    setPassword(text);
  }, []);

  const onConfirmPasswordChangeHandler = useCallback((text) => {
    setConfirmPassword(text);
  }, []);

  const validate = useCallback(() => {
    if (!isNonEmpty(name)) {
      Toast.show({
        type: "Warning",
        text1: "Invalid sign up input",
        text2: "Name is required",
      });
      return false;
    }

    if (!isNonEmpty(email)) {
      Toast.show({
        type: "Warning",
        text1: "Invalid sign up input",
        text2: "Email is required",
      });
      return false;
    }

    if (!isValidEmail(email)) {
      Toast.show({
        type: "Warning",
        text1: "Invalid sign up input",
        text2: "Enter a valid email address",
      });
      return false;
    }

    if (!isNonEmpty(password)) {
      Toast.show({
        type: "Warning",
        text1: "Invalid sign up input",
        text2: "Password is required",
      });
      return false;
    }

    if (!hasMinLength(password, 6)) {
      Toast.show({
        type: "Warning",
        text1: "Invalid sign up input",
        text2: "Password must be at least 6 characters",
      });
      return false;
    }

    if (!isNonEmpty(confirmPassword)) {
      Toast.show({
        type: "Warning",
        text1: "Invalid sign up input",
        text2: "Please confirm your password",
      });
      return false;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "Warning",
        text1: "Invalid sign up input",
        text2: "Passwords do not match",
      });
      return false;
    }

    return true;
  }, [name, email, password, confirmPassword]);

  const onSignUpPressHandler = useCallback(async () => {
    if (!validate()) return;
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    onSignUpSuccess?.();
    navigation.navigate("Form", {
      email: email,
      password: password,
      name: name,
    });
  }, [name, email, password, onSignUpSuccess, validate, navigation]);

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
      <SubmitButton
        title="Sign Up"
        onPress={onSignUpPressHandler}
        loading={isLoading}
      />
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
