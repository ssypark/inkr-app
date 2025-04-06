import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PromptScreen from '../screens/PromptScreen';
import SketchDetailScreen from '../screens/SketchDetailScreen';
import HelpScreen from '../screens/HelpScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Prompt" component={PromptScreen} />
      <Stack.Screen name="SketchDetail" component={SketchDetailScreen} />
      <Stack.Screen name="HelpScreen" component={HelpScreen} options={{ title: 'Help' }} />
    </Stack.Navigator>
  );
}