import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
enableScreens();
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, StatusBar, SafeAreaView, Platform } from "react-native";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={colors.background === "#fff" ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
        translucent={false}
      />
      <NavigationContainer
        theme={{
          dark: colors.background === "#000",
          colors: {
            primary: colors.button,
            background: colors.background,
            card: colors.card,
            text: colors.text,
            border: colors.overlay,
            notification: colors.button,
          },
          fonts: {
            regular: {
              fontFamily: Platform.select({
                ios: 'System',
                android: 'sans-serif',
              }),
              fontWeight: '400',
            },
            medium: {
              fontFamily: Platform.select({
                ios: 'System',
                android: 'sans-serif-medium',
              }),
              fontWeight: '500',
            },
            light: {
              fontFamily: Platform.select({
                ios: 'System',
                android: 'sans-serif-light',
              }),
              fontWeight: '300',
            },
            thin: {
              fontFamily: Platform.select({
                ios: 'System',
                android: 'sans-serif-thin',
              }),
              fontWeight: '100',
            },
            bold: {
              fontFamily: Platform.select({
                ios: 'System',
                android: 'sans-serif',
              }),
              fontWeight: 'bold',
            },
            heavy: {
              fontFamily: Platform.select({
                ios: 'System',
                android: 'sans-serif',
              }),
              fontWeight: '900',
            },
          },
        }}
      >
        {isLoggedIn ? <MainAppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaView>
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
