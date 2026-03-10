// ─────────────────────────────────────────────
//  Screen: Store Detail (Swim.ai Premium)
// ─────────────────────────────────────────────
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Image,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    FlatList,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import ProductCard from '../../components/product/ProductCard';
import { MOCK_STORES, MOCK_PRODUCTS } from '../../data/mockData';

const { width: W } = Dimensions.get('window');
const HERO_H = 360;

const StoreDetailScreen = ({ route, navigation }) => {
    const { storeId } = route.params || {};
    const store = MOCK_STORES.find(s => s.id === storeId) || MOCK_STORES[0];
    const products = MOCK_PRODUCTS.filter(p => p.storeId === store.id);

    const scrollY = useRef(new Animated.Value(0)).current;
    const [selectedCategory, setSelectedCategory] = useState(products[0]?.category || 'All');

    const heroScale = scrollY.interpolate({
        inputRange: [-100, 0, 100],
        outputRange: [1.2, 1, 1],
        extrapolate: 'clamp'
    });

    const headerBgOpacity = scrollY.interpolate({
        inputRange: [HERO_H - 120, HERO_H - 60],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* ── Fixed Premium Header ── */}
            <Animated.View style={[styles.fixedHeader, { backgroundColor: Colors.background, opacity: headerBgOpacity }]}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={22} color={Colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{store.name}</Text>
                        <TouchableOpacity style={styles.headerIcon}>
                            <Ionicons name="share-outline" size={22} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Animated.View>

            {/* ── Floating Back Button (for Hero view) ── */}
            <SafeAreaView edges={['top']} style={styles.floatingHeader}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.glassIcon} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={22} color={Colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.glassIcon}>
                        <Ionicons name="heart-outline" size={22} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                stickyHeaderIndices={[2]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 140 }}
            >
                {/* 1. Hero Image Section */}
                <Animated.View style={[styles.hero, { transform: [{ scale: heroScale }] }]}>
                    <Image source={{ uri: store.image }} style={styles.heroImage} />
                    <LinearGradient
                        colors={['transparent', 'rgba(1,4,9,0.7)', Colors.background]}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.heroContent}>
                        <View style={styles.badgeLine}>
                            <View style={styles.goldBadge}>
                                <Ionicons name="star" size={14} color={Colors.star} />
                                <Text style={styles.goldText}>{store.rating}</Text>
                            </View>
                            <Text style={styles.reviewText}>{store.reviewCount} Reviews</Text>
                        </View>
                        <Text style={styles.heroName}>{store.name}</Text>
                        <Text style={styles.heroMeta}>{store.cuisine} • {store.location}</Text>
                    </View>
                </Animated.View>

                {/* 2. Store Specs */}
                <View style={styles.specsRow}>
                    <View style={styles.spec}>
                        <Text style={styles.specVal}>{store.deliveryTime}</Text>
                        <Text style={styles.specLab}>Delivery</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.spec}>
                        <Text style={styles.specVal}>₹{store.minOrder}</Text>
                        <Text style={styles.specLab}>Min. Order</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.spec}>
                        <Text style={styles.specVal}>{store.distance}</Text>
                        <Text style={styles.specLab}>Distance</Text>
                    </View>
                </View>

                {/* 3. Sticky Categories (Indices: [2]) */}
                <View style={styles.categoryContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                        {['Recommended', 'House Specials', 'Popular', 'Trending'].map(cat => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setSelectedCategory(cat)}
                                style={[styles.catItem, selectedCategory === cat && styles.catItemActive]}
                            >
                                <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 4. Products */}
                <View style={styles.productList}>
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            storeId={store.id}
                            storeName={store.name}
                        />
                    ))}
                </View>
            </Animated.ScrollView>

            {/* ── Cart Action ── */}
            <View style={styles.bottomBar}>
                <LinearGradient colors={['rgba(1,4,9,0.8)', 'rgba(1,4,9,1)']} style={styles.bottomBlur}>
                    <TouchableOpacity style={styles.checkoutBtn}>
                        <Text style={styles.checkoutText}>View Selected Items</Text>
                        <View style={styles.checkoutIcon}>
                            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
                        </View>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },

    fixedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
    },
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 15,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        height: 60,
    },
    headerTitle: { ...Typography.h4, color: Colors.white, textAlign: 'center', flex: 1 },
    headerIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    glassIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    hero: { height: HERO_H, width: W, justifyContent: 'flex-end', overflow: 'hidden' },
    heroImage: { ...StyleSheet.absoluteFillObject },
    heroContent: { padding: Spacing.xl, paddingBottom: Spacing.base },
    badgeLine: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.sm },
    goldBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,150,199,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    goldText: { ...Typography.labelSmall, color: Colors.primaryLight, fontWeight: '700' },
    reviewText: { ...Typography.caption, color: Colors.textSecondary },
    heroName: { ...Typography.h1, color: Colors.white, fontSize: 36 },
    heroMeta: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 4 },

    specsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.xl,
        backgroundColor: Colors.surface,
        marginHorizontal: Spacing.base,
        borderRadius: BorderRadius['2xl'],
        marginTop: -Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    spec: { alignItems: 'center' },
    specVal: { ...Typography.h5, color: Colors.white },
    specLab: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
    divider: { width: 1, height: 24, backgroundColor: Colors.border },

    categoryContainer: {
        backgroundColor: Colors.background,
        paddingVertical: Spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    categoryScroll: { paddingHorizontal: Spacing.base },
    catItem: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
        marginRight: 8,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    catItemActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    catText: { ...Typography.labelMedium, color: Colors.textSecondary },
    catTextActive: { color: Colors.white, fontWeight: '700' },

    productList: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.xl,
        paddingBottom: 40,
    },
    bottomBlur: { borderRadius: BorderRadius['2xl'], overflow: 'hidden', borderWidth: 1, borderColor: Colors.glassBorder },
    checkoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    checkoutText: { ...Typography.labelLarge, color: Colors.white },
    checkoutIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});

export default StoreDetailScreen;
