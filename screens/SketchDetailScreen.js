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
          source={sketch.imageUri}
          style={{
            width: 300,
            height: 600,
            marginTop: -80,  // shift the image up by 30px
          }}
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
      <View style={{ alignItems: 'center', marginTop: 20 }}>

        {/* DELETE BUTTON */}
        <TouchableOpacity
          onPress={handleDelete}
          style={{
            backgroundColor: theme.colors.background,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            borderColor: theme.colors.accent,
            borderWidth: 2,
            alignSelf: 'center',
            marginTop: 0,
          }}
        >
          <Text style={{ fontSize: 14, fontFamily: theme.fonts.bold, color: theme.colors.accent, textAlign: 'center' }}>
            Delete Sketch
          </Text>
        </TouchableOpacity>

        <View style={{ height: 10 }} />

        {/* BACK BUTTON */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: theme.colors.background,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            borderColor: theme.colors.border,
            borderWidth: 2,
            alignSelf: 'center',
            marginTop: 0
          }}
        >
          <Text style={{ fontSize: 14, fontFamily: theme.fonts.bold, color: theme.colors.border, textAlign: 'center' }}>
            Back to Gallery
          </Text>
        </TouchableOpacity>
      </View>




    </SafeAreaView>
  );
}