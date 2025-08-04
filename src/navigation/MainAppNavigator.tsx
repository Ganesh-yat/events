import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import CreateEventScreen from "../screens/create-event/CreateEventScreen";
import LandingPage from "../screens/main/LandingPage";
import Profile from "../screens/profile/Profile";

export type MainAppStackParamList = {
  LandingPage: undefined;
  DashboardMain: { eventId: string | null };
  CreateEvent: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<MainAppStackParamList>();

export default function MainAppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LandingPage" component={LandingPage} />
      <Stack.Screen name="DashboardMain" component={DashboardScreen} initialParams={{ eventId: null }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} initialParams={{ eventId: null }} />
      <Stack.Screen name="Profile" component={Profile} />
      {/* Add more menu items like Profile if needed */}
    </Stack.Navigator>
  );
}
