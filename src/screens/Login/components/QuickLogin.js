import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { horizontalScale, verticalScale } from "../../../theme/sizing";
import { Image } from "expo-image";
import theme from "../../../theme";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import { googleAuthAndroid } from "../../../api/endpoints/auth";
import { useAuth } from "../../../context/AuthContext";

const googleIcon = require("../../../assets/images/google.png");

const WEB_CLIENT_ID =
  "598449792265-l2n4qgh0kjhqkkuj7updatknofb3hr0n.apps.googleusercontent.com";

export default function QuickLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { saveAuth } = useAuth();

  const onGoogleButtonPress = async () => {
    try {
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: false,
        scopes: ["openid", "profile", "email"],
      });

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      setIsLoading(true);

      const dataAuth = await GoogleSignin.signIn();
      if (!dataAuth.data) {
        setIsLoading(false);
        return;
      }

      const tokens = await GoogleSignin.getTokens();

      if (!tokens?.accessToken) {
        throw new Error("Google access token is missing before API call");
      }

      console.log(tokens);

      try {
        const res = await googleAuthAndroid({
          accessToken: tokens.accessToken,
          idToken: dataAuth.data.idToken,
        });
        console.log(res);
        await saveAuth(res.token, res.user);
        navigation.replace("Main");
      } catch (error) {
        navigation.navigate("Form", {
          accessToken: tokens.accessToken,
          idToken: dataAuth.data.idToken,
        });
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.rootContainer}>
      <Pressable
        onPress={onGoogleButtonPress}
        disabled={isLoading}
        style={({ pressed }) => [
          pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
          styles.buttonContainer,
          isLoading && { opacity: 0.6 },
        ]}
      >
        <Image source={googleIcon} style={styles.icon} />
        <Text style={styles.text}>
          {isLoading ? "Signing in..." : "Google"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: horizontalScale(15),
    paddingBottom: verticalScale(15),
  },
  buttonContainer: {
    width: horizontalScale(150),
    height: horizontalScale(45),
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: horizontalScale(7),
    paddingHorizontal: horizontalScale(15),
    paddingVertical: horizontalScale(10),
  },
  icon: {
    width: horizontalScale(20),
    height: horizontalScale(20),
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: 15,
    fontFamily: theme.fontFamily.medium,
  },
});
