import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { prompts } from '../data/prompts';
import { SketchCanvas } from '../components/SketchCanvas';
import { updateSketchData, getSketchData } from '../services/SketchManager';
import * as ApiService from '../services/ApiService';

export default function PromptScreen({ navigation }) {
    const [prompt, setPrompt] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        const loadPrompt = async () => {
            try {
                // Try to fetch prompt from server
                const serverPrompt = await ApiService.fetchDailyPrompt();
                
                if (serverPrompt) {
                    setPrompt(serverPrompt);
                } else {
                    // Fallback to local prompts
                    const today = new Date();
                    const promptIndex = today.getDate() % prompts.length;
                    setPrompt(prompts[promptIndex]);
                }
                
                // Set date
                const today = new Date();
                const formattedDate = today.toLocaleDateString('en-US', {  
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
                setDate(formattedDate);
            } catch (error) {
                console.error('Error loading prompt:', error);
                // Fallback to local prompts
                const today = new Date();
                const promptIndex = today.getDate() % prompts.length;
                setPrompt(prompts[promptIndex]);
                
                // Set date
                const formattedDate = today.toLocaleDateString('en-US', {  
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
                setDate(formattedDate);
            }
        };
        
        loadPrompt();
    }, []);

    const handleSaveSketch = async (imageData) => {
        try {
            console.log('Saving sketch...');
            // Create a unique ID for the sketch
            const sketchId = `sketch-${Date.now()}`;
            
            // Create a new sketch object
            const newSketch = {
                id: sketchId,
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                prompt: prompt,
                uri: imageData // This is the data URL from SketchCanvas
            };
            
            // Try saving to server first
            console.log('Saving to backend (https://inkr-backend.onrender.com)...');
            try {
                const savedSketch = await ApiService.saveSketch(newSketch);
                console.log('Sketch saved to server successfully:', savedSketch);
            } catch (serverError) {
                console.error('Error saving to server:', serverError);
                Alert.alert(
                    "Server Error",
                    "Could not save to server, but sketch will be saved locally.",
                    [{ text: "OK" }]
                );
            }
            
            // Also save locally (regardless of server success)
            console.log('Saving locally...');
            // Get existing sketches
            const existingSketches = await getSketchData();
            
            // Add the new sketch to the array
            const updatedSketches = [...existingSketches, newSketch];
            
            // Save the updated sketches array
            await updateSketchData(updatedSketches);
            
            // Success message
            Alert.alert(
                "Sketch Saved",
                "Your sketch has been saved successfully!",
                [
                    { 
                        text: "OK", 
                        onPress: () => navigation.goBack() 
                    }
                ]
            );
        } catch (error) {
            console.error('Error saving sketch:', error);
            Alert.alert(
                "Error",
                "There was a problem saving your sketch. Please try again.",
                [{ text: "OK" }]
            );
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