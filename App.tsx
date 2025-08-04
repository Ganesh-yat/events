import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
enableScreens();
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GlobalProvider, useGlobalInfo } from "./src/context/GlobalContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthNavigator from "./src/navigation/AuthNavigator";
import MainAppNavigator from "./src/navigation/MainAppNavigator";

function Root() {
  const [loading, setLoading] = useState(true);
  const { colors, isLoggedIn } = useGlobalInfo();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.background === "#fff" ? "dark-content" : "light-content"} />
        <ActivityIndicator size="large" color={colors.button} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainAppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GlobalProvider>
      <GestureHandlerRootView >
        <Root />
      </GestureHandlerRootView>
    </GlobalProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
