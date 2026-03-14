import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { BANNERS } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useDataStore } from '../../store/dataStore';

const CATEGORY_META = {
    food: { icon: 'lunch-dining', tint: '#FCE3CF', color: '#F48C25', label: 'Food' },
    grocery: { icon: 'shopping-basket', tint: '#DDF0D7', color: '#5C9F52', label: 'Groceries' },
    pharmacy: { icon: 'medical-services', tint: '#FBE0E0', color: '#D85C46', label: 'Pharmacy' },
    shopping: { icon: 'checkroom', tint: '#F8DDE8', color: '#D2648A', label: 'Clothes' },
    electronics: { icon: 'devices', tint: '#DCEEFE', color: '#32A7D6', label: 'Electronics' },
    lifestyle: { icon: 'auto-awesome', tint: '#ECE2FB', color: '#8F67D7', label: 'Anything' },
};

const getImageSource = image => (typeof image === 'string' ? { uri: image } : image);

const HomeScreen = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState('food');
    const [refreshing, setRefreshing] = useState(false);
    const user = useAuthStore(state => state.user);
    const selectedAddress = useAuthStore(state => state.selectedAddress);
    const totalItems = useCartStore(state => state.getTotalItems());
    const stores = useDataStore(state => state.stores);
    const serviceCategories = useDataStore(state => state.serviceCategories);
    const orders = useDataStore(state => state.orders);
    const fetchAppData = useDataStore(state => state.fetchAppData);
    const fetchUserOrders = useDataStore(state => state.fetchUserOrders);
    const isLoading = useDataStore(state => state.isLoading);

    useEffect(() => {
        fetchAppData();
    }, [fetchAppData]);

    useEffect(() => {
        if (user?.id) {
            fetchUserOrders(user.id);
        }
    }, [fetchUserOrders, user?.id]);

    const featuredStores = useMemo(
        () => stores.filter(store => store.isFeatured).slice(0, 5),
        [stores]
    );
    const topPicks = useMemo(() => {
        return stores
            .filter(store => !selectedCategory || store.category === selectedCategory)
            .slice(0, 6);
    }, [selectedCategory, stores]);
    const activeOrder = orders?.[0] || null;
    const activeStore = activeOrder
        ? stores.find(store => store.id === activeOrder.store_id || store.id === activeOrder.storeId)
        : null;

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchAppData();
            if (user?.id) {
                await fetchUserOrders(user.id);
            }
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                    />
                }
            >
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

                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={Colors.textMuted} />
                    <TouchableOpacity style={styles.searchField} onPress={() => navigation.navigate('Browse')}>
                        <Text style={styles.searchPlaceholder}>What are you looking for?</Text>
                    </TouchableOpacity>
                    <View style={styles.filterButton}>
                        <Ionicons name="options-outline" size={18} color={Colors.primary} />
                    </View>
                </View>

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

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
                        <Text style={styles.sectionLink}>See all</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.categoryGrid}>
                    {serviceCategories.slice(0, 6).map(category => {
                        const meta = CATEGORY_META[category.id] || CATEGORY_META.lifestyle;
                        const selected = selectedCategory === category.id;
                        return (
                            <TouchableOpacity
                                key={category.id}
                                style={[styles.categoryTile, selected && styles.categoryTileActive]}
                                onPress={() => {
                                    setSelectedCategory(category.id);
                                    navigation.navigate('Browse', { initialCategory: category.id });
                                }}
                            >
                                <View style={[styles.categoryIconWrap, { backgroundColor: meta.tint }]}>
                                    <MaterialIcons name={meta.icon} size={30} color={meta.color} />
                                </View>
                                <Text style={styles.categoryText}>{meta.label || category.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Picks for You</Text>
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
                            </View>
                            <Text style={styles.featureName}>{store.name}</Text>
                            <Text style={styles.featureMeta}>{store.cuisine} · {store.location}</Text>
                            <View style={styles.featureFooter}>
                                <View style={styles.metaChip}>
                                    <Ionicons name="time-outline" size={12} color={Colors.primary} />
                                    <Text style={styles.metaChipText}>{store.deliveryTime}</Text>
                                </View>
                                <Text style={styles.offerText}>{store.deliveryFee === 0 ? 'Free Delivery' : store.offer || 'Popular'}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.bannerCard}>
                    <View style={styles.bannerGlow} />
                    <View style={styles.bannerCopy}>
                        <Text style={styles.bannerTitle}>{BANNERS[0]?.title || 'Free Delivery'}</Text>
                        <Text style={styles.bannerSubtitle}>{BANNERS[0]?.subtitle || 'On your first 3 orders today'}</Text>
                        <TouchableOpacity style={styles.bannerButton}>
                            <Text style={styles.bannerButtonText}>Claim Now</Text>
                        </TouchableOpacity>
                    </View>
                    <Ionicons name="car-sport-outline" size={92} color="rgba(255,255,255,0.25)" style={styles.bannerIcon} />
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Around You</Text>
                </View>
                {topPicks.map(store => (
                    <TouchableOpacity
                        key={store.id}
                        style={styles.listCard}
                        onPress={() => navigation.navigate('StoreDetail', { storeId: store.id })}
                    >
                        <Image source={getImageSource(store.image)} style={styles.listImage} />
                        <View style={styles.listCopy}>
                            <Text style={styles.listName}>{store.name}</Text>
                            <Text style={styles.listSub}>{store.cuisine}</Text>
                            <View style={styles.listMetaRow}>
                                <Text style={styles.listMeta}>{store.deliveryTime}</Text>
                                <Text style={styles.dot}>·</Text>
                                <Text style={styles.listMeta}>{store.distance}</Text>
                            </View>
                        </View>
                        <View style={styles.listRight}>
                            <Text style={styles.listRating}>{store.rating}</Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                        </View>
                    </TouchableOpacity>
                ))}

                {isLoading && topPicks.length === 0 ? (
                    <View style={styles.loadingWrap}>
                        <Text style={styles.loadingText}>Loading your recommendations...</Text>
                    </View>
                ) : null}
            </ScrollView>

            {totalItems > 0 ? (
                <TouchableOpacity style={styles.floatingCart} onPress={() => navigation.navigate('Cart')}>
                    <Text style={styles.floatingCartText}>Cart</Text>
                    <View style={styles.floatingCartBadge}>
                        <Text style={styles.floatingCartBadgeText}>{totalItems}</Text>
                    </View>
                </TouchableOpacity>
            ) : null}
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
        backgroundColor: '#FDE8D2',
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
    searchBar: {
        marginTop: Spacing.lg,
        backgroundColor: 'rgba(255,255,255,0.86)',
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.base,
        height: 58,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
        elevation: 8,
    },
    searchField: {
        flex: 1,
        marginLeft: Spacing.sm,
    },
    searchPlaceholder: {
        ...Typography.bodyMedium,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    filterButton: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: '#FDF0E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
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
    sectionHeader: {
        marginTop: Spacing.xl,
        marginBottom: Spacing.base,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        ...Typography.h2,
        color: Colors.textPrimary,
    },
    sectionLink: {
        ...Typography.labelMedium,
        color: Colors.primary,
        fontWeight: '800',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: Spacing.base,
    },
    categoryTile: {
        width: '31%',
        alignItems: 'center',
        gap: 8,
    },
    categoryTileActive: {
        transform: [{ scale: 0.98 }],
    },
    categoryIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.card,
        shadowColor: '#DCCFC2',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
        elevation: 6,
    },
    categoryText: {
        ...Typography.labelMedium,
        color: Colors.textPrimary,
        fontWeight: '700',
    },
    horizontalList: {
        paddingRight: Spacing.base,
    },
    featureCard: {
        width: 242,
        marginRight: Spacing.base,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.sm,
        shadowColor: '#DCCFC2',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 8,
    },
    featureImageWrap: {
        height: 132,
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
        top: 10,
        right: 10,
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
    featureName: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    featureMeta: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    featureFooter: {
        marginTop: Spacing.sm,
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
    bannerCard: {
        marginTop: Spacing.xl,
        minHeight: 168,
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
    listCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        shadowColor: '#DCCFC2',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 6,
    },
    listImage: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.lg,
    },
    listCopy: {
        flex: 1,
        marginLeft: Spacing.sm,
    },
    listName: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
    },
    listSub: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginTop: 3,
    },
    listMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    listMeta: {
        ...Typography.caption,
        color: Colors.primary,
        fontWeight: '700',
    },
    dot: {
        marginHorizontal: 6,
        color: Colors.textMuted,
    },
    listRight: {
        alignItems: 'center',
        gap: 4,
    },
    listRating: {
        ...Typography.labelMedium,
        color: Colors.textPrimary,
        fontWeight: '800',
    },
    loadingWrap: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
    loadingText: {
        ...Typography.bodyMedium,
        color: Colors.textSecondary,
    },
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
        gap: 10,
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
});

export default HomeScreen;
