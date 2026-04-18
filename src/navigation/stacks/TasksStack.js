import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TasksScreen from "../../screens/Tasks/TasksScreen";
import SwapTaskScreen from "../../screens/Tasks/SwapTaskScreen";

const Stack = createNativeStackNavigator();

export default function TasksStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TasksMain" component={TasksScreen} />
      <Stack.Screen
        name="SwapTask"
        component={SwapTaskScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
}
