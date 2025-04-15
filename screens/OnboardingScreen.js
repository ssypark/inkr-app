// filepath: /Users/user/Downloads/inkr-app-main/screens/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

const onboardingSteps = [
    {
        key: '1',
        title: 'Welcome to Inkr!',
        description: 'Your daily space to capture creativity through sketching.',
    },
    {
        key: '2',
        title: 'Daily Prompts',
        description: 'Receive a unique drawing prompt each day to inspire you.',
    },
    {
        key: '3',
        title: 'Sketch & Save',
        description: 'Use the canvas or upload a photo of your sketch. Your art is saved locally.',
    },
    {
        key: '4',
        title: 'Browse Your Gallery',
        description: 'View your sketches anytime. Filter them by week, month, or see all entries.',
    },
];

const OnboardingItem = ({ item }) => (
    <View style={styles.slide}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
    </View>
);

export default function OnboardingScreen({ navigation }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const handleDone = async () => {
        try {
            await AsyncStorage.setItem('@onboarding_complete', 'true');
            navigation.replace('Home'); // Replace onboarding with Home
        } catch (e) {
            console.error("Failed to save onboarding status", e);
            // Fallback navigation even if storage fails
            navigation.replace('Home');
        }
    };

    const handleNext = () => {
        if (currentIndex < onboardingSteps.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleDone();
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;


    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={onboardingSteps}
                renderItem={({ item }) => <OnboardingItem item={item} />}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                scrollEventThrottle={16} // Improve performance for onViewableItemsChanged
            />
            <View style={styles.footer}>
                {/* Simple Dots Indicator */}
                <View style={styles.dotsContainer}>
                    {onboardingSteps.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                { backgroundColor: index === currentIndex ? theme.colors.border : theme.colors.neutral }
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>
                        {currentIndex === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
                {currentIndex < onboardingSteps.length - 1 && (
                    <TouchableOpacity style={styles.skipButton} onPress={handleDone}>
                        <Text style={styles.skipButtonText}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    slide: {
        width: width,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    title: {
        fontSize: 24,
        fontFamily: theme.fonts.bold,
        color: theme.colors.border,
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        fontFamily: theme.fonts.primary,
        color: theme.colors.neutral,
        textAlign: 'center',
        lineHeight: 22,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 30, // Adjust as needed for safe area
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30, // Space between dots and button
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    button: {
        backgroundColor: theme.colors.border,
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%', // Make button wider
        marginBottom: 10, // Space for skip button
    },
    buttonText: {
        color: theme.colors.background,
        fontSize: 18,
        fontFamily: theme.fonts.bold,
    },
    skipButton: {
        paddingVertical: 10,
    },
    skipButtonText: {
        color: theme.colors.neutral,
        fontSize: 14,
        fontFamily: theme.fonts.primary,
    }
});