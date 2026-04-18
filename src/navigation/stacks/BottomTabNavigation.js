import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AnimatedTabBar from "../AnimatedTabBar";
import TimetableStack from "./TimetableStack";
import LeaderboardScreen from "../../screens/Leaderboard/LeaderboardScreen";
import FeedScreen from "../../screens/Feed/FeedScreen";
import TasksStack from "./TasksStack";
import ProfileScreen from "../../screens/Profile/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigation() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="Feed"
    >
      <Tab.Screen name="Timetable" component={TimetableStack} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Tasks" component={TasksStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
