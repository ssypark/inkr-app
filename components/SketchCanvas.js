import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Path, Skia, useCanvasRef } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.6;

const COLORS = [
    theme.colors.border,  // primary color
    theme.colors.accent   // accent color
];

const STROKE_WIDTHS = [2, 4, 6, 8];

export const SketchCanvas = ({ onSave }) => {
    const [paths, setPaths] = useState([]);
    const [currentColor, setCurrentColor] = useState(COLORS[0]);
    const [currentStrokeWidth, setCurrentStrokeWidth] = useState(STROKE_WIDTHS[0]);
    const pathRef = useRef(null);
    const canvasRef = useCanvasRef();

    // Use Gesture Handler for more reliable touch events
    const panGesture = Gesture.Pan()
        .onStart(e => {
            console.log("Pan started:", e.x, e.y);
            const newPath = {
                path: Skia.Path.Make(),
                color: currentColor,
                strokeWidth: currentStrokeWidth
            };
            newPath.path.moveTo(e.x, e.y);
            pathRef.current = newPath;
        })
        .onUpdate(e => {
            console.log("Pan update:", e.x, e.y);
            if (pathRef.current) {
                pathRef.current.path.lineTo(e.x, e.y);
                // Force re-render
                setPaths([...paths]);
            }
        })
        .onEnd(() => {
            console.log("Pan ended");
            if (pathRef.current) {
                setPaths([...paths, pathRef.current]);
                pathRef.current = null;
            }
        });

    const handleUndo = () => {
        setPaths(paths.slice(0, -1));
    };

    const handleClear = () => {
        setPaths([]);
        pathRef.current = null;
    };

    const handleSave = async () => {
        try {
            if (canvasRef.current) {
                const image = canvasRef.current.makeImageSnapshot();
                if (image) {
                    const base64 = image.encodeToBase64();
                    onSave(`data:image/png;base64,${base64}`);
                }
            }
        } catch (error) {
            console.error('Error saving sketch:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.toolbar}>
                <View style={styles.toolGroup}>
                    <TouchableOpacity onPress={handleUndo} style={styles.toolButton}>
                        <Ionicons name="arrow-undo" size={24} color={theme.colors.border} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleClear} style={styles.toolButton}>
                        <Ionicons name="trash-outline" size={24} color={theme.colors.border} />
                    </TouchableOpacity>
                </View>

                <View style={styles.colorPicker}>
                    {COLORS.map((color, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.colorButton,
                                { backgroundColor: color },
                                color === currentColor && styles.selectedColor
                            ]}
                            onPress={() => setCurrentColor(color)}
                        />
                    ))}
                </View>

                <TouchableOpacity onPress={handleSave} style={styles.toolButton}>
                    <Ionicons name="save-outline" size={24} color={theme.colors.accent} />
                </TouchableOpacity>
            </View>

            <View style={styles.strokePicker}>
                {STROKE_WIDTHS.map((width, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.strokeButton,
                            width === currentStrokeWidth && styles.selectedStroke
                        ]}
                        onPress={() => setCurrentStrokeWidth(width)}
                    >
                        <View 
                            style={[
                                styles.strokePreview, 
                                { 
                                    height: width,
                                    backgroundColor: currentColor
                                }
                            ]} 
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <GestureDetector gesture={panGesture}>
                <Canvas
                    ref={canvasRef}
                    style={styles.canvas}
                >
                    {paths.map((path, index) => (
                        <Path
                            key={index}
                            path={path.path}
                            strokeWidth={path.strokeWidth}
                            style="stroke"
                            color={path.color}
                        />
                    ))}
                    {pathRef.current && (
                        <Path
                            path={pathRef.current.path}
                            strokeWidth={pathRef.current.strokeWidth}
                            style="stroke"
                            color={pathRef.current.color}
                        />
                    )}
                </Canvas>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    toolGroup: {
        flexDirection: 'row',
    },
    toolButton: {
        padding: 10,
    },
    colorPicker: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginHorizontal: 5,
    },
    selectedColor: {
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    strokePicker: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    strokeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    selectedStroke: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 20,
    },
    strokePreview: {
        width: 20,
        borderRadius: 2,
    },
    canvas: {
        flex: 1,
        width: SCREEN_WIDTH - 40,
        height: CANVAS_HEIGHT,
        backgroundColor: '#fff',
        alignSelf: 'center', // Center the canvas
    }
});