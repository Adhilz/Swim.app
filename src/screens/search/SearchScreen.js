import React, { useMemo, useRef, useState } from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../../theme';
import { useDataStore } from '../../store/dataStore';

const CATEGORY_CARDS = [
    {
        id: 'food',
        title: 'Food',
        emoji: '🍜',
        storeCategory: 'food',
        tint: '#FFF2E5',
        iconTint: '#F48C25',
        textColor: '#9A5613',
    },
    {
        id: 'grocery',
        title: 'Groceries',
        emoji: '🥬',
        storeCategory: 'lifestyle',
        tint: '#E8F5E2',
        iconTint: '#4C9A45',
        textColor: '#2F6A2A',
    },
    {
        id: 'pharmacy',
        title: 'Pharmacy',
        emoji: '💊',
        storeCategory: 'pharmacy',
        tint: '#E8F1E8',
        iconTint: '#4D9C6D',
        textColor: '#305F3D',
    },
    {
        id: 'shopping',
        title: 'Clothes',
        emoji: '👗',
        storeCategory: 'shopping',
        tint: '#F8E5F2',
        iconTint: '#D2648A',
        textColor: '#6B3E4F',
    },
    {
        id: 'electronics',
        title: 'Electronics',
        emoji: '📱',
        storeCategory: 'lifestyle',
        tint: '#E5EDFF',
        iconTint: '#6388D8',
        textColor: '#273240',
        subtitle: 'Gadgets, accessories & more',
        featured: true,
    },
];

const getImageSource = image => (typeof image === 'string' ? { uri: image } : image);

const SearchScreen = ({ navigation, route }) => {
    const inputRef = useRef(null);
    const stores = useDataStore(state => state.stores);
    const products = useDataStore(state => state.products);
    const isLoading = useDataStore(state => state.isLoading);
    const error = useDataStore(state => state.error);
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(route?.params?.initialCategory || null);
    const [viewMode, setViewMode] = useState('stores'); // 'stores' or 'items'

    // ─── Store filtering ───
    const visibleStores = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const selectedCard = CATEGORY_CARDS.find(card => card.id === selectedCategory);

        return stores
            .filter(store => {
                const categoryMatch = selectedCard ? store.category === selectedCard.storeCategory : true;
                const queryMatch = !normalizedQuery
                    || store.name.toLowerCase().includes(normalizedQuery)
                    || (store.cuisine || '').toLowerCase().includes(normalizedQuery)
                    || (store.location || '').toLowerCase().includes(normalizedQuery);
                return categoryMatch && queryMatch;
            })
            .slice(0, 12);
    }, [query, selectedCategory, stores]);

    // ─── Product filtering (items from selected category across all shops) ───
    const visibleItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const selectedCard = CATEGORY_CARDS.find(card => card.id === selectedCategory);

        return products
            .filter(product => {
                const store = stores.find(s => s.id === product.storeId);
                const categoryMatch = selectedCard ? store?.category === selectedCard.storeCategory : true;
                const queryMatch = !normalizedQuery
                    || product.name.toLowerCase().includes(normalizedQuery)
                    || (product.category || '').toLowerCase().includes(normalizedQuery)
                    || (product.description || '').toLowerCase().includes(normalizedQuery)
                    || (store?.name || '').toLowerCase().includes(normalizedQuery);
                return categoryMatch && queryMatch;
            })
            .map(product => {
                const store = stores.find(s => s.id === product.storeId);
                return {
                    ...product,
                    storeName: store?.name || 'Unknown',
                    storeLocation: store?.location,
                    deliveryTime: store?.deliveryTime,
                };
            })
            .slice(0, 20);
    }, [query, selectedCategory, products, stores]);

    const handleCategoryPress = categoryId => {
        setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
        setQuery('');
    };

    const searchSuggestions = useMemo(() => {
        if (!query || query.length < 2) return [];
        const normalizedQuery = query.trim().toLowerCase();
        const productNames = products
            .filter(p => p.name.toLowerCase().includes(normalizedQuery))
            .map(p => p.name)
            .slice(0, 5);
        const storeNames = stores
            .filter(s => s.name.toLowerCase().includes(normalizedQuery))
            .map(s => s.name)
            .slice(0, 3);
        return [...new Set([...productNames, ...storeNames])].slice(0, 6);
    }, [query, products, stores]);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Browse</Text>
                <TouchableOpacity style={styles.headerButton} onPress={() => inputRef.current?.focus()}>
                    <Ionicons name="search" size={22} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.heroBlock}>
                    <Text style={styles.heroTitle}>
                        What do you{'\n'}
                        <Text style={styles.heroAccent}>need today?</Text>
                    </Text>
                    <Text style={styles.heroSubtitle}>Fast delivery from shops near you.</Text>
                </View>

                {/* ─── Search Input ─── */}
                <View style={styles.searchShell}>
                    <Ionicons name="search" size={20} color={Colors.textMuted} />
                    <TextInput
                        ref={inputRef}
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search items, stores, cuisines..."
                        placeholderTextColor={Colors.textMuted}
                        style={styles.searchInput}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* ─── Search Suggestions ─── */}
                {searchSuggestions.length > 0 && query.length > 0 && (
                    <View style={styles.suggestionsWrap}>
                        {searchSuggestions.map((suggestion, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.suggestionItem}
                                onPress={() => setQuery(suggestion)}
                            >
                                <Ionicons name="search-outline" size={14} color={Colors.textMuted} />
                                <Text style={styles.suggestionText}>{suggestion}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* ─── Categories Grid (Claymorphic) ─── */}
                <View style={styles.grid}>
                    {CATEGORY_CARDS.filter(card => !card.featured).map(card => {
                        const active = card.id === selectedCategory;
                        return (
                            <TouchableOpacity
                                key={card.id}
                                style={[styles.categoryCard, { backgroundColor: card.tint }, active && styles.categoryCardActive]}
                                onPress={() => handleCategoryPress(card.id)}
                                activeOpacity={0.9}
                            >
                                <View style={[styles.categoryIconWrap, { backgroundColor: `${card.iconTint}18` }]}>
                                    <Text style={styles.categoryEmoji}>{card.emoji}</Text>
                                </View>
                                <Text style={[styles.categoryTitle, { color: card.textColor }]}>{card.title}</Text>
                            </TouchableOpacity>
                        );
                    })}

                    {CATEGORY_CARDS.filter(card => card.featured).map(card => {
                        const active = card.id === selectedCategory;
                        return (
                            <TouchableOpacity
                                key={card.id}
                                style={[styles.featuredCategoryCard, active && styles.categoryCardActive]}
                                onPress={() => handleCategoryPress(card.id)}
                                activeOpacity={0.9}
                            >
                                <View style={[styles.categoryIconWrapLarge, { backgroundColor: '#E5EDFF' }]}>
                                    <Text style={{ fontSize: 32 }}>{card.emoji}</Text>
                                </View>
                                <View style={styles.featuredCategoryCopy}>
                                    <Text style={[styles.featuredCategoryTitle, { color: card.textColor }]}>{card.title}</Text>
                                    <Text style={styles.featuredCategorySubtitle}>{card.subtitle}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* ─── View Toggle (Stores / Items) ─── */}
                <View style={styles.toggleRow}>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'stores' && styles.toggleButtonActive]}
                        onPress={() => setViewMode('stores')}
                    >
                        <Ionicons name="storefront-outline" size={16} color={viewMode === 'stores' ? Colors.white : Colors.textSecondary} />
                        <Text style={[styles.toggleText, viewMode === 'stores' && styles.toggleTextActive]}>Stores</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'items' && styles.toggleButtonActive]}
                        onPress={() => setViewMode('items')}
                    >
                        <Ionicons name="grid-outline" size={16} color={viewMode === 'items' ? Colors.white : Colors.textSecondary} />
                        <Text style={[styles.toggleText, viewMode === 'items' && styles.toggleTextActive]}>Items</Text>
                    </TouchableOpacity>
                </View>

                {/* ─── Promo Banner ─── */}
                <View style={styles.promoCard}>
                    <View style={styles.promoGlowTop} />
                    <View style={styles.promoGlowBottom} />
                    <View style={styles.promoCopy}>
                        <Text style={styles.promoTitle}>Free Delivery</Text>
                        <Text style={styles.promoSubtitle}>On your first 3 orders today!</Text>
                        <TouchableOpacity style={styles.promoButton}>
                            <Text style={styles.promoButtonText}>Claim Now</Text>
                        </TouchableOpacity>
                    </View>
                    <MaterialIcons name="local-shipping" size={96} color="rgba(255,255,255,0.28)" style={styles.promoTruck} />
                </View>

                {/* ─── Results Section ─── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {viewMode === 'stores' ? 'Available Stores' : 'Available Items'}
                    </Text>
                    <Text style={styles.sectionCount}>
                        {viewMode === 'stores' ? visibleStores.length : visibleItems.length} showing
                    </Text>
                </View>

                {viewMode === 'stores' ? (
                    // ─── Stores View ───
                    visibleStores.map(store => (
                        <TouchableOpacity
                            key={store.id}
                            style={styles.storeCard}
                            onPress={() => navigation.navigate('StoreDetail', { storeId: store.id })}
                            activeOpacity={0.92}
                        >
                            <Image source={getImageSource(store.image)} style={styles.storeImage} />
                            <View style={styles.storeCopy}>
                                <Text style={styles.storeName}>{store.name}</Text>
                                <Text style={styles.storeMeta}>{store.cuisine}</Text>
                                <View style={styles.storeMetaRow}>
                                    <Text style={styles.storeMetaPill}>{store.deliveryTime}</Text>
                                    <Text style={styles.storeMetaDot}>•</Text>
                                    <Text style={styles.storeMetaPill}>{store.location}</Text>
                                </View>
                            </View>
                            <View style={styles.storeRight}>
                                <View style={styles.storeRatingWrap}>
                                    <Ionicons name="star" size={11} color={Colors.star} />
                                    <Text style={styles.storeRating}>{store.rating}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    // ─── Items Grid View ───
                    <View style={styles.itemsGrid}>
                        {visibleItems.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.itemCard}
                                onPress={() => navigation.navigate('StoreDetail', { storeId: item.storeId })}
                                activeOpacity={0.92}
                            >
                                <View style={styles.itemImageWrap}>
                                    {item.image ? (
                                        <Image source={getImageSource(item.image)} style={styles.itemImage} />
                                    ) : (
                                        <View style={styles.itemImagePlaceholder}>
                                            <MaterialIcons name="image" size={28} color={Colors.textMuted} />
                                        </View>
                                    )}
                                    {item.isBestseller && (
                                        <View style={styles.bestsellerTag}>
                                            <Ionicons name="flame" size={10} color="#FFF" />
                                            <Text style={styles.bestsellerText}>Best</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.itemStore} numberOfLines={1}>{item.storeName}</Text>
                                    <View style={styles.itemFooter}>
                                        <Text style={styles.itemPrice}>₹{item.price}</Text>
                                        {item.rating > 0 && (
                                            <View style={styles.itemRating}>
                                                <Ionicons name="star" size={10} color={Colors.star} />
                                                <Text style={styles.itemRatingText}>{item.rating}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {(isLoading || error) ? (
                    <View style={styles.statusCard}>
                        <Text style={styles.statusText}>
                            {isLoading
                                ? 'Refreshing stores around you...'
                                : 'Showing cached stores while live data reconnects.'}
                        </Text>
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.base,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.90)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 6,
    },
    headerTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    content: {
        paddingHorizontal: Spacing.base,
        paddingBottom: 120,
    },
    heroBlock: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    heroTitle: {
        ...Typography.displaySmall,
        color: Colors.textPrimary,
        lineHeight: 40,
    },
    heroAccent: {
        color: Colors.primary,
    },
    heroSubtitle: {
        ...Typography.bodyMedium,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
    },
    searchShell: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 54,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.base,
        marginBottom: Spacing.base,
        backgroundColor: 'rgba(255,255,255,0.90)',
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 7,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        ...Typography.bodyMedium,
        color: Colors.textPrimary,
    },
    suggestionsWrap: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.base,
        paddingVertical: 4,
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: Spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    suggestionText: {
        ...Typography.bodyMedium,
        color: Colors.textPrimary,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: Spacing.base,
    },
    categoryCard: {
        width: '47%',
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.base,
        alignItems: 'center',
        // Claymorphic shadow
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    categoryCardActive: {
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    categoryIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    categoryEmoji: {
        fontSize: 32,
    },
    categoryTitle: {
        ...Typography.h5,
        fontWeight: '700',
    },
    featuredCategoryCard: {
        width: '100%',
        borderRadius: BorderRadius.xl,
        padding: Spacing.base,
        backgroundColor: '#E5EDFF',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 14,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    categoryIconWrapLarge: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.base,
    },
    featuredCategoryCopy: {
        flex: 1,
    },
    featuredCategoryTitle: {
        ...Typography.h4,
        fontWeight: '700',
    },
    featuredCategorySubtitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginTop: 4,
    },

    // ─── View Toggle ───
    toggleRow: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.full,
        padding: 4,
        marginTop: Spacing.xl,
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: BorderRadius.full,
    },
    toggleButtonActive: {
        backgroundColor: Colors.primary,
    },
    toggleText: {
        ...Typography.labelMedium,
        color: Colors.textSecondary,
        fontWeight: '700',
    },
    toggleTextActive: {
        color: Colors.white,
    },

    // ─── Promo ───
    promoCard: {
        marginTop: Spacing.xl,
        borderRadius: BorderRadius.xl,
        minHeight: 148,
        padding: Spacing.xl,
        backgroundColor: Colors.primary,
        overflow: 'hidden',
    },
    promoGlowTop: {
        position: 'absolute',
        top: -38,
        right: -18,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    promoGlowBottom: {
        position: 'absolute',
        left: -38,
        bottom: -52,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    promoCopy: {
        width: '68%',
    },
    promoTitle: {
        ...Typography.h2,
        color: Colors.white,
    },
    promoSubtitle: {
        ...Typography.bodyMedium,
        color: 'rgba(255,255,255,0.84)',
        marginTop: Spacing.xs,
    },
    promoButton: {
        marginTop: Spacing.base,
        alignSelf: 'flex-start',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: 10,
    },
    promoButtonText: {
        ...Typography.labelMedium,
        color: Colors.primary,
        fontWeight: '800',
    },
    promoTruck: {
        position: 'absolute',
        right: 8,
        bottom: 4,
    },

    // ─── Section ───
    sectionHeader: {
        marginTop: Spacing.xl,
        marginBottom: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
        fontWeight: '800',
    },
    sectionCount: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },

    // ─── Store Cards ───
    storeCard: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: BorderRadius.xl,
        padding: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
        elevation: 6,
    },
    storeImage: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.lg,
    },
    storeCopy: {
        flex: 1,
        marginLeft: Spacing.sm,
    },
    storeName: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
    },
    storeMeta: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    storeMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    storeMetaPill: {
        ...Typography.caption,
        color: Colors.primary,
        fontWeight: '700',
    },
    storeMetaDot: {
        marginHorizontal: 6,
        color: Colors.textMuted,
    },
    storeRight: {
        alignItems: 'center',
        gap: 6,
    },
    storeRatingWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    storeRating: {
        ...Typography.labelSmall,
        color: Colors.textPrimary,
        fontWeight: '800',
    },

    // ─── Items Grid ───
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    itemCard: {
        width: '48%',
        marginBottom: Spacing.base,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
        elevation: 6,
    },
    itemImageWrap: {
        height: 110,
        backgroundColor: Colors.surfaceLight,
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    itemImagePlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bestsellerTag: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    bestsellerText: {
        ...Typography.caption,
        color: Colors.white,
        fontWeight: '800',
        fontSize: 9,
    },
    itemInfo: {
        padding: 10,
    },
    itemName: {
        ...Typography.labelMedium,
        color: Colors.textPrimary,
        fontWeight: '700',
    },
    itemStore: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    itemPrice: {
        ...Typography.labelMedium,
        color: Colors.primary,
        fontWeight: '800',
    },
    itemRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    itemRatingText: {
        ...Typography.caption,
        color: Colors.textSecondary,
        fontWeight: '700',
        fontSize: 10,
    },

    // ─── Status ───
    statusCard: {
        marginTop: Spacing.base,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.82)',
    },
    statusText: {
        ...Typography.caption,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});

export default SearchScreen;
