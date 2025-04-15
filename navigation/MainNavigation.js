// filepath: /Users/user/Downloads/inkr-app-main/navigation/MainNavigation.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PromptScreen from '../screens/PromptScreen';
import SketchDetailScreen from '../screens/SketchDetailScreen';
import HelpScreen from '../screens/HelpScreen';
import OnboardingScreen from '../screens/OnboardingScreen'; // Import the new screen

const Stack = createNativeStackNavigator();

// Accept initialRouteName prop
export default function MainNavigation({ initialRouteName }) {
  return (
    // Set the initial route based on the prop from App.js
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      {/* Add OnboardingScreen */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Prompt" component={PromptScreen} />
      <Stack.Screen name="SketchDetail" component={SketchDetailScreen} />
      <Stack.Screen name="HelpScreen" component={HelpScreen} options={{ title: 'Help' }} />
    </Stack.Navigator>
  );
}