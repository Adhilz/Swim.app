// ─────────────────────────────────────────────
//  Screen: Home
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    StatusBar,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import CategoryPill from '../../components/home/CategoryPill';
import PromoBanner from '../../components/home/PromoBanner';
import StoreCard from '../../components/store/StoreCard';
import { SERVICE_CATEGORIES, MOCK_STORES } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const HomeScreen = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState('food');
    const [searchQuery, setSearchQuery] = useState('');
    const user = useAuthStore(s => s.user);
    const selectedAddress = useAuthStore(s => s.selectedAddress);
    const totalItems = useCartStore(s => s.getTotalItems());

    const filteredStores = MOCK_STORES.filter(
        s => !selectedCategory || s.category === selectedCategory
    );

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.locationRow}
                    onPress={() => navigation.navigate('AddressSelect')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="location" size={18} color={Colors.primary} />
                    <View style={styles.locationText}>
                        <Text style={styles.locationLabel}>Delivering to</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={styles.locationAddress} numberOfLines={1}>
                                {selectedAddress?.addressLine1 || 'Select Location'}
                            </Text>
                            <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
                        <View style={styles.notifDot} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <LinearGradient
                            colors={Colors.primaryGradient}
                            style={styles.avatar}
                        >
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0) || 'U'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Main Scroll ── */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Greeting */}
                <View style={styles.greetingRow}>
                    <View>
                        <Text style={styles.greeting}>{greeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋</Text>
                        <Text style={styles.greetingSub}>What would you like to order?</Text>
                    </View>
                </View>

                {/* ── Search Bar ── */}
                <TouchableOpacity
                    style={styles.searchBar}
                    onPress={() => navigation.navigate('Search')}
                    activeOpacity={0.9}
                >
                    <Ionicons name="search" size={20} color={Colors.textMuted} />
                    <Text style={styles.searchPlaceholder}>Search for food, stores, products...</Text>
                    <View style={styles.filterBtn}>
                        <Ionicons name="options-outline" size={16} color={Colors.primary} />
                    </View>
                </TouchableOpacity>

                {/* ── Service Categories ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Services</Text>
                    </View>
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
                </View>

                {/* ── Promo Banners ── */}
                <View style={styles.section}>
                    <PromoBanner
                        onPress={(banner) =>
                            setSelectedCategory(banner.category)
                        }
                    />
                </View>

                {/* ── Popular Stores ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            {SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Popular'} Near You
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('StoreList', { category: selectedCategory })}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {filteredStores.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="sad-outline" size={48} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>No stores available in this category</Text>
                        </View>
                    ) : (
                        filteredStores.map(store => (
                            <StoreCard
                                key={store.id}
                                store={store}
                                onPress={() => navigation.navigate('StoreDetail', { storeId: store.id })}
                                style={styles.storeCard}
                            />
                        ))
                    )}
                </View>

                {/* ── Quick Reorder ── */}
                <View style={[styles.section, styles.reorderCard]}>
                    <LinearGradient
                        colors={['rgba(244,123,37,0.15)', 'rgba(244,123,37,0.05)']}
                        style={styles.reorderGradient}
                    >
                        <View style={styles.reorderContent}>
                            <Ionicons name="refresh" size={28} color={Colors.primary} />
                            <View style={{ flex: 1, marginLeft: Spacing.base }}>
                                <Text style={styles.reorderTitle}>Quick Reorder</Text>
                                <Text style={styles.reorderSubtitle}>Butter Chicken + Garlic Naan from Spice Garden</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.reorderBtn}
                            onPress={() => navigation.navigate('OrderHistory')}
                        >
                            <Text style={styles.reorderBtnText}>Reorder</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </ScrollView>

            {/* ── Cart FAB ── */}
            {totalItems > 0 && (
                <TouchableOpacity
                    style={styles.cartFab}
                    onPress={() => navigation.navigate('Main', { screen: 'Cart' })}
                >
                    <LinearGradient colors={Colors.primaryGradient} style={styles.cartFabGradient}>
                        <Ionicons name="cart" size={24} color={Colors.white} />
                        <Text style={styles.cartFabText}>{totalItems}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    locationText: { flex: 1 },
    locationLabel: { ...Typography.caption, color: Colors.textMuted },
    locationAddress: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
        maxWidth: 200,
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    iconBtn: { position: 'relative', padding: 4 },
    notifDot: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.error,
        borderWidth: 1.5,
        borderColor: Colors.background,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { ...Typography.labelLarge, color: Colors.white },

    greetingRow: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
    },
    greeting: { ...Typography.h3, color: Colors.textPrimary },
    greetingSub: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 2 },

    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        marginHorizontal: Spacing.base,
        padding: Spacing.md,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.sm,
    },
    searchPlaceholder: { ...Typography.bodyMedium, color: Colors.textMuted, flex: 1 },
    filterBtn: {
        width: 32,
        height: 32,
        backgroundColor: `${Colors.primary}20`,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },

    scrollContent: { paddingBottom: 100 },
    section: { marginBottom: Spacing.xl },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        marginBottom: Spacing.sm,
    },
    sectionTitle: { ...Typography.h4, color: Colors.textPrimary },
    seeAll: { ...Typography.labelMedium, color: Colors.primary },
    categoriesRow: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs },
    storeCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.md },

    emptyState: { alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.sm },
    emptyText: { ...Typography.bodyMedium, color: Colors.textMuted, textAlign: 'center' },

    reorderCard: { marginHorizontal: Spacing.base },
    reorderGradient: { borderRadius: BorderRadius.xl, padding: Spacing.base },
    reorderContent: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    reorderTitle: { ...Typography.labelLarge, color: Colors.textPrimary },
    reorderSubtitle: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
    reorderBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.base,
        alignSelf: 'flex-end',
    },
    reorderBtnText: { ...Typography.labelMedium, color: Colors.white },

    cartFab: {
        position: 'absolute',
        bottom: Spacing['2xl'],
        right: Spacing.base,
        ...Shadows.primary,
    },
    cartFabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        borderRadius: BorderRadius['2xl'],
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
    },
    cartFabText: { ...Typography.labelLarge, color: Colors.white },
});

export default HomeScreen;
