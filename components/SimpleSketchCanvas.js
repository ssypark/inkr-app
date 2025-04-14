import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { PerfectSketchCanvas } from 'rn-perfect-sketch-canvas';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.6;

const COLORS = [
    theme.colors.border,  // primary color
    theme.colors.accent   // accent color
];

const STROKE_WIDTHS = [2, 4, 6, 8];

export const SimpleSketchCanvas = ({ onSave }) => {
    const [currentColor, setCurrentColor] = React.useState(COLORS[0]);
    const [currentStrokeWidth, setCurrentStrokeWidth] = React.useState(STROKE_WIDTHS[0]);
    const canvasRef = useRef(null);

    const handleUndo = () => {
        canvasRef.current?.undo();
    };

    const handleClear = () => {
        canvasRef.current?.clear();
    };

    const handleSave = async () => {
        try {
            const base64 = await canvasRef.current?.toImage();
            if (base64) {
                onSave(`data:image/png;base64,${base64}`);
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
                            onPress={() => {
                                setCurrentColor(color);
                                canvasRef.current?.setStrokeColor(color);
                            }}
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
                        onPress={() => {
                            setCurrentStrokeWidth(width);
                            canvasRef.current?.setStrokeWidth(width);
                        }}
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

            <PerfectSketchCanvas
                ref={canvasRef}
                containerStyle={styles.canvas}
                strokeColor={currentColor}
                strokeWidth={currentStrokeWidth}
                backgroundColor="#FFFFFF"
            />
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
        alignSelf: 'center',
        borderRadius: 10,
    }
});