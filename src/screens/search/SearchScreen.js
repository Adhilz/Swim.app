// ─────────────────────────────────────────────
//  Screen: Search + Discovery
// ─────────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    FlatList,
    StatusBar,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import StoreCard from '../../components/store/StoreCard';
import ProductCard from '../../components/product/ProductCard';
import { useDataStore } from '../../store/dataStore';
import {
    SERVICE_CATEGORIES,
    SORT_OPTIONS,
} from '../../data/mockData';

const { width: W } = Dimensions.get('window');
const SearchScreen = ({ navigation }) => {
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState(['Biryani', 'Meals', 'Kerala Sari']);
    const [trendingSearches] = useState(['Fresh Produce', 'Pharmacy', 'Sweets']);
    const [searchResults, setSearchResults] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const inputRef = useRef(null);
    const filterSlide = useRef(new Animated.Value(0)).current;

    const { stores } = useDataStore();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Debounced search logic
    useEffect(() => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            const lowerQuery = query.toLowerCase();
            const results = stores.filter(
                s =>
                    s.name.toLowerCase().includes(lowerQuery) ||
                    s.cuisine.toLowerCase().includes(lowerQuery) ||
                    (s.tags && s.tags.some(t => t.toLowerCase().includes(lowerQuery)))
            );
            setSearchResults(results);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, stores]);

    const handleSearch = (text) => {
        setQuery(text);
    };

    const toggleCategory = (catId) => {
        setSelectedCategories(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
    };

    const openFilters = () => {
        setShowFilters(true);
        Animated.spring(filterSlide, { toValue: 1, useNativeDriver: true, tension: 200, friction: 25 }).start();
    };

    const closeFilters = () => {
        Animated.timing(filterSlide, { toValue: 0, duration: 250, useNativeDriver: true }).start(() =>
            setShowFilters(false)
        );
    };

    const filterTranslate = filterSlide.interpolate({
        inputRange: [0, 1],
        outputRange: [600, 0],
    });

    const hasResults = query.length > 1;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* ── Search Bar ── */}
            <View style={styles.searchContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color={Colors.textMuted} />
                    <TextInput
                        ref={inputRef}
                        value={query}
                        onChangeText={handleSearch}
                        placeholder="Search stores, products..."
                        placeholderTextColor={Colors.textMuted}
                        style={styles.searchInput}
                        returnKeyType="search"
                        selectionColor={Colors.primary}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => { setQuery(''); setSearchResults([]); }}>
                            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.filterBtn} onPress={openFilters}>
                    <Ionicons name="options" size={20} color={Colors.primary} />
                    {selectedCategories.length > 0 && (
                        <View style={styles.filterDot} />
                    )}
                </TouchableOpacity>
            </View>

            {!hasResults ? (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Recent Searches */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Searches</Text>
                            <TouchableOpacity><Text style={styles.clearText}>Clear All</Text></TouchableOpacity>
                        </View>
                        <View style={styles.chipsRow}>
                            {RECENT_SEARCHES.map(s => (
                                <TouchableOpacity key={s} style={styles.chip} onPress={() => handleSearch(s)}>
                                    <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                                    <Text style={styles.chipText}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Trending */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Trending Near You 🔥</Text>
                        <View style={styles.chipsRow}>
                            {TRENDING_SEARCHES.map(t => (
                                <TouchableOpacity key={t} style={[styles.chip, styles.trendingChip]} onPress={() => handleSearch(t)}>
                                    <Text style={styles.trendingChipText}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Explore Categories */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Explore Categories</Text>
                        <View style={styles.categoriesGrid}>
                            {SERVICE_CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.categoryCard, { borderColor: `${cat.color}40` }]}
                                    onPress={() => navigation.navigate('StoreList', { category: cat.id })}
                                >
                                    <View style={[styles.categoryIconBg, { backgroundColor: `${cat.color}20` }]}>
                                        <Ionicons name={cat.icon} size={24} color={cat.color} />
                                    </View>
                                    <Text style={styles.categoryName}>{cat.name}</Text>
                                    <Text style={styles.categoryDesc}>{cat.deliveryTime}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <FlatList
                    data={searchResults}
                    keyExtractor={s => s.id}
                    contentContainerStyle={styles.resultsList}
                    ListHeaderComponent={
                        <Text style={styles.resultsHeader}>
                            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
                        </Text>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyResults}>
                            <Text style={{ fontSize: 48 }}>🔍</Text>
                            <Text style={styles.emptyTitle}>No results found</Text>
                            <Text style={styles.emptySubtitle}>Try a different search term or browse categories</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <StoreCard
                            store={item}
                            onPress={() => navigation.navigate('StoreDetail', { storeId: item.id })}
                            style={{ marginBottom: Spacing.sm }}
                        />
                    )}
                />
            )}

            {/* ── Filter Bottom Sheet ── */}
            {showFilters && (
                <View style={styles.filterOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeFilters} />
                    <Animated.View style={[styles.filterSheet, { transform: [{ translateY: filterTranslate }] }]}>
                        {/* Handle */}
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Filters</Text>
                            <TouchableOpacity onPress={() => { setSelectedCategories([]); setMinRating(0); setSelectedSort(SORT_OPTIONS[0]); }}>
                                <Text style={styles.resetText}>Reset All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sort */}
                        <Text style={styles.filterLabel}>Sort By</Text>
                        <View style={styles.chipsRow}>
                            {SORT_OPTIONS.map(opt => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[styles.filterChip, selectedSort === opt && styles.filterChipActive]}
                                    onPress={() => setSelectedSort(opt)}
                                >
                                    <Text style={[styles.filterChipText, selectedSort === opt && styles.filterChipTextActive]}>
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Categories */}
                        <Text style={styles.filterLabel}>Categories</Text>
                        <View style={styles.chipsRow}>
                            {SERVICE_CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.filterChip, selectedCategories.includes(cat.id) && styles.filterChipActive]}
                                    onPress={() => toggleCategory(cat.id)}
                                >
                                    <Text style={[styles.filterChipText, selectedCategories.includes(cat.id) && styles.filterChipTextActive]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Min Rating */}
                        <Text style={styles.filterLabel}>Minimum Rating</Text>
                        <View style={styles.chipsRow}>
                            {[0, 3, 3.5, 4, 4.5].map(r => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.filterChip, minRating === r && styles.filterChipActive]}
                                    onPress={() => setMinRating(r)}
                                >
                                    <Text style={[styles.filterChipText, minRating === r && styles.filterChipTextActive]}>
                                        {r === 0 ? 'Any' : `${r}+`} ⭐
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.applyFiltersBtn} onPress={closeFilters}>
                            <Text style={styles.applyFiltersBtnText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center', justifyContent: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.sm,
        height: 44,
        gap: Spacing.sm,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    searchInput: { flex: 1, ...Typography.bodyMedium, color: Colors.textPrimary },
    filterBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: `${Colors.primary}15`,
        alignItems: 'center', justifyContent: 'center',
        position: 'relative',
    },
    filterDot: {
        position: 'absolute',
        top: 8, right: 8,
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: Colors.primary,
        borderWidth: 1.5,
        borderColor: Colors.background,
    },

    section: { padding: Spacing.base, marginBottom: Spacing.xs },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    sectionTitle: { ...Typography.h5, color: Colors.textPrimary },
    clearText: { ...Typography.labelSmall, color: Colors.textMuted },

    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    chipText: { ...Typography.labelSmall, color: Colors.textSecondary },
    trendingChip: { backgroundColor: `${Colors.primary}10`, borderColor: `${Colors.primary}40` },
    trendingChipText: { ...Typography.labelSmall, color: Colors.primary },

    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    categoryCard: {
        width: '47%',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.base,
        borderWidth: 1,
        gap: Spacing.xs,
    },
    categoryIconBg: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
    },
    categoryName: { ...Typography.labelLarge, color: Colors.textPrimary },
    categoryDesc: { ...Typography.caption, color: Colors.textMuted },

    resultsList: { padding: Spacing.base, paddingBottom: 40 },
    resultsHeader: { ...Typography.bodyMedium, color: Colors.textSecondary, marginBottom: Spacing.base },
    emptyResults: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
    emptyTitle: { ...Typography.h4, color: Colors.textPrimary, marginTop: Spacing.base },
    emptySubtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },

    // Filter Sheet
    filterOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 },
    filterSheet: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: Colors.surface,
        borderTopLeftRadius: BorderRadius['2xl'],
        borderTopRightRadius: BorderRadius['2xl'],
        padding: Spacing.base,
        paddingBottom: Spacing['3xl'],
    },
    sheetHandle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: Colors.border,
        alignSelf: 'center',
        marginBottom: Spacing.base,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.base,
    },
    sheetTitle: { ...Typography.h4, color: Colors.textPrimary },
    resetText: { ...Typography.labelMedium, color: Colors.error },
    filterLabel: { ...Typography.labelLarge, color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.sm },
    filterChip: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.card,
    },
    filterChipActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}15` },
    filterChipText: { ...Typography.labelSmall, color: Colors.textSecondary },
    filterChipTextActive: { color: Colors.primary },
    applyFiltersBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.base,
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    applyFiltersBtnText: { ...Typography.labelLarge, color: Colors.white },
});

export default SearchScreen;
