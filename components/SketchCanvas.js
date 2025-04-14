import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Canvas, Path, Skia, useCanvasRef } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { theme } from '../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.5;
const CANVAS_WIDTH = SCREEN_WIDTH - 40;

const COLORS = [
    theme.colors.border, // Primary
    theme.colors.accent  // Accent
];

const STROKE_WIDTHS = [2, 4, 6, 8];

export const SketchCanvas = ({ onSave }) => {
    const [paths, setPaths] = useState([]);
    const [currentColor, setCurrentColor] = useState(COLORS[0]);
    const [currentStrokeWidth, setCurrentStrokeWidth] = useState(STROKE_WIDTHS[0]);
    const pathRef = useRef(null);
    const canvasRef = useCanvasRef();

    const panGesture = Gesture.Pan()
        .onStart(e => {
            const path = Skia.Path.Make();
            path.moveTo(e.x, e.y);
            pathRef.current = { path, color: currentColor, strokeWidth: currentStrokeWidth };
        })
        .onUpdate(e => {
            if (pathRef.current) {
                pathRef.current.path.lineTo(e.x, e.y);
                setPaths([...paths, { ...pathRef.current }]);
            }
        })
        .onEnd(() => {
            if (pathRef.current) {
                setPaths([...paths, { ...pathRef.current }]);
                pathRef.current = null;
            }
        });

    const handleUndo = () => {
        setPaths(paths.slice(0, -1));
    };

    const handleClear = () => {
        setPaths([]);
    };

    const handleSave = async () => {
        if (canvasRef.current) {
            const image = canvasRef.current.makeImageSnapshot();
            if (image) {
                const base64 = image.encodeToBase64();
                onSave(`data:image/png;base64,${base64}`);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.canvasContainer}>
                <GestureDetector gesture={panGesture}>
                    <Canvas ref={canvasRef} style={styles.canvas}>
                        {paths.map((path, index) => (
                            <Path
                                key={index}
                                path={path.path}
                                color={path.color}
                                strokeWidth={path.strokeWidth}
                                style="stroke"
                                strokeJoin="round"
                                strokeCap="round"
                            />
                        ))}
                    </Canvas>
                </GestureDetector>
            </View>

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
                                currentStrokeWidth === width && styles.selectedStroke
                            ]}
                            onPress={() => setCurrentStrokeWidth(width)}
                        >
                            <View
                                style={{
                                    width: width * 2,
                                    height: width * 2,
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    canvasContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    canvas: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    toolButton: {
        backgroundColor: Platform.OS === 'android' ? '#f5f5f5' : 'white',
        padding: 10,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: theme.colors.border,
        marginHorizontal: 5,
        ...Platform.select({
            android: {
                elevation: 3,
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 1,
            }
        }),
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    colorPicker: {
        flexDirection: 'row',
    },
    colorOption: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginHorizontal: 5,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    strokePicker: {
        flexDirection: 'row',
    },
    strokeOption: {
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedStroke: {
        borderWidth: 2,
        borderColor: theme.colors.accent,
    },
});