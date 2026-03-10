// ─────────────────────────────────────────────
//  Screen: Home (Swim.ai Premium Edition)
// ─────────────────────────────────────────────
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    StatusBar,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import CategoryPill from '../../components/home/CategoryPill';
import StoreCard from '../../components/store/StoreCard';
import FeaturedStoreCard from '../../components/store/FeaturedStoreCard';
import { SERVICE_CATEGORIES, MOCK_STORES, MOCK_BANNERS } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const { width: W } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState('food');
    const user = useAuthStore(s => s.user);
    const selectedAddress = useAuthStore(s => s.selectedAddress);
    const totalItems = useCartStore(s => s.getTotalItems());

    const featuredStores = MOCK_STORES.filter(s => s.isFeatured);
    const regularStores = MOCK_STORES.filter(s => !selectedCategory || s.category === selectedCategory);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* ── Header ── */}
            <SafeAreaView style={styles.header} edges={['top']}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.locationContainer}
                        onPress={() => navigation.navigate('AddressSelect')}
                    >
                        <Ionicons name="location" size={18} color={Colors.primary} />
                        <View style={styles.locationText}>
                            <Text style={styles.locationTitle}>Marine Drive, Kochi</Text>
                            <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.profileBtn}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100' }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Hero Search Section ── */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Discover the Best of{'\n'}Ernakulam</Text>

                    <TouchableOpacity
                        style={styles.searchBar}
                        onPress={() => navigation.navigate('Search')}
                    >
                        <Ionicons name="search" size={20} color={Colors.textSecondary} />
                        <Text style={styles.searchPlaceholder}>Search stores or dishes...</Text>
                        <View style={styles.searchCommand}>
                            <Text style={styles.commandText}>⌘K</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* ── Modern Category Pills ── */}
                <FlatList
                    data={SERVICE_CATEGORIES}
                    renderItem={({ item }) => (
                        <CategoryPill
                            category={item}
                            isSelected={selectedCategory === item.id}
                            onPress={(cat) => setSelectedCategory(cat.id)}
                        />
                    )}
                    keyExtractor={i => i.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesRow}
                />

                {/* ── Featured Section (The "Eye Catching" Part) ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Legendary Stores</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={featuredStores}
                        renderItem={({ item }) => (
                            <FeaturedStoreCard
                                store={item}
                                onPress={() => navigation.navigate('StoreDetail', { storeId: item.id })}
                            />
                        )}
                        keyExtractor={i => i.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.featuredList}
                        snapToInterval={W * 0.75 + Spacing.base}
                        decelerationRate="fast"
                    />
                </View>

                {/* ── Promo Banner ── */}
                <View style={styles.promoSection}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' }}
                        style={styles.promoImage}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(1,4,9,0.8)']}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.promoContent}>
                        <Text style={styles.promoTitle}>Culinary Experience</Text>
                        <Text style={styles.promoSubtitle}>Explore Lulu Mall's Finest</Text>
                    </View>
                </View>

                {/* ── Regular Stores ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Around Panampilly Nagar</Text>
                    </View>
                    {regularStores.map(store => (
                        <StoreCard
                            key={store.id}
                            store={store}
                            onPress={() => navigation.navigate('StoreDetail', { storeId: store.id })}
                            style={styles.storeCard}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* ── Bottom Cart Bar ── */}
            {totalItems > 0 && (
                <TouchableOpacity
                    style={styles.cartBar}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <LinearGradient colors={['#0096C7', '#023E8A']} style={styles.cartGradient}>
                        <View style={styles.cartInfo}>
                            <Text style={styles.cartCount}>{totalItems} items</Text>
                            <Text style={styles.cartSub}>Swim.ai Checkout</Text>
                        </View>
                        <View style={styles.cartAction}>
                            <Text style={styles.cartActionText}>View Cart</Text>
                            <Ionicons name="cart" size={18} color={Colors.white} />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },

    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(1,4,9,0.8)',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingBottom: Spacing.sm,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.glass,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    locationText: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationTitle: { ...Typography.labelLarge, color: Colors.white },
    profileBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: Colors.primary,
        overflow: 'hidden',
    },
    avatar: { width: '100%', height: '100%' },

    scrollContent: { paddingTop: 100, paddingBottom: 120 },

    heroSection: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.xl,
    },
    heroTitle: {
        ...Typography.h1,
        color: Colors.white,
        fontSize: 32,
        lineHeight: 38,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        marginTop: Spacing.xl,
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    searchPlaceholder: { ...Typography.bodyMedium, color: Colors.textSecondary, flex: 1 },
    searchCommand: {
        backgroundColor: Colors.card,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    commandText: { ...Typography.caption, color: Colors.textMuted },

    categoriesRow: { paddingHorizontal: Spacing.base, marginBottom: Spacing.xl },

    section: { marginBottom: Spacing['3xl'] },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        marginBottom: Spacing.lg,
    },
    sectionTitle: { ...Typography.h3, color: Colors.white },
    seeAll: { ...Typography.labelMedium, color: Colors.primaryLight },

    featuredList: { paddingHorizontal: Spacing.base },

    promoSection: {
        marginHorizontal: Spacing.base,
        height: 180,
        borderRadius: BorderRadius['3xl'],
        overflow: 'hidden',
        marginBottom: Spacing['3xl'],
    },
    promoImage: { width: '100%', height: '100%' },
    promoContent: {
        position: 'absolute',
        bottom: Spacing.xl,
        left: Spacing.xl,
    },
    promoTitle: { ...Typography.h4, color: Colors.white },
    promoSubtitle: { ...Typography.bodyMedium, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

    storeCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.lg },

    cartBar: {
        position: 'absolute',
        bottom: Spacing.xl,
        left: Spacing.base,
        right: Spacing.base,
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
        ...Shadows.primary,
    },
    cartGradient: {
        padding: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cartInfo: { flex: 1 },
    cartCount: { ...Typography.labelLarge, color: Colors.white },
    cartSub: { ...Typography.caption, color: 'rgba(255,255,255,0.7)' },
    cartAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cartActionText: { ...Typography.labelLarge, color: Colors.white },
});

export default HomeScreen;
