import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import ToastStyle from "./src/components/Toast/ToastStyle";
import Toast from "react-native-toast-message";
export default function App() {
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
        <AppNavigator />
      </SafeAreaProvider>
      <Toast config={toastConfig} />
    </>
  );
}
