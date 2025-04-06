import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { loadSampleData, clearAllSketches } from '../services/SketchManager';

export default function HelpScreen() {
    // we use useNavigation() to get the navigation object to navigate between screens
    const navigation = useNavigation(); 
    // for this app, i wanted to use TouchableOpacity for buttons instead of the default button component because it gives more control over the styling
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20 }}>
            {/* HEADER WITH BACK BUTTON */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                    <Ionicons name="arrow-back" size={28} color={theme.colors.border} />
                </TouchableOpacity>
                <Text style={{ fontSize: 24, fontFamily: theme.fonts.bold, color: theme.colors.border }}>
                    How to Use Inkr
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Instructions */}
                <View style={{ marginBottom: 20 }}>
                    {[
                        "Every day, you'll see a new drawing prompt.",
                        "Screenshot the template and use your phone’s markup tools to draw.",
                        "Scroll down on the Prompt screen to Upload your sketch, and it will be stored in the app.",
                        "Use the filter icon to browse sketches by week, month, or all time.",
                        "Tap on a sketch to view it in detail."
                    ].map((item, index) => (
                        <View
                            key={index}
                            style={{ flexDirection: 'row', marginBottom: 5 }}
                        >
                            {/* The bullet */}
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontFamily: theme.fonts.bold,
                                    color: theme.colors.border,
                                    marginRight: 8, // Some spacing after the bullet
                                }}
                            >
                            
                                {"\u2022"}
                            </Text>

                            {/* The text */}
                            <Text
                                style={{
                                    flex: 1, 
                                    fontSize: 16,
                                    fontFamily: theme.fonts.primary,
                                    color: theme.colors.border,
                                }}
                            >
                                {item}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Ending Note */}
                <Text
                    style={{
                        fontSize: 16,
                        fontFamily: theme.fonts.primary,
                        color: theme.colors.border,
                        textAlign: 'center',
                        marginBottom: 20
                    }}
                >
                    Have fun sketching and exploring your creativity!
                </Text>

                {/* Start a New Sketch */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Prompt')}
                    style={{
                        backgroundColor: theme.colors.border,
                        paddingVertical: 15,
                        paddingHorizontal: 25,
                        borderRadius: 8,
                        borderColor: theme.colors.border,
                        borderWidth: 2,
                        alignSelf: 'center'
                    }}
                >
                    <Text style={{ fontSize: 18, fontFamily: theme.fonts.bold, color: theme.colors.background, textAlign: 'center' }}>
                        Start a New Sketch
                    </Text>
                </TouchableOpacity>

                {/* Load Sample Data */}
                <TouchableOpacity
                    onPress={async () => {
                        await loadSampleData();
                        Alert.alert("Sample Data Loaded", "Sample sketches have been added.");
                    }}
                    style={{
                        backgroundColor: theme.colors.background,
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                        borderColor: theme.colors.neutral,
                        borderWidth: 2,
                        alignSelf: 'center',
                        marginTop: 40
                    }}
                >
                    <Text style={{ fontSize: 18, fontFamily: theme.fonts.bold, color: theme.colors.neutral, textAlign: 'center' }}>
                        Load Sample Data
                    </Text>
                </TouchableOpacity>

                {/* Clear All Data */}
                <TouchableOpacity
                    onPress={async () => {
                        await clearAllSketches();
                        Alert.alert("Data Cleared", "All sketches have been removed.");
                        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                    }}
                    style={{
                        backgroundColor: theme.colors.background,
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                        borderColor: theme.colors.accent,
                        borderWidth: 2,
                        alignSelf: 'center',
                        marginTop: 10
                    }}
                >
                    <Text style={{ fontSize: 18, fontFamily: theme.fonts.bold, color: theme.colors.accent, textAlign: 'center' }}>
                        Clear All Data
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}