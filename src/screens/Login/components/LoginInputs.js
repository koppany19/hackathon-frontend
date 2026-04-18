import { Pressable, StyleSheet, Text, View } from "react-native";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import InputField from "./InputField";
import { useCallback, useState } from "react";
import Animated from "react-native-reanimated";
import theme from "../../../theme";
import SubmitButton from "./SubmitButton";
import CustomIcon from "../../../assets/icons/CustomIcon";
import { login } from "../../../api/endpoints/auth";
import Toast from "react-native-toast-message";
import {
  isValidEmail,
  isNonEmpty,
  hasMinLength,
} from "../../../utils/validators";
import { useAuth } from "../../../context/AuthContext";

export default function LoginInputs({ rootAnimation, onLayout, navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { saveAuth } = useAuth();

  const onEmailChangeHandler = useCallback((text) => {
    setEmail(text);
  }, []);

  const onPasswordChangeHandler = useCallback((text) => {
    setPassword(text);
  }, []);

  const onForgotPasswordPressHandler = useCallback(() => {
    Toast.show({
      type: "Warning",
      text1: "Coming soon",
      text2: "Password reset is not available yet.",
    });
  }, []);

  const onRememberMePressHandler = useCallback(() => {
    setRememberMe((prev) => !prev);
  }, []);

  const validate = useCallback(() => {
    if (!isNonEmpty(email)) {
      Toast.show({
        type: "Warning",
        text1: "Invalid login input",
        text2: "Email is required",
      });
      return false;
    }

    if (!isValidEmail(email)) {
      Toast.show({
        type: "Warning",
        text1: "Invalid login input",
        text2: "Enter a valid email address",
      });
      return false;
    }

    if (!isNonEmpty(password)) {
      Toast.show({
        type: "Warning",
        text1: "Invalid login input",
        text2: "Password is required",
      });
      return false;
    }

    if (!hasMinLength(password, 8)) {
      Toast.show({
        type: "Warning",
        text1: "Invalid login input",
        text2: "Password must be at least 8 characters",
      });
      return false;
    }

    return true;
  }, [email, password]);

  const onLoginPressHandler = useCallback(async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);
      const res = await login({ email: email.trim(), password });
      await saveAuth(res.token, res.user);
      Toast.show({
        type: "Success",
        text1: "Login successful",
        text2: "Welcome back!",
      });
      navigation.replace("Main");
    } catch (err) {
      Toast.show({
        type: "Error",
        text1: "Login failed",
        text2: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, password, validate, navigation]);

  return (
    <Animated.View
      style={[styles.rootContainer, rootAnimation]}
      onLayout={onLayout}
    >
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
      <View style={styles.extraContainer}>
        <Pressable
          style={({ pressed }) => [
            pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
            styles.rememberMeContainer,
          ]}
          onPress={onRememberMePressHandler}
        >
          <View style={styles.tickCube}>
            {rememberMe && (
              <CustomIcon name="check" color={theme.colors.surface} size={15} />
            )}
          </View>
          <Text style={styles.rememberMeText}>Remember me</Text>
        </Pressable>
        <Pressable
          onPress={onForgotPasswordPressHandler}
          style={({ pressed }) =>
            pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }
          }
        >
          <Text style={styles.forgotPasswordText}>Forgot Password</Text>
        </Pressable>
      </View>
      <SubmitButton
        title="Login"
        onPress={onLoginPressHandler}
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
  extraContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: verticalScale(5),
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(5),
  },
  tickCube: {
    width: horizontalScale(15),
    height: horizontalScale(15),
    borderRadius: 3,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberMeText: {
    color: theme.colors.text.disabled,
    fontSize: 11,
    fontFamily: theme.fontFamily.normal,
  },
  forgotPasswordText: {
    color: theme.colors.text.primary,
    fontSize: 12,
    fontFamily: theme.fontFamily.normal,
  },
});
