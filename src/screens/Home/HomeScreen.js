import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Screen from "../../components/layout/Screen";
import { fetchTest } from "../../api/endpoints";
import { colors, spacing, typography } from "../../theme";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();
  useEffect(() => {
    fetchTest()
      .then((result) => console.log("[/test] response:", result))
      .catch((err) => console.error("[/test] error:", err.message));
    navigation.navigate("Login");
  }, []);

  return (
    <Screen>
      <Text style={styles.title}>Home</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginTop: spacing.xl,
  },
});
