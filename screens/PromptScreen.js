import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { prompts } from '../data/prompts';

export default function PromptScreen() {
  const [prompt, setPrompt] = useState('');
  const [date, setDate] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {  
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    // This gets a random prompt from the prompts array and changes it every day
    const promptIndex = today.getDate() % prompts.length;
    setPrompt(prompts[promptIndex]);
    setDate(formattedDate);
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.cancelled) {
      saveSketch(result.uri);
    }
  };

  const saveSketch = async (imageUri) => {
    const newSketch = {
      id: Date.now().toString(),
      date,
      prompt,
      imageUri
    };

    try {
      const existingSketches = await AsyncStorage.getItem('sketches');
      const sketches = existingSketches ? JSON.parse(existingSketches) : [];
      sketches.push(newSketch);
      await AsyncStorage.setItem('sketches', JSON.stringify(sketches));
      navigation.navigate('Home');
    } catch (error) {
      console.log('Error saving sketch:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        {/* Date */}
        <Text style={{
          fontSize: 14,
          fontFamily: theme.fonts.primary,
          color: theme.colors.border,
          marginBottom: 5,
        }}>
          {date ? date : "Loading..."}
        </Text>

        {/* Prompt  */}
        <View style={{
          padding: 10,
          alignItems: 'center',
          width: '80%',
        }}>
          <Text style={{
            fontSize: 16, 
            fontFamily: theme.fonts.primary,
            color: theme.colors.border,
            textAlign: 'center',
          }}>
            {`'${prompt ? prompt : 'Loading prompt...'}'`}
          </Text>
        </View>

        <View style={{ height: 800 }} /> 

          {/* UPLOAD BUTTON */}
  <TouchableOpacity
    onPress={pickImage}
    style={{
      backgroundColor: theme.colors.border,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      borderColor: theme.colors.border,
      borderWidth: 2,
      alignSelf: 'center',
    }}
  >
    <Text
      style={{
        fontSize: 14,
        fontFamily: theme.fonts.bold,
        color: theme.colors.background,
        textAlign: 'center',
      }}
    >
      Upload Sketch
    </Text>
  </TouchableOpacity>

  {/* RETURN HOME BUTTON */}
  <TouchableOpacity
    onPress={() => navigation.navigate('Home')}
    style={{
      backgroundColor: theme.colors.background,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      borderColor: theme.colors.border,
      borderWidth: 2,
      alignSelf: 'center',
      marginTop: 10, // spacing between buttons
    }}
  >
    <Text
      style={{
        fontSize: 14,
        fontFamily: theme.fonts.bold,
        color: theme.colors.border,
        textAlign: 'center',
      }}
    >
      Return Home
    </Text>
  </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}