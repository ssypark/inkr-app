import { useEffect, useState, useCallback, useRef } from 'react';
import { View, FlatList, Image, TouchableOpacity, Text, Modal, Pressable, TouchableWithoutFeedback, Dimensions } from 'react-native';
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
    const flatListRef = useRef(null);

    // Force FlatList re-render when columns change based on filter for better UX
    const getNumColumns = () => {
        if (filter === 'week') return 2;
        if (filter === 'month') return 3;
        return 7; // Show 7 columns for all time view (like a calendar)
    };

    const getThumbnailSize = () => {
        switch (filter) {
            case 'week':
                return 150;
            case 'month':
                return 100;
            default:
                return 50; // Smaller thumbnails for all time view
        }
    };

    const getTodayIndex = (filter) => {
        const today = new Date();
        
        switch (filter) {
            case 'week':
                return today.getDay();
            case 'month':
                return today.getDate() - 1;
            default:
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                const diff = today - startOfYear;
                return Math.floor(diff / (1000 * 60 * 60 * 24));
        }
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

    useEffect(() => {
        // Increase the delay to give more time for the FlatList to render fully
        const scrollTimer = setTimeout(() => {
            if (flatListRef.current) {
                const todayIndex = getTodayIndex(filter);
                const columnCount = getNumColumns();
                const rowIndex = Math.floor(todayIndex / columnCount);
                
                // Calculate the y-position to scroll to
                const itemHeight = getThumbnailSize() + (filter === 'all' ? 4 : 10); // height + margin
                
                // Calculate scroll position to place item a bit above center (40% from top instead of 50%)
                const screenHeight = Dimensions.get('window').height;
                const centerPosition = Math.max(0, (rowIndex * itemHeight) - (screenHeight * 0.1) + (itemHeight / 2));
                
                flatListRef.current.scrollToOffset({
                    offset: centerPosition,
                    animated: true
                });
            }
        }, 500); // Increased delay to 500ms to ensure FlatList is fully rendered
        
        return () => clearTimeout(scrollTimer);
    }, [filter]);

    const DotPlaceholder = ({ date }) => {
        const isToday = date.toDateString() === new Date().toDateString();
        const marginSize = filter === 'all' ? 2 : 5;
        
        const PlaceholderContent = (
            <View
                style={{
                    width: getThumbnailSize(),
                    height: getThumbnailSize(),
                    margin: marginSize,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    borderWidth: isToday ? 2 : 0,
                    borderColor: theme.colors.accent,
                    borderRadius: 5
                }}
            >
                <View
                    style={{
                        width: isToday ? 8 : 5,
                        height: isToday ? 8 : 5,
                        borderRadius: 5,
                        backgroundColor: isToday ? theme.colors.accent : theme.colors.border
                    }}
                />
            </View>
        );

        return isToday ? (
            <TouchableOpacity onPress={() => navigation.navigate('Prompt')}>
                {PlaceholderContent}
            </TouchableOpacity>
        ) : (
            PlaceholderContent
        );
    };

    const generatePlaceholderData = (filter) => {
        const today = new Date();
        let numberOfPlaceholders = 0;
        
        switch (filter) {
            case 'week':
                numberOfPlaceholders = 7;
                break;
            case 'month':
                const year = today.getFullYear();
                const month = today.getMonth();
                numberOfPlaceholders = new Date(year, month + 1, 0).getDate();
                break;
            default:
                // All time view shows full year
                const isLeapYear = year => {
                    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
                };
                numberOfPlaceholders = isLeapYear(today.getFullYear()) ? 366 : 365;
        }
        
        // Create array of dates
        const dates = Array.from({ length: numberOfPlaceholders }, (_, index) => {
            const date = new Date();
            if (filter === 'week') {
                date.setDate(date.getDate() - date.getDay() + index);
            } else if (filter === 'month') {
                date.setDate(1 + index);
            } else {
                date.setMonth(0, 1 + index);
            }
            return {
                id: `placeholder-${date.toISOString()}`,
                date: date,
                isEmpty: true
            };
        });

        return dates;
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
                                <Text style={{ fontSize: 14, fontFamily: theme.fonts.primary, color: 'black' }}>
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
                justifyContent: 'flex-start',
                alignItems: 'center',
                paddingHorizontal: filter === 'all' ? 10 : 0,  // Add horizontal padding for all time view
                paddingVertical: filter === 'all' ? 10 : 0     // Add vertical padding for all time view
            }}>
                <FlatList
                    ref={flatListRef}
                    key={getNumColumns()} 
                    contentContainerStyle={{
                        paddingBottom: filter === 'all' ? 20 : 0  // Add bottom padding for all time view
                    }}
                    data={(() => {
                        const placeholders = generatePlaceholderData(filter);
                        // Convert sketches dates to strings for comparison
                        const sketchDates = new Map(
                            filteredSketches.map(sketch => [
                                new Date(sketch.date).toDateString(),
                                sketch
                            ])
                        );
                        
                        // Replace placeholders with actual sketches where they exist
                        return placeholders.map(placeholder => 
                            sketchDates.get(placeholder.date.toDateString()) || placeholder
                        );
                    })()}
                    keyExtractor={(item) => item.id}
                    numColumns={getNumColumns()}
                    extraData={[filter, filteredSketches]}
                    renderItem={({ item }) => (
                        item.isEmpty ? (
                            <DotPlaceholder date={item.date} />
                        ) : (
                            <TouchableOpacity onPress={() => navigation.navigate('SketchDetail', { sketch: item })}>
                                <Image
                                    source={{ uri: item.uri }} // Change from item.imageUri to item.uri
                                    resizeMode='cover'
                                    style={{
                                        width: getThumbnailSize(),
                                        height: getThumbnailSize(),
                                        margin: filter === 'all' ? 2 : 5,  // Smaller margins for all time view
                                        borderRadius: 5,
                                        borderWidth: new Date(item.date).toDateString() === new Date().toDateString() ? 2 : 0,
                                        borderColor: theme.colors.accent
                                    }}
                                />
                            </TouchableOpacity>
                        )
                    )}
                />
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