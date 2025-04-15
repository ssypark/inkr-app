import { View, Text, Image, Button, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { deleteSketch } from '../services/SketchManager';

export default function SketchDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sketch } = route.params;

  if (!sketch) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ fontSize: 16, fontFamily: theme.fonts.primary, color: theme.colors.border }}>
          Sketch not found.
        </Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} color={theme.colors.border} />
      </SafeAreaView>
    );
  }

  // Handle sketch deletion
  const handleDelete = async () => {
    Alert.alert(
      "Delete Sketch",
      "Are you sure you want to delete this sketch?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",

          onPress: async () => {
            await deleteSketch(sketch.id);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20 }}>

      {/* Sketch Image */}
      <View style={{ width: '100%', height: 570, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={{ uri: sketch.uri }} // Change from sketch.imageUri to sketch.uri
          style={{
            width: 300,
            height: 600,
            marginTop: -80,  // shift the image up by 30px
          }}
          resizeMode="contain"
        />
      </View>

      {/* Sketch Date */}
      <Text style={{
        fontSize: 14,
        fontFamily: theme.fonts.primary,
        color: theme.colors.border,
        textAlign: 'center',
        marginBottom: 10,
        marginTop: 20,
      }}>
        {sketch.date}
      </Text>

      {/* Sketch Prompt */}
      <Text style={{
        fontSize: 16,
        fontFamily: theme.fonts.bold,
        color: theme.colors.border,
        textAlign: 'center',
        marginBottom: 20,
      }}>
        {`"${sketch.prompt}"`}
      </Text>
      
      {/* Styled Buttons (Delete & Back) */}
      <View style={{ alignItems: 'center', marginTop: 20, width: '100%' }}>
        {/* DELETE BUTTON */}
        <TouchableOpacity
          onPress={handleDelete}
          style={{
            backgroundColor: theme.colors.accent,
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 30,
            borderColor: theme.colors.border,
            borderWidth: 2,
            width: 200, // Fixed width instead of stretch
            marginBottom: 12,
            // Enhance shadow for better 3D effect
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 4 }, // Offset to bottom-right
            shadowOpacity: 0.4,
            shadowRadius: 0, // Sharp shadow edge
            elevation: 6,
          }}
        >
          <Text style={{ 
            fontSize: 18, 
            fontFamily: theme.fonts.bold, 
            color: 'white', 
            textAlign: 'center' 
          }}>
            Delete
          </Text>
        </TouchableOpacity>

        {/* BACK BUTTON - renamed to Home to match image */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{
            backgroundColor: theme.colors.background,
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 30,
            borderColor: theme.colors.border,
            borderWidth: 2,
            width: 200, // Fixed width instead of stretch
            // Enhance shadow for better 3D effect
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 4 }, // Offset to bottom-right
            shadowOpacity: 0.4,
            shadowRadius: 0, // Sharp shadow edge 
            elevation: 6,
          }}
        >
          <Text style={{ 
            fontSize: 18, 
            fontFamily: theme.fonts.bold, 
            color: theme.colors.border, 
            textAlign: 'center' 
          }}>
            Home
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}