import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import ToastStyle from "./src/components/Toast/ToastStyle";
import Toast from "react-native-toast-message";
import { AuthProvider } from "./src/context/AuthContext";
import { useEffect } from "react";
import { OneSignal, LogLevel } from "react-native-onesignal";
export default function App() {
  useEffect(() => {
    try {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      OneSignal.initialize("96b73a5c-913a-472d-8e5f-a683a60f4337");

      OneSignal.Notifications.requestPermission(false);

      OneSignal.Notifications.addEventListener("click", (event) => {
        console.log("Notification clicked:", event);
      });
      console.log("subscribed");
    } catch (e) {
      console.log("OneSignal initialization error:", e);
    }

    return () => {
      OneSignal.Notifications.removeEventListener("click");
    };
  }, []);
  const toastConfig = {
    Error: ({ text1, text2 }) => (
      <ToastStyle text1={text1} text2={text2} type={"Error"} />
    ),
    Success: ({ text1, text2 }) => (
      <ToastStyle text1={text1} text2={text2} type={"Success"} />
    ),
    Warning: ({ text1, text2 }) => (
      <ToastStyle text1={text1} text2={text2} type={"Warning"} />
    ),
  };

  return (
    <>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
      <Toast config={toastConfig} />
    </>
  );
}
