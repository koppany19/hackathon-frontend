import { useCallback, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { horizontalScale, verticalScale } from "../../theme/sizing";
import theme from "../../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoginSignUpSwitchButton from "./components/LoginSignUpSwitchButton";
import { LinearGradient } from "expo-linear-gradient";
import LoginInputs from "./components/LoginInputs";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import SignUpInputs from "./components/SignUpInputs";
import OrLoginWith from "./components/OrLoginWith";
import QuickLogin from "./components/QuickLogin";
const LOGIN_LEFT = horizontalScale(3);
export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);

  const loginInputTranslateX = useSharedValue(0);
  const signUpInputTranslateX = useSharedValue(Dimensions.get("window").width);
  const loginFormHeight = useSharedValue(0);
  const signUpFormHeight = useSharedValue(0);
  const activeFormHeight = useSharedValue(0);
  const pillAnimation = useSharedValue(LOGIN_LEFT);

  const onSwitchToggle = useCallback(
    (value) => {
      if (value) {
        setIsLogin(true);
        loginInputTranslateX.value = withTiming(0, { duration: 300 });
        signUpInputTranslateX.value = withTiming(
          Dimensions.get("window").width,
          { duration: 300 },
        );
        activeFormHeight.value = withTiming(loginFormHeight.value, {
          duration: 500,
        });
      } else {
        setIsLogin(false);
        loginInputTranslateX.value = withTiming(
          -Dimensions.get("window").width,
          { duration: 300 },
        );
        signUpInputTranslateX.value = withTiming(0, { duration: 300 });
        activeFormHeight.value = withTiming(signUpFormHeight.value, {
          duration: 200,
        });
      }
    },
    [activeFormHeight, loginFormHeight, setIsLogin, signUpFormHeight],
  );

  const onSignUpSuccess = useCallback(() => {
    setIsLogin(true);
    loginInputTranslateX.value = withTiming(0, { duration: 300 });
    signUpInputTranslateX.value = withTiming(Dimensions.get("window").width, {
      duration: 300,
    });
    activeFormHeight.value = withTiming(loginFormHeight.value, {
      duration: 500,
    });
    pillAnimation.value = withSpring(LOGIN_LEFT, {
      duration: 350,
      damping: 15,
    });
  }, [
    activeFormHeight,
    loginFormHeight,
    loginInputTranslateX,
    setIsLogin,
    signUpInputTranslateX,
  ]);

  const loginInputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: loginInputTranslateX.value }],
    };
  }, []);

  const signUpInputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: signUpInputTranslateX.value }],
    };
  }, []);

  const formWrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: activeFormHeight.value,
    };
  }, []);

  const onLoginLayout = useCallback(
    ({ nativeEvent }) => {
      const measuredHeight = nativeEvent.layout.height;
      loginFormHeight.value = measuredHeight;
      if (isLogin && activeFormHeight.value === 0) {
        activeFormHeight.value = measuredHeight;
      }
    },
    [activeFormHeight, isLogin, loginFormHeight],
  );

  const onSignUpLayout = useCallback(
    ({ nativeEvent }) => {
      signUpFormHeight.value = nativeEvent.layout.height;
    },
    [signUpFormHeight],
  );

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
        {"Sign Up or Log In to \n Build Habits"}
      </Text>
      <LoginSignUpSwitchButton
        isLogin={isLogin}
        onPress={onSwitchToggle}
        pillAnimation={pillAnimation}
      />
      <Animated.View style={[styles.formsContainer, formWrapperAnimatedStyle]}>
        <LoginInputs
          rootAnimation={loginInputAnimatedStyle}
          onLayout={onLoginLayout}
          navigation={navigation}
        />
        <SignUpInputs
          rootAnimation={signUpInputAnimatedStyle}
          onLayout={onSignUpLayout}
          onSignUpSuccess={onSignUpSuccess}
        />
      </Animated.View>
      <OrLoginWith />
      <QuickLogin />
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
  formsContainer: {
    width: "100%",
    marginTop: verticalScale(16),
    position: "relative",
  },
});
