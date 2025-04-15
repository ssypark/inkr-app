// filepath: /Users/user/Downloads/inkr-app-main/App.js
import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainNavigation from './navigation/MainNavigation';
import { theme } from './styles/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(null); // null = loading, true = show, false = skip

  useEffect(() => {
    async function prepareApp() {
      try {
        // Load fonts
        await Font.loadAsync({
          "PPAir-Regular": require("./assets/fonts/PPAir-Regular.ttf"),
          "PPAir-SemiBold": require("./assets/fonts/PPAir-SemiBold.ttf"),
        });
        setFontsLoaded(true);

        // Check onboarding status
        const onboardingComplete = await AsyncStorage.getItem('@onboarding_complete');
        setShowOnboarding(onboardingComplete !== 'true');

      } catch (e) {
        console.warn(e);
        // Handle errors, maybe default to skipping onboarding
        setShowOnboarding(false);
      }
    }

    prepareApp();
  }, []);

  // Show loading indicator while fonts load and onboarding status is checked
  if (!fontsLoaded || showOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.border} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {/* Pass the initial route name to MainNavigation */}
          <MainNavigation initialRouteName={showOnboarding ? 'Onboarding' : 'Home'} />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}