import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TimetableScreen from "../../screens/Timetable/TimetableScreen";
import UpdateTimetableScreen from "../../screens/Timetable/UpdateTimetableScreen";
import EditScheduleScreen from "../../screens/Timetable/EditScheduleScreen";

const Stack = createNativeStackNavigator();

export default function TimetableStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TimetableMain" component={TimetableScreen} />
      <Stack.Screen
        name="UpdateTimetable"
        component={UpdateTimetableScreen}
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="EditSchedule"
        component={EditScheduleScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
}
