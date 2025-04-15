import React, { useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
// Removed GestureDetector and Gesture imports
import { Canvas, Path, Skia, useCanvasRef } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';
// Removed react-native-gesture-handler imports
import { theme } from '../styles/theme';

// --- Constants ---
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.5; // Adjust as needed
const CANVAS_WIDTH = SCREEN_WIDTH - 40; // Adjust based on container padding/margin

const COLORS = [
    theme.colors.border, // Primary drawing color
    theme.colors.accent  // Secondary drawing color
];

const STROKE_WIDTHS = [2, 4, 6, 8]; // Available stroke widths

// --- Component ---
export const SketchCanvas = ({ onSave }) => {
    const [paths, setPaths] = useState([]); // Stores completed paths
    const [currentPath, setCurrentPath] = useState(null); // Stores the path currently being drawn
    const [isDrawing, setIsDrawing] = useState(false); // Tracks if a move event has occurred after touch start
    const [currentColor, setCurrentColor] = useState(COLORS[0]);
    const [currentStrokeWidth, setCurrentStrokeWidth] = useState(STROKE_WIDTHS[0]);
    const canvasRef = useCanvasRef(); // Ref to access canvas methods like snapshot

    // --- Gesture Responder Handlers ---

    // Ask to become responder on touch start
    const handleStartShouldSetResponder = useCallback(() => true, []);

    // Ask to become responder on move (important for continuous drawing)
    const handleMoveShouldSetResponder = useCallback(() => true, []);

    // User has started touching the canvas
    const handleResponderGrant = useCallback((evt) => {
        const { locationX, locationY } = evt.nativeEvent; // Get touch coordinates relative to the responder View
        console.log('ResponderGrant (Start Touch):', locationX, locationY);

        const newPath = Skia.Path.Make(); // Create a new Skia Path
        newPath.moveTo(locationX, locationY); // Move to the starting point
        // Workaround: Add a tiny line segment to the same point. This might help Skia render the initial point.
        newPath.lineTo(locationX, locationY);

        // Set the current path state to begin tracking
        setCurrentPath({
            path: newPath,
            color: currentColor,
            strokeWidth: currentStrokeWidth
        });
        setIsDrawing(false); // Reset drawing state, wait for first move
    }, [currentColor, currentStrokeWidth]); // Dependencies: color and stroke width

    // User is moving their finger on the canvas
    const handleResponderMove = useCallback((evt) => {
        const { locationX, locationY } = evt.nativeEvent; // Get current touch coordinates
        // console.log('ResponderMove:', locationX, locationY); // Can be very noisy, uncomment for debugging

        if (currentPath) { // Only proceed if a path is being drawn
            if (!isDrawing) { // If this is the first move event after touch start
                setIsDrawing(true); // Set drawing state to true to trigger rendering
            }
            // IMPORTANT: Create a *copy* of the path before modifying.
            // This ensures React recognizes the state change for re-rendering.
            const updatedPath = currentPath.path.copy();
            updatedPath.lineTo(locationX, locationY); // Add the new point to the path copy

            // Update the current path state with the modified path object
            setCurrentPath({
                ...currentPath, // Keep existing color and strokeWidth
                path: updatedPath
            });
        }
    }, [currentPath, isDrawing]); // Dependencies: currentPath and isDrawing state

    // User has lifted their finger from the canvas
    const handleResponderRelease = useCallback(() => {
        console.log('ResponderRelease (End Touch)');
        if (currentPath) {
            // Add the completed path to the main paths array
            setPaths(prevPaths => [...prevPaths, currentPath]);
        }
        // Reset current path and drawing state
        setCurrentPath(null);
        setIsDrawing(false);
    }, [currentPath]); // Dependency: currentPath

    // Handle cases where the responder is taken away (e.g., OS gesture)
    const handleResponderTerminate = useCallback(() => {
        console.log('ResponderTerminate (Gesture Interrupted)');
        // Treat termination like release - finish the current path if desired, or discard
        // Depending on desired behavior, you might want to add the path here too:
        // if (currentPath) { setPaths(prevPaths => [...prevPaths, currentPath]); }

        // Reset state regardless
        setCurrentPath(null);
        setIsDrawing(false);
    }, [currentPath]); // Dependency: currentPath

    // --- Toolbar Handlers ---
    const handleUndo = () => {
        // Remove the last completed path from the array
        setPaths(paths.slice(0, -1));
    };

    const handleClear = () => {
        // Clear all completed paths and any currently drawing path
        setPaths([]);
        setCurrentPath(null);
        setIsDrawing(false); // Ensure drawing state is reset
    };

    // Save the current canvas content as an image
    const handleSave = useCallback(() => {
        if (!canvasRef.current) {
            console.error("Canvas reference not available for saving.");
            Alert.alert("Error", "Could not save sketch. Canvas not ready.");
            return;
        }

        try {
            console.log("Attempting to create snapshot from canvas...");
            // Create a snapshot of the canvas content
            const image = canvasRef.current.makeImageSnapshot();

            if (!image) {
                console.error("Failed to create image snapshot (image is null).");
                Alert.alert("Error", "Failed to capture sketch image.");
                return;
            }

            console.log("Encoding snapshot to base64...");
            // Encode the snapshot to a base64 string
            const base64 = image.encodeToBase64();

            if (!base64) {
                console.error("Failed to encode image to base64 (base64 is null).");
                Alert.alert("Error", "Failed to process sketch image.");
                return;
            }

            console.log("Base64 encoding successful, length:", base64.length);
            // Create the data URL format required for saving/displaying
            const imageData = `data:image/png;base64,${base64}`;

            // Call the onSave prop function passed from the parent screen
            if (typeof onSave === 'function') {
                console.log("Calling onSave callback function...");
                onSave(imageData); // Pass the image data URL to the parent
            } else {
                console.error("onSave prop is not a function:", onSave);
                Alert.alert("Error", "Save function is not configured correctly.");
            }
        } catch (error) {
            console.error("Error during handleSave:", error);
            Alert.alert("Error", "An unexpected error occurred while saving your sketch. Please try again.");
        }
    }, [onSave, canvasRef]); // Dependencies: onSave function and canvasRef

    // --- Render ---
    return (
        <View style={styles.container}>
            {/* This View captures the touch events */}
            <View
                style={styles.canvasContainer}
                onStartShouldSetResponder={handleStartShouldSetResponder}
                onMoveShouldSetResponder={handleMoveShouldSetResponder}
                onResponderGrant={handleResponderGrant}
                onResponderMove={handleResponderMove}
                onResponderRelease={handleResponderRelease}
                onResponderTerminate={handleResponderTerminate}
            >
                {/* The Skia Canvas for drawing */}
                <Canvas ref={canvasRef} style={styles.canvas}>
                    {/* Render all completed paths */}
                    {paths.map((p, index) => (
                        <Path
                            key={`completed-${index}`} // Unique key for each completed path
                            path={p.path}
                            color={p.color}
                            strokeWidth={p.strokeWidth}
                            style="stroke" // Draw the outline
                            strokeJoin="round" // Smooth corners
                            strokeCap="round" // Rounded line ends
                        />
                    ))}
                    {/* Render the path currently being drawn, only if isDrawing is true */}
                    {currentPath && isDrawing && (
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
            </View>

            {/* Toolbar Section */}
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

            {/* Color and Stroke Options Section */}
            <View style={styles.options}>
                {/* Color Picker */}
                <View style={styles.colorPicker}>
                    {COLORS.map((color, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.colorOption,
                                { backgroundColor: color },
                                // Add visual feedback for selected color if desired
                                // currentColor === color && styles.selectedColorOption
                            ]}
                            onPress={() => setCurrentColor(color)}
                        />
                    ))}
                </View>
                {/* Stroke Width Picker */}
                <View style={styles.strokePicker}>
                    {STROKE_WIDTHS.map((width, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.strokeOption,
                                // Highlight the selected stroke width
                                currentStrokeWidth === width && styles.selectedStroke
                            ]}
                            onPress={() => setCurrentStrokeWidth(width)}
                        >
                            {/* Visual representation of the stroke width */}
                            <View
                                style={{
                                    width: width * 2, // Make the dot size relative to stroke width
                                    height: width * 2,
                                    backgroundColor: theme.colors.border, // Use a consistent color for preview dots
                                    borderRadius: width, // Make it circular
                                }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1, // Take up all available space in its parent
        backgroundColor: theme.colors.background,
    },
    canvasContainer: { // The View that handles gestures
        flex: 1, // Take up remaining vertical space
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', // White background for the drawing area
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border, // Use theme color for border
        margin: 5, // Small margin around the canvas area
    },
    canvas: { // The Skia canvas itself
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Distribute buttons evenly
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border, // Separator line
        backgroundColor: theme.colors.background,
    },
    toolButton: {
        padding: 10,
        borderRadius: 30, // Circular buttons
        borderWidth: 2,
        borderColor: theme.colors.border,
        marginHorizontal: 5,
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Place color and stroke pickers at ends
        alignItems: 'center',
        padding: 10,
        backgroundColor: theme.colors.background,
    },
    colorPicker: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorOption: {
        width: 30,
        height: 30,
        borderRadius: 15, // Circular color swatches
        marginHorizontal: 5,
        borderWidth: 2,
        borderColor: theme.colors.neutral, // Use a neutral border for swatches
    },
    // Optional: Style for selected color
    // selectedColorOption: {
    //     borderColor: theme.colors.accent, // Highlight selected color
    // },
    strokePicker: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    strokeOption: {
        width: 30, // Fixed size for touch target
        height: 30,
        borderRadius: 15, // Circular touch target
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent', // Default transparent border
    },
    selectedStroke: {
        borderColor: theme.colors.accent, // Highlight selected stroke width
    },
});