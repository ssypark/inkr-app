import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { prompts } from '../data/prompts';
import { SketchCanvas } from '../components/SketchCanvas';
import { saveSketchToStorage, saveSketchData } from '../services/SketchManager';

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
            const filename = `sketch-${Date.now()}.png`;
            await saveSketchToStorage(filename, imageData);
            
            const newSketch = {
                id: filename,
                date: new Date().toISOString(),
                imageUri: filename,
                prompt
            };
            
            await saveSketchData(newSketch);
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
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        backgroundColor: theme.colors.background,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    buttonText: {
        fontSize: 16,
        fontFamily: theme.fonts.bold,
        color: theme.colors.border,
    },
});