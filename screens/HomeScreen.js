import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Image, TouchableOpacity, Text, Modal, Pressable, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FAB } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

import {
    getSketchData,
    filterByWeek,
    filterByMonth,
    filterAllTime
} from '../services/SketchManager';

export default function HomeScreen() {
    const [sketches, setSketches] = useState([]);
    const [filteredSketches, setFilteredSketches] = useState([]);
    const [filter, setFilter] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    // Force FlatList re-render when columns change based on filter for better UX
    const getNumColumns = () => {
        if (filter === 'week') return 2;
        if (filter === 'month') return 3;
        return 4;
    };

    // Load sketches on mount. We use the empty dependency array to ensure this effect
    // only runs once, when the component is mounted. If we didn't use the dependency
    // array, the effect would run every time the component re-renders, which is not
    // what we want. We want the component to load the sketches just once, when it's
    // first mounted, and then not again until the user navigates away and comes back.
    useEffect(() => {
        loadSketches();
    }, []);

    // Reload when screen is focused. I used useFocusEffect instead of useEffect to avoid unnecessary re-renders
    // This is useful when returning from another screen or when a sketch is deleted
    // useCallback is used to memoize the function so it's not recreated
    // on every render, and the dependency array is empty so the effect only runs when the screen
    // is focused, not on every re-render.
    useFocusEffect(
        useCallback(() => {
            // Load sketches from storage
            loadSketches();
        }, []) // Empty dependency array means the effect only runs when the screen is focused
    );

    // Async load from storage
    const loadSketches = async () => {
        const data = await getSketchData();
        setSketches(data);
        applyFilter(data, filter);
    };

    // Filter logic
    const applyFilter = (sketchList, selectedFilter) => {
        let filtered;
        if (selectedFilter === 'week') {
            filtered = filterByWeek(sketchList);
        } else if (selectedFilter === 'month') {
            filtered = filterByMonth(sketchList);
        } else {
            filtered = filterAllTime(sketchList);
        }
        setFilteredSketches(filtered);
    };

    // Update filter & re-filter
    const handleFilterChange = (selectedFilter) => {
        setFilter(selectedFilter);
        applyFilter(sketches, selectedFilter);
        setModalVisible(false);
    };

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.border
        }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 2,
                borderBottomColor: theme.colors.border
            }}>
                <Text style={{ fontSize: 32, fontFamily: theme.fonts.bold, color: theme.colors.border }}>
                    Inkr.
                </Text>

                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('HelpScreen')}>
                        <Ionicons name="help-circle-outline" size={28} color={theme.colors.border} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Ionicons name="filter-outline" size={28} color={theme.colors.border} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Modal */}
            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <View style={{
                            backgroundColor: theme.colors.background,
                            padding: 20,
                            borderRadius: 10,
                            width: '80%',
                            alignItems: 'center',
                            borderColor: theme.colors.border,
                            borderWidth: 2
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontFamily: theme.fonts.bold,
                                color: theme.colors.border,
                                marginBottom: 15
                            }}>
                                Filter Sketches
                            </Text>

                            <Pressable onPress={() => handleFilterChange('week')} style={{ paddingVertical: 10 }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontFamily: theme.fonts.primary,
                                    color: filter === 'week' ? theme.colors.accent : theme.colors.border
                                }}>
                                    This Week
                                </Text>
                            </Pressable>

                            <Pressable onPress={() => handleFilterChange('month')} style={{ paddingVertical: 10 }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontFamily: theme.fonts.primary,
                                    color: filter === 'month' ? theme.colors.accent : theme.colors.border
                                }}>
                                    This Month
                                </Text>
                            </Pressable>

                            <Pressable onPress={() => handleFilterChange('all')} style={{ paddingVertical: 10 }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontFamily: theme.fonts.primary,
                                    color: filter === 'all' ? theme.colors.accent : theme.colors.border
                                }}>
                                    All Time
                                </Text>
                            </Pressable>

                            <Pressable onPress={() => setModalVisible(false)} style={{ paddingVertical: 10, marginTop: 10 }}>
                                <Text style={{ fontSize: 14, fontFamily: theme.fonts.primary, color: 'red' }}>
                                    Cancel
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Sketch Grid */}
            <View style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                justifyContent: filteredSketches.length === 0 ? 'center' : 'flex-start',
                alignItems: 'center'
            }}>
                {filteredSketches.length === 0 ? (
                    <Text style={{ textAlign: 'center', fontFamily: theme.fonts.primary }}>
                        No sketches yet. Start your first one!
                    </Text>
                ) : (
                    <FlatList
                        key={getNumColumns()} 
                        data={filteredSketches}
                        keyExtractor={(item) => item.id}
                        numColumns={getNumColumns()}
                        extraData={filter}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => navigation.navigate('SketchDetail', { sketch: item })}>
                                <Image
                                    source={item.imageUri}
                                    resizeMode='cover'
                                    style={{
                                        width: getNumColumns() === 2 ? 150 : getNumColumns() === 3 ? 100 : 75,
                                        height: getNumColumns() === 2 ? 150 : getNumColumns() === 3 ? 100 : 75,
                                        margin: 5,
                                        borderRadius: 5
                                    }}
                                />
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>

            {/* Floating Action Button */}
            <FAB
                title="+"
                placement="center"
                size="large"
                color={theme.colors.border}
                titleStyle={{
                    color: theme.colors.background,
                    fontSize: 36,
                    fontFamily: theme.fonts.bold,
                    textAlign: 'center'
                }}
                buttonStyle={{
                    borderColor: theme.colors.border,
                    borderWidth: 2,
                    borderRadius: 50,
                    width: 65,
                    height: 65
                }}
                onPress={() => navigation.navigate('Prompt')}
                style={{
                    position: 'absolute',
                    bottom: 20,
                    alignSelf: 'center'
                }}
            />
        </SafeAreaView>
    );
}