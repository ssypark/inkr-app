import React, { useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
// Import SkPath if needed, or ensure Skia.Path is correctly used
import { Canvas, Path, Skia, useCanvasRef } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { theme } from '../styles/theme';

// ... constants remain the same ...
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.5;
const CANVAS_WIDTH = SCREEN_WIDTH - 40;

const COLORS = [
    theme.colors.border, // Primary
    theme.colors.accent  // Accent
];

const STROKE_WIDTHS = [2, 4, 6, 8];


export const SketchCanvas = ({ onSave }) => {
    const [paths, setPaths] = useState([]); // Stores completed paths
    const [currentPath, setCurrentPath] = useState(null); // Stores the path currently being drawn
    const [currentColor, setCurrentColor] = useState(COLORS[0]);
    const [currentStrokeWidth, setCurrentStrokeWidth] = useState(STROKE_WIDTHS[0]);
    // pathRef is no longer needed, we use currentPath state
    const canvasRef = useCanvasRef();

    const panGesture = Gesture.Pan()
        .onStart(e => {
            const newPath = Skia.Path.Make(); // Create a new Skia Path object
            newPath.moveTo(e.x, e.y);
            // Set the current path state to start drawing visually
            setCurrentPath({
                path: newPath,
                color: currentColor,
                strokeWidth: currentStrokeWidth
            });
        })
        .onUpdate(e => {
            // Update the current path state continuously for live drawing
            if (currentPath) {
                // It's crucial to create a *new* path object or copy the existing one
                // for React state updates to trigger re-renders reliably.
                const updatedPath = currentPath.path.copy(); // Make a copy
                updatedPath.lineTo(e.x, e.y);
                setCurrentPath({ // Update state with the modified path object
                    ...currentPath,
                    path: updatedPath
                });
            }
        })
        .onEnd(() => {
            // Add the completed path to the main paths array
            if (currentPath) {
                setPaths(prevPaths => [...prevPaths, currentPath]);
            }
            // Reset the current path state, removing it from the canvas
            setCurrentPath(null);
        })
        .minDistance(1); // Optional: Helps prevent tiny unintentional marks

    const handleUndo = () => {
        // Removes the last *completed* path
        setPaths(paths.slice(0, -1));
    };

    const handleClear = () => {
        setPaths([]);
        setCurrentPath(null); // Also clear any path currently being drawn
    };

    // Save the drawing
    const handleSave = useCallback(() => {
        if (!canvasRef.current) {
            console.error("Canvas reference not available");
            return;
        }

        try {
            console.log("Creating snapshot from canvas...");
            const image = canvasRef.current.makeImageSnapshot();
            
            if (!image) {
                console.error("Failed to create image snapshot");
                return;
            }

            console.log("Encoding image to base64...");
            const base64 = image.encodeToBase64();
            
            if (!base64) {
                console.error("Failed to encode image to base64");
                return;
            }

            console.log("Base64 encoding successful, length:", base64.length);
            
            // Create the data URL
            const imageData = `data:image/png;base64,${base64}`;
            
            // Call the onSave callback which will handle both local saving and API calls
            if (typeof onSave === 'function') {
                console.log("Calling onSave callback to save to backend (https://inkr-backend.onrender.com)...");
                onSave(imageData);
            } else {
                console.error("onSave is not a function:", onSave);
            }
        } catch (error) {
            console.error("Error in handleSave:", error);
            Alert.alert("Error", "Failed to save your sketch. Please try again.");
        }
    }, [onSave]);

    return (
        <View style={styles.container}>
            <View style={styles.canvasContainer}>
                <GestureDetector gesture={panGesture}>
                    <Canvas ref={canvasRef} style={styles.canvas}>
                        {/* Render completed paths */}
                        {paths.map((p, index) => (
                            <Path
                                key={`completed-${index}`} // Use a distinct key prefix
                                path={p.path}
                                color={p.color}
                                strokeWidth={p.strokeWidth}
                                style="stroke"
                                strokeJoin="round"
                                strokeCap="round"
                            />
                        ))}
                        {/* Render the currently drawing path separately */}
                        {currentPath && (
                            <Path
                                path={currentPath.path}
                                color={currentPath.color}
                                strokeWidth={currentPath.strokeWidth}
                                style="stroke"
                                strokeJoin="round"
                                strokeCap="round"
                            />
                        )}
                    </Canvas>
                </GestureDetector>
            </View>

            {/* Toolbar remains the same */}
            <View style={styles.toolbar}>
                <TouchableOpacity onPress={handleUndo} style={styles.toolButton}>
                    <Ionicons name="arrow-undo" size={24} color={theme.colors.border} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClear} style={styles.toolButton}>
                    <Ionicons name="trash-outline" size={24} color={theme.colors.border} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.toolButton}>
                    <Ionicons name="save-outline" size={24} color={theme.colors.accent} />
                </TouchableOpacity>
            </View>

            {/* Options remain the same */}
            <View style={styles.options}>
                <View style={styles.colorPicker}>
                    {COLORS.map((color, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.colorOption, { backgroundColor: color }]}
                            onPress={() => setCurrentColor(color)}
                        />
                    ))}
                </View>
                <View style={styles.strokePicker}>
                    {STROKE_WIDTHS.map((width, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.strokeOption,
                                // Highlight based on state, not ref
                                currentStrokeWidth === width && styles.selectedStroke
                            ]}
                            onPress={() => setCurrentStrokeWidth(width)}
                        >
                            <View
                                style={{
                                    width: width * 2,
                                    height: width * 2,
                                    // Use current color state for preview
                                    backgroundColor: currentColor,
                                    borderRadius: width,
                                }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

// ... styles remain the same ...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    canvasContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', // Ensure canvas background is distinct
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd', // Use a theme color?
        margin: 5, // Add some margin if needed
    },
    canvas: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5, // Adjust padding
        borderTopWidth: 1,
        borderTopColor: theme.colors.border, // Use theme color
        backgroundColor: theme.colors.background, // Match container background
    },
    toolButton: {
        // Removed platform-specific background, adjust if needed
        padding: 10,
        borderRadius: 30, // Fully rounded
        borderWidth: 2,
        borderColor: theme.colors.border,
        marginHorizontal: 5,
        // Consider removing shadows or making them consistent
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Align items vertically
        padding: 10,
        backgroundColor: theme.colors.background, // Match container background
    },
    colorPicker: {
        flexDirection: 'row',
        alignItems: 'center', // Align color dots
    },
    colorOption: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginHorizontal: 5,
        borderWidth: 2,
        borderColor: '#ddd', // Use a theme color?
    },
    strokePicker: {
        flexDirection: 'row',
        alignItems: 'center', // Align stroke options
    },
    strokeOption: {
        width: 30, // Give fixed size for easier tapping
        height: 30, // Give fixed size for easier tapping
        borderRadius: 15, // Make it circular
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2, // Add border to all
        borderColor: 'transparent', // Default transparent border
    },
    selectedStroke: {
        borderColor: theme.colors.accent, // Highlight selected stroke
    },
});