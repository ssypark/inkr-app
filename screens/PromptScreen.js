import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { prompts } from '../data/prompts';
import { SketchCanvas } from '../components/SketchCanvas';
import { updateSketchData, getSketchData } from '../services/SketchManager';

export default function PromptScreen({ navigation }) {
    const [prompt, setPrompt] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', {  
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        const promptIndex = today.getDate() % prompts.length;
        setPrompt(prompts[promptIndex]);
        setDate(formattedDate);
    }, []);

    const handleSaveSketch = async (imageData) => {
        try {
            // Create a unique ID for the sketch
            const sketchId = `sketch-${Date.now()}`;
            
            // Create a new sketch object
            const newSketch = {
                id: sketchId,
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                prompt: prompt,
                imageUri: imageData // This is already a data URL from SketchCanvas
            };
            
            // Get existing sketches
            const existingSketches = await getSketchData();
            
            // Add the new sketch to the array
            const updatedSketches = [...existingSketches, newSketch];
            
            // Save the updated sketches array
            await updateSketchData(updatedSketches);
            
            // Navigate back to the home screen
            navigation.goBack();
        } catch (error) {
            console.error('Error saving sketch:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.dateText}>
                    {date ? date : "Loading..."}
                </Text>
                <Text style={styles.promptText}>
                    {`'${prompt ? prompt : 'Loading prompt...'}'`}
                </Text>
            </View>

            {/* Canvas */}
            <View style={styles.canvasContainer}>
                <SketchCanvas onSave={handleSaveSketch} />
            </View>

            {/* Bottom Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Return Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    dateText: {
        fontSize: 14,
        fontFamily: theme.fonts.primary,
        color: theme.colors.border,
        marginBottom: 10,
    },
    promptText: {
        fontSize: 18,
        fontFamily: theme.fonts.primary,
        color: theme.colors.border,
        textAlign: 'center',
    },
    canvasContainer: {
        flex: 1,
        margin: 10,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    buttonContainer: {
        padding: 20,
        alignItems: 'center',
    },
    button: {
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 5,
    },
    buttonText: {
        color: theme.colors.border,
        fontSize: 20,
        fontFamily: theme.fonts.bold,
    },
    toolButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: theme.colors.border,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 3,
    },
});