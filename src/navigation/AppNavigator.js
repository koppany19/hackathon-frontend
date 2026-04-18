import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import theme from "../theme";
import LoginScreen from "../screens/Login/LoginScreen";
import FormScreen from "../screens/Form/FormScreen";
import BottomTabNavigation from "./stacks/BottomTabNavigation";
import CameraScreen from "../screens/Tasks/CameraScreen";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={BottomTabNavigation} />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{ animation: "slide_from_bottom" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Form" component={FormScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
