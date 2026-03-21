import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    RefreshControl,
    TextInput,
    FlatList,
    Animated,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useDataStore } from '../../store/dataStore';

// ─── Claymorphic Category Icons (small & cute style) ───
const CATEGORY_META = {
    food:        { icon: 'restaurant',       emoji: '🍜', tint: '#FFF2E5', color: '#F48C25', label: 'Food' },
    grocery:     { icon: 'shopping-basket',   emoji: '🥬', tint: '#E8F5E2', color: '#5C9F52', label: 'Groceries' },
    pharmacy:    { icon: 'medical-services',  emoji: '💊', tint: '#E8F1E8', color: '#4D9C6D', label: 'Pharmacy' },
    shopping:    { icon: 'checkroom',         emoji: '👗', tint: '#F8E5F2', color: '#D2648A', label: 'Clothes' },
    electronics: { icon: 'devices',           emoji: '📱', tint: '#E5EDFF', color: '#6388D8', label: 'Electronics' },
    lifestyle:   { icon: 'auto-awesome',      emoji: '✨', tint: '#F0E5FF', color: '#9B7ED8', label: 'Lifestyle' },
};

// ─── Sort/Filter Options ───
const SORT_OPTIONS = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'priceLow', label: 'Price: Low → High' },
    { id: 'priceHigh', label: 'Price: High → Low' },
    { id: 'newest', label: 'Newest First' },
];

const getImageSource = image => (typeof image === 'string' ? { uri: image } : image);

const HomeScreen = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState(null); // null = show all
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [sortBy, setSortBy] = useState('popular');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState(null); // null = all
    const [vegOnly, setVegOnly] = useState(false);

    const user = useAuthStore(state => state.user);
    const selectedAddress = useAuthStore(state => state.selectedAddress);
    const totalItems = useCartStore(state => state.getTotalItems());
    const stores = useDataStore(state => state.stores);
    const products = useDataStore(state => state.products);
    const serviceCategories = useDataStore(state => state.serviceCategories);
    const orders = useDataStore(state => state.orders);
    const fetchAppData = useDataStore(state => state.fetchAppData);
    const fetchUserOrders = useDataStore(state => state.fetchUserOrders);
    const subscribeRealtime = useDataStore(state => state.subscribeRealtime);
    const unsubscribeRealtime = useDataStore(state => state.unsubscribeRealtime);
    const isLoading = useDataStore(state => state.isLoading);

    useEffect(() => {
        fetchAppData();
        subscribeRealtime();
        return () => unsubscribeRealtime();
    }, [fetchAppData, subscribeRealtime, unsubscribeRealtime]);

    useEffect(() => {
        if (user?.id) {
            fetchUserOrders(user.id);
        }
    }, [fetchUserOrders, user?.id]);

    // ─── Build a displayable item list: mix of products from all stores ───
    const allItems = useMemo(() => {
        return products.map(product => {
            const store = stores.find(s => s.id === product.storeId);
            return {
                ...product,
                storeName: store?.name || 'Unknown Store',
                storeRating: store?.rating,
                storeCategory: store?.category,
                storeLocation: store?.location,
                deliveryTime: store?.deliveryTime,
                deliveryFee: store?.deliveryFee,
            };
        });
    }, [products, stores]);

    // ─── Filter & Search Logic ───
    const filteredItems = useMemo(() => {
        let items = [...allItems];

        // Category filter
        if (selectedCategory) {
            items = items.filter(item => item.storeCategory === selectedCategory);
        }

        // Search
        const query = searchQuery.trim().toLowerCase();
        if (query) {
            items = items.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.storeName.toLowerCase().includes(query) ||
                (item.category || '').toLowerCase().includes(query) ||
                (item.description || '').toLowerCase().includes(query) ||
                (item.storeLocation || '').toLowerCase().includes(query)
            );
        }

        // Veg filter
        if (vegOnly) {
            items = items.filter(item => item.isVeg === true);
        }

        // Price range filter
        if (priceRange) {
            items = items.filter(item => item.price >= priceRange[0] && item.price <= priceRange[1]);
        }

        // Sort
        switch (sortBy) {
            case 'rating':
                items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'priceLow':
                items.sort((a, b) => a.price - b.price);
                break;
            case 'priceHigh':
                items.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                items.sort((a, b) => b.id.localeCompare(a.id));
                break;
            default: // popular – bestsellers first
                items.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
        }

        return items;
    }, [allItems, selectedCategory, searchQuery, sortBy, vegOnly, priceRange]);

    // ─── Featured stores from diverse categories ───
    const featuredStores = useMemo(
        () => stores.filter(store => store.isFeatured).slice(0, 5),
        [stores]
    );

    const activeOrder = orders?.[0] || null;
    const activeStore = activeOrder
        ? stores.find(store => store.id === activeOrder.store_id || store.id === activeOrder.storeId)
        : null;

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchAppData();
            if (user?.id) await fetchUserOrders(user.id);
        } finally {
            setRefreshing(false);
        }
    };

    const allCategories = useMemo(() => {
        const keys = Object.keys(CATEGORY_META);
        // Merge with actual service categories from Supabase  
        const dbIds = serviceCategories.map(c => c.id);
        const merged = [...new Set([...dbIds, ...keys])];
        return merged;
    }, [serviceCategories]);

    const handleCategoryPress = (catId) => {
        if (selectedCategory === catId) {
            setSelectedCategory(null); // toggle off == show all
        } else {
            setSelectedCategory(catId);
        }
    };

    const clearAllFilters = () => {
        setSelectedCategory(null);
        setSearchQuery('');
        setSortBy('popular');
        setVegOnly(false);
        setPriceRange(null);
    };

    const hasActiveFilters = selectedCategory || searchQuery || sortBy !== 'popular' || vegOnly || priceRange;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                    />
                }
            >
                {/* ─── Header ─── */}
                <SafeAreaView edges={['top']} style={styles.safeTop}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerLabel}>Deliver to</Text>
                            <TouchableOpacity
                                style={styles.locationRow}
                                onPress={() => navigation.navigate('AddressSelect')}
                            >
                                <Ionicons name="location" size={16} color={Colors.primary} />
                                <Text style={styles.locationText}>
                                    {selectedAddress?.addressLine1 || 'Marine Drive, Kochi'}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => navigation.navigate('Notifications')}
                            >
                                <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.avatarButton}
                                onPress={() => navigation.navigate('Profile')}
                            >
                                <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>

                {/* ─── Search Bar with Functionality ─── */}
                <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
                    <Ionicons name="search" size={20} color={isSearchFocused ? Colors.primary : Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        placeholder="Search food, clothes, medicines..."
                        placeholderTextColor={Colors.textMuted}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setShowFilters(true)}
                    >
                        <Ionicons name="options-outline" size={18} color={Colors.primary} />
                        {hasActiveFilters && <View style={styles.filterDot} />}
                    </TouchableOpacity>
                </View>

                {/* ─── Active Delivery Card ─── */}
                {activeOrder ? (
                    <TouchableOpacity
                        style={styles.activeCard}
                        onPress={() => navigation.navigate('OrderTracking', { orderId: activeOrder.id })}
                    >
                        <View style={styles.activeGlow} />
                        <View style={styles.activeHeader}>
                            <View>
                                <Text style={styles.activeTag}>Active Delivery</Text>
                                <Text style={styles.activeTitle}>Arriving in 12 mins</Text>
                            </View>
                            <View style={styles.activeIconWrap}>
                                <Ionicons name="car-outline" size={22} color={Colors.white} />
                            </View>
                        </View>
                        <View style={styles.activeOrderCard}>
                            <View style={styles.activeStoreIcon}>
                                <Ionicons name="fast-food" size={18} color={Colors.primary} />
                            </View>
                            <View style={styles.activeStoreCopy}>
                                <Text style={styles.activeStoreTitle}>{activeStore?.name || 'Your order'}</Text>
                                <Text style={styles.activeStoreStatus}>
                                    Order #{String(activeOrder.id).slice(0, 6)} · {activeOrder.status || 'Out for delivery'}
                                </Text>
                            </View>
                            <View style={styles.trackButton}>
                                <Text style={styles.trackButtonText}>Track</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ) : null}

                {/* ─── Categories (Claymorphic, small & cute) ─── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    {selectedCategory && (
                        <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                            <Text style={styles.sectionLink}>Show All</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {allCategories.map(catId => {
                        const meta = CATEGORY_META[catId] || CATEGORY_META.lifestyle;
                        const selected = selectedCategory === catId;
                        return (
                            <TouchableOpacity
                                key={catId}
                                style={[styles.clayCategory, selected && styles.clayCategoryActive]}
                                onPress={() => handleCategoryPress(catId)}
                                activeOpacity={0.8}
                            >
                                <View style={[
                                    styles.clayCategoryIconWrap,
                                    { backgroundColor: meta.tint },
                                    selected && { backgroundColor: meta.color },
                                ]}>
                                    <Text style={styles.clayCategoryEmoji}>{meta.emoji}</Text>
                                </View>
                                <Text style={[
                                    styles.clayCategoryLabel,
                                    selected && { color: Colors.primary, fontWeight: '800' },
                                ]}>{meta.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* ─── Active Filters Bar ─── */}
                {hasActiveFilters && (
                    <View style={styles.activeFiltersBar}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {selectedCategory && (
                                <TouchableOpacity style={styles.filterChip} onPress={() => setSelectedCategory(null)}>
                                    <Text style={styles.filterChipText}>
                                        {(CATEGORY_META[selectedCategory] || CATEGORY_META.lifestyle).label}
                                    </Text>
                                    <Ionicons name="close" size={14} color={Colors.primary} />
                                </TouchableOpacity>
                            )}
                            {sortBy !== 'popular' && (
                                <TouchableOpacity style={styles.filterChip} onPress={() => setSortBy('popular')}>
                                    <Text style={styles.filterChipText}>
                                        {SORT_OPTIONS.find(s => s.id === sortBy)?.label}
                                    </Text>
                                    <Ionicons name="close" size={14} color={Colors.primary} />
                                </TouchableOpacity>
                            )}
                            {vegOnly && (
                                <TouchableOpacity style={styles.filterChip} onPress={() => setVegOnly(false)}>
                                    <Text style={styles.filterChipText}>Veg Only</Text>
                                    <Ionicons name="close" size={14} color={Colors.primary} />
                                </TouchableOpacity>
                            )}
                            {priceRange && (
                                <TouchableOpacity style={styles.filterChip} onPress={() => setPriceRange(null)}>
                                    <Text style={styles.filterChipText}>₹{priceRange[0]}-₹{priceRange[1]}</Text>
                                    <Ionicons name="close" size={14} color={Colors.primary} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.clearAllButton} onPress={clearAllFilters}>
                                <Text style={styles.clearAllText}>Clear All</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}

                {/* ─── Featured Stores Horizontal ─── */}
                {!searchQuery && !selectedCategory && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Featured Stores</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
                                <Text style={styles.sectionLink}>View all</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                            {featuredStores.map(store => (
                                <TouchableOpacity
                                    key={store.id}
                                    style={styles.featureCard}
                                    onPress={() => navigation.navigate('StoreDetail', { storeId: store.id })}
                                >
                                    <View style={styles.featureImageWrap}>
                                        <Image source={getImageSource(store.image)} style={styles.featureImage} />
                                        <View style={styles.ratingBadge}>
                                            <Ionicons name="star" size={11} color={Colors.star} />
                                            <Text style={styles.ratingText}>{store.rating}</Text>
                                        </View>
                                        {store.offer && (
                                            <View style={styles.offerBadge}>
                                                <Text style={styles.offerBadgeText}>{store.offer}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.featureName}>{store.name}</Text>
                                    <Text style={styles.featureMeta}>{store.cuisine}</Text>
                                    <View style={styles.featureFooter}>
                                        <View style={styles.metaChip}>
                                            <Ionicons name="time-outline" size={12} color={Colors.primary} />
                                            <Text style={styles.metaChipText}>{store.deliveryTime}</Text>
                                        </View>
                                        <Text style={styles.offerText}>
                                            {store.deliveryFee === 0 ? 'Free Delivery' : `₹${store.deliveryFee} delivery`}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* ─── Promo Banner ─── */}
                        <View style={styles.bannerCard}>
                            <View style={styles.bannerGlow} />
                            <View style={styles.bannerCopy}>
                                <Text style={styles.bannerTitle}>Free Delivery</Text>
                                <Text style={styles.bannerSubtitle}>On your first 3 orders today</Text>
                                <TouchableOpacity style={styles.bannerButton}>
                                    <Text style={styles.bannerButtonText}>Claim Now</Text>
                                </TouchableOpacity>
                            </View>
                            <Ionicons name="car-sport-outline" size={92} color="rgba(255,255,255,0.25)" style={styles.bannerIcon} />
                        </View>
                    </>
                )}

                {/* ─── Products Grid (Mix of All Items) ─── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {selectedCategory
                            ? (CATEGORY_META[selectedCategory] || CATEGORY_META.lifestyle).label
                            : searchQuery ? 'Search Results' : 'Explore Everything'}
                    </Text>
                    <Text style={styles.resultCount}>{filteredItems.length} items</Text>
                </View>

                {filteredItems.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🔍</Text>
                        <Text style={styles.emptyTitle}>No items found</Text>
                        <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={clearAllFilters}>
                            <Text style={styles.emptyButtonText}>Clear Filters</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.productsGrid}>
                    {filteredItems.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.productCard}
                            onPress={() => navigation.navigate('StoreDetail', { storeId: item.storeId })}
                            activeOpacity={0.9}
                        >
                            <View style={styles.productImageWrap}>
                                {item.image ? (
                                    <Image source={getImageSource(item.image)} style={styles.productImage} />
                                ) : (
                                    <View style={styles.productImagePlaceholder}>
                                        <MaterialIcons name="image" size={30} color={Colors.textMuted} />
                                    </View>
                                )}
                                {item.isBestseller && (
                                    <View style={styles.bestsellerTag}>
                                        <Ionicons name="flame" size={10} color="#FFF" />
                                        <Text style={styles.bestsellerText}>Best</Text>
                                    </View>
                                )}
                                {item.isVeg !== undefined && (
                                    <View style={[styles.vegIndicator, { backgroundColor: item.isVeg ? '#2E9B59' : '#D85C46' }]}>
                                        <View style={styles.vegDot} />
                                    </View>
                                )}
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.productStore} numberOfLines={1}>{item.storeName}</Text>
                                <View style={styles.productFooter}>
                                    <Text style={styles.productPrice}>₹{item.price}</Text>
                                    {item.rating > 0 && (
                                        <View style={styles.miniRating}>
                                            <Ionicons name="star" size={10} color={Colors.star} />
                                            <Text style={styles.miniRatingText}>{item.rating}</Text>
                                        </View>
                                    )}
                                </View>
                                {item.deliveryTime && (
                                    <View style={styles.deliveryInfo}>
                                        <Ionicons name="time-outline" size={10} color={Colors.primary} />
                                        <Text style={styles.deliveryTimeText}>{item.deliveryTime}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {isLoading && filteredItems.length === 0 ? (
                    <View style={styles.loadingWrap}>
                        <Text style={styles.loadingText}>Loading your recommendations...</Text>
                    </View>
                ) : null}
            </ScrollView>

            {/* ─── Floating Cart Button ─── */}
            {totalItems > 0 ? (
                <TouchableOpacity style={styles.floatingCart} onPress={() => navigation.navigate('Cart')}>
                    <Ionicons name="bag-handle" size={20} color={Colors.white} />
                    <Text style={styles.floatingCartText}>Cart</Text>
                    <View style={styles.floatingCartBadge}>
                        <Text style={styles.floatingCartBadgeText}>{totalItems}</Text>
                    </View>
                </TouchableOpacity>
            ) : null}

            {/* ─── Filter Modal ─── */}
            <Modal
                visible={showFilters}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilters(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filters & Sort</Text>
                            <TouchableOpacity onPress={() => setShowFilters(false)}>
                                <Ionicons name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* Sort Options */}
                        <Text style={styles.filterSectionTitle}>Sort by</Text>
                        <View style={styles.sortGrid}>
                            {SORT_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[styles.sortChip, sortBy === option.id && styles.sortChipActive]}
                                    onPress={() => setSortBy(option.id)}
                                >
                                    <Text style={[styles.sortChipText, sortBy === option.id && styles.sortChipTextActive]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Price Range */}
                        <Text style={styles.filterSectionTitle}>Price Range</Text>
                        <View style={styles.sortGrid}>
                            {[
                                { label: 'Under ₹200', range: [0, 200] },
                                { label: '₹200 - ₹500', range: [200, 500] },
                                { label: '₹500 - ₹2000', range: [500, 2000] },
                                { label: '₹2000+', range: [2000, 100000] },
                                { label: 'All Prices', range: null },
                            ].map(opt => (
                                <TouchableOpacity
                                    key={opt.label}
                                    style={[styles.sortChip, JSON.stringify(priceRange) === JSON.stringify(opt.range) && styles.sortChipActive]}
                                    onPress={() => setPriceRange(opt.range)}
                                >
                                    <Text style={[styles.sortChipText, JSON.stringify(priceRange) === JSON.stringify(opt.range) && styles.sortChipTextActive]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Dietary */}
                        <Text style={styles.filterSectionTitle}>Dietary</Text>
                        <TouchableOpacity
                            style={[styles.sortChip, vegOnly && styles.sortChipActive]}
                            onPress={() => setVegOnly(!vegOnly)}
                        >
                            <Text style={[styles.sortChipText, vegOnly && styles.sortChipTextActive]}>
                                🥬  Veg Only
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalClearButton} onPress={clearAllFilters}>
                                <Text style={styles.modalClearText}>Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalApplyButton} onPress={() => setShowFilters(false)}>
                                <Text style={styles.modalApplyText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        paddingHorizontal: Spacing.base,
        paddingBottom: 132,
    },
    safeTop: {
        marginBottom: Spacing.sm,
    },
    // ─── Header Styles ───
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.sm,
    },
    headerLabel: {
        ...Typography.labelSmall,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    locationRow: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        // Claymorphic shadow
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
        elevation: 6,
    },
    avatarButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.card,
    },
    avatarText: {
        ...Typography.labelLarge,
        color: Colors.primaryDark,
        fontWeight: '800',
    },

    // ─── Search Bar ───
    searchBar: {
        marginTop: Spacing.lg,
        backgroundColor: 'rgba(255,255,255,0.90)',
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.base,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        // Claymorphic shadow
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
        elevation: 8,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    searchBarFocused: {
        borderColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOpacity: 0.15,
    },
    searchInput: {
        flex: 1,
        marginLeft: Spacing.sm,
        ...Typography.bodyMedium,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    clearButton: {
        padding: 4,
    },
    filterButton: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    filterDot: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },

    // ─── Active Delivery ───
    activeCard: {
        marginTop: Spacing.xl,
        borderRadius: BorderRadius['2xl'],
        backgroundColor: Colors.primary,
        padding: Spacing.lg,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 10,
    },
    activeGlow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.14)',
        top: -30,
        right: -26,
    },
    activeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.base,
    },
    activeTag: {
        ...Typography.labelSmall,
        color: Colors.white,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        backgroundColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        alignSelf: 'flex-start',
        overflow: 'hidden',
    },
    activeTitle: {
        ...Typography.h2,
        color: Colors.white,
        marginTop: 10,
    },
    activeIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeOrderCard: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: BorderRadius.xl,
        padding: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    activeStoreIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: Colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeStoreCopy: {
        flex: 1,
    },
    activeStoreTitle: {
        ...Typography.labelLarge,
        color: Colors.white,
    },
    activeStoreStatus: {
        ...Typography.caption,
        color: 'rgba(255,255,255,0.76)',
        marginTop: 2,
    },
    trackButton: {
        backgroundColor: Colors.card,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: BorderRadius.lg,
    },
    trackButtonText: {
        ...Typography.labelMedium,
        color: Colors.primary,
        fontWeight: '800',
    },

    // ─── Section Headers ───
    sectionHeader: {
        marginTop: Spacing.xl,
        marginBottom: Spacing.base,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
        fontWeight: '800',
    },
    sectionLink: {
        ...Typography.labelMedium,
        color: Colors.primary,
        fontWeight: '800',
    },
    resultCount: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },

    // ─── Claymorphic Categories ───
    categoryScroll: {
        paddingRight: Spacing.base,
        gap: 14,
    },
    clayCategory: {
        alignItems: 'center',
        gap: 6,
    },
    clayCategoryActive: {
        transform: [{ scale: 1.05 }],
    },
    clayCategoryIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        // Claymorphic: inner light, outer soft shadow
        shadowColor: '#C9C0B8',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    clayCategoryEmoji: {
        fontSize: 24,
    },
    clayCategoryLabel: {
        ...Typography.labelSmall,
        color: Colors.textSecondary,
        fontWeight: '700',
        fontSize: 11,
    },

    // ─── Active Filters Bar ───
    activeFiltersBar: {
        marginTop: Spacing.base,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        marginRight: 8,
        gap: 6,
    },
    filterChipText: {
        ...Typography.labelSmall,
        color: Colors.primary,
        fontWeight: '700',
    },
    clearAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    clearAllText: {
        ...Typography.labelSmall,
        color: Colors.error,
        fontWeight: '700',
    },

    // ─── Featured Cards ───
    horizontalList: {
        paddingRight: Spacing.base,
    },
    featureCard: {
        width: 220,
        marginRight: Spacing.base,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius['2xl'],
        padding: 10,
        // Claymorphic
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    featureImageWrap: {
        height: 120,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.sm,
    },
    featureImage: {
        width: '100%',
        height: '100%',
    },
    ratingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    ratingText: {
        ...Typography.caption,
        color: Colors.textPrimary,
        fontWeight: '700',
    },
    offerBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    offerBadgeText: {
        ...Typography.caption,
        color: Colors.white,
        fontWeight: '700',
        fontSize: 9,
    },
    featureName: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
        fontSize: 14,
    },
    featureMeta: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    featureFooter: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaChipText: {
        ...Typography.caption,
        color: Colors.primary,
        fontWeight: '700',
    },
    offerText: {
        ...Typography.caption,
        color: Colors.success,
        fontWeight: '700',
    },

    // ─── Banner ───
    bannerCard: {
        marginTop: Spacing.xl,
        minHeight: 148,
        borderRadius: BorderRadius['2xl'],
        backgroundColor: Colors.primary,
        padding: Spacing.xl,
        overflow: 'hidden',
    },
    bannerGlow: {
        position: 'absolute',
        right: -24,
        top: -24,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.16)',
    },
    bannerCopy: {
        width: '66%',
    },
    bannerTitle: {
        ...Typography.h2,
        color: Colors.white,
    },
    bannerSubtitle: {
        ...Typography.bodyMedium,
        color: 'rgba(255,255,255,0.84)',
        marginTop: Spacing.xs,
    },
    bannerButton: {
        marginTop: Spacing.base,
        alignSelf: 'flex-start',
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing.base,
        paddingVertical: 10,
        borderRadius: BorderRadius.lg,
    },
    bannerButtonText: {
        ...Typography.labelMedium,
        color: Colors.primary,
        fontWeight: '800',
    },
    bannerIcon: {
        position: 'absolute',
        right: 14,
        bottom: 0,
    },

    // ─── Products Grid (2-column) ───
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCard: {
        width: '48%',
        marginBottom: Spacing.base,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        // Claymorphic
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 6,
    },
    productImageWrap: {
        height: 120,
        backgroundColor: Colors.surfaceLight,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productImagePlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surfaceLight,
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
    vegIndicator: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 16,
        height: 16,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vegDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: Colors.white,
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        ...Typography.labelMedium,
        color: Colors.textPrimary,
        fontWeight: '700',
    },
    productStore: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    productPrice: {
        ...Typography.labelMedium,
        color: Colors.primary,
        fontWeight: '800',
    },
    miniRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    miniRatingText: {
        ...Typography.caption,
        color: Colors.textSecondary,
        fontWeight: '700',
        fontSize: 10,
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    deliveryTimeText: {
        ...Typography.caption,
        color: Colors.textMuted,
        fontSize: 10,
    },

    // ─── Empty State ───
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    emptySubtitle: {
        ...Typography.bodyMedium,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    emptyButton: {
        marginTop: Spacing.base,
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: BorderRadius.full,
    },
    emptyButtonText: {
        ...Typography.labelMedium,
        color: Colors.primary,
        fontWeight: '700',
    },

    // ─── Loading ───
    loadingWrap: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
    loadingText: {
        ...Typography.bodyMedium,
        color: Colors.textSecondary,
    },

    // ─── Floating Cart ───
    floatingCart: {
        position: 'absolute',
        right: Spacing.base,
        bottom: 118,
        backgroundColor: Colors.primary,
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 18,
        elevation: 10,
    },
    floatingCartText: {
        ...Typography.labelMedium,
        color: Colors.white,
        fontWeight: '800',
    },
    floatingCartBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingCartBadgeText: {
        ...Typography.caption,
        color: Colors.primary,
        fontWeight: '800',
    },

    // ─── Filter Modal ───
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: Spacing.xl,
        paddingBottom: 40,
        paddingTop: 12,
        maxHeight: '80%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.border,
        alignSelf: 'center',
        marginBottom: Spacing.base,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    modalTitle: {
        ...Typography.h2,
        color: Colors.textPrimary,
    },
    filterSectionTitle: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    sortGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    sortChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.card,
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    sortChipActive: {
        backgroundColor: Colors.primary,
    },
    sortChipText: {
        ...Typography.labelSmall,
        color: Colors.textSecondary,
        fontWeight: '700',
    },
    sortChipTextActive: {
        color: Colors.white,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.xl,
        gap: 12,
    },
    modalClearButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.card,
        alignItems: 'center',
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    modalClearText: {
        ...Typography.labelMedium,
        color: Colors.textPrimary,
        fontWeight: '700',
    },
    modalApplyButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 8,
    },
    modalApplyText: {
        ...Typography.labelMedium,
        color: Colors.white,
        fontWeight: '800',
    },
});

export default HomeScreen;
