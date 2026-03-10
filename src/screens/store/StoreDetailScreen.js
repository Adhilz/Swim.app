// ─────────────────────────────────────────────
//  Screen: Store Detail
// ─────────────────────────────────────────────
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    FlatList,
    StatusBar,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import ProductCard from '../../components/product/ProductCard';
import CartBar from '../../components/cart/CartBar';
import { MOCK_STORES, MOCK_PRODUCTS } from '../../data/mockData';

const { width: W } = Dimensions.get('window');
const HERO_HEIGHT = 260;
const CATEGORIES = ['Recommended', 'Starters', 'Mains', 'Desserts', 'Drinks'];

const StoreDetailScreen = ({ route, navigation }) => {
    const { storeId } = route.params || {};
    const store = MOCK_STORES.find(s => s.id === storeId) || MOCK_STORES[0];
    const products = MOCK_PRODUCTS.filter(p => p.storeId === store.id);

    const [selectedCategory, setSelectedCategory] = useState('Recommended');
    const [isFavorite, setIsFavorite] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const headerOpacity = scrollY.interpolate({
        inputRange: [HERO_HEIGHT - 80, HERO_HEIGHT - 40],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const heroScale = scrollY.interpolate({
        inputRange: [-100, 0],
        outputRange: [1.2, 1],
        extrapolate: 'clamp',
    });

    // Show all for "Recommended", filter otherwise
    const displayedProducts =
        selectedCategory === 'Recommended'
            ? products.filter(p => p.isBestseller)
            : products.filter(p => p.category === selectedCategory);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* ── Animated Header ── */}
            <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
                <LinearGradient
                    colors={[Colors.background, Colors.background]}
                    style={styles.animatedHeaderGradient}
                >
                    <SafeAreaView edges={['top']}>
                        <View style={styles.animatedHeaderContent}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                                <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                            </TouchableOpacity>
                            <Text style={styles.animatedHeaderTitle} numberOfLines={1}>{store.name}</Text>
                            <TouchableOpacity style={styles.headerBtn} onPress={() => setIsFavorite(!isFavorite)}>
                                <Ionicons
                                    name={isFavorite ? 'heart' : 'heart-outline'}
                                    size={22}
                                    color={isFavorite ? Colors.error : Colors.textPrimary}
                                />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </Animated.View>

            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* ── Hero Image ── */}
                <Animated.View style={[styles.heroContainer, { transform: [{ scale: heroScale }] }]}>
                    <Image source={{ uri: store.image }} style={styles.heroImage} resizeMode="cover" />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', Colors.background]}
                        style={StyleSheet.absoluteFill}
                    />
                    {/* Overlay Controls */}
                    <SafeAreaView edges={['top']} style={styles.heroOverlay}>
                        <View style={styles.heroActions}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.overlayBtn}>
                                <Ionicons name="arrow-back" size={20} color={Colors.white} />
                            </TouchableOpacity>
                            <View style={styles.heroActionsRight}>
                                <TouchableOpacity style={styles.overlayBtn}>
                                    <Ionicons name="share-social-outline" size={20} color={Colors.white} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.overlayBtn} onPress={() => setIsFavorite(!isFavorite)}>
                                    <Ionicons
                                        name={isFavorite ? 'heart' : 'heart-outline'}
                                        size={20}
                                        color={isFavorite ? Colors.error : Colors.white}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>
                </Animated.View>

                {/* ── Store Info ── */}
                <View style={styles.storeInfo}>
                    <View style={styles.storeNameRow}>
                        <Text style={styles.storeName}>{store.name}</Text>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color={Colors.star} />
                            <Text style={styles.ratingText}>{store.rating}</Text>
                            <Text style={styles.reviewCount}>({store.reviewCount})</Text>
                        </View>
                    </View>

                    <Text style={styles.cuisine}>{store.cuisine}</Text>

                    {/* Status + Meta */}
                    <View style={styles.metaRow}>
                        <View style={[styles.statusChip, { backgroundColor: store.isOpen ? `${Colors.success}20` : `${Colors.error}20` }]}>
                            <View style={[styles.statusDot, { backgroundColor: store.isOpen ? Colors.success : Colors.error }]} />
                            <Text style={[styles.statusText, { color: store.isOpen ? Colors.success : Colors.error }]}>
                                {store.isOpen ? 'Open Now' : 'Closed'}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.metaText}>{store.deliveryTime}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="bicycle-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.metaText}>
                                {store.deliveryFee === 0 ? 'Free Delivery' : `₹${store.deliveryFee}`}
                            </Text>
                        </View>
                    </View>

                    {/* Offer */}
                    {store.offer && (
                        <View style={styles.offerRow}>
                            <Ionicons name="pricetag" size={14} color={Colors.primary} />
                            <Text style={styles.offerText}>{store.offer}</Text>
                        </View>
                    )}
                </View>

                {/* ── Category Tabs ── */}
                <View style={styles.tabsWrapper}>
                    <FlatList
                        data={CATEGORIES}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={i => i}
                        contentContainerStyle={styles.tabsList}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => setSelectedCategory(item)}
                                style={[styles.tab, selectedCategory === item && styles.tabActive]}
                            >
                                <Text style={[styles.tabText, selectedCategory === item && styles.tabTextActive]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* ── Products ── */}
                <View style={styles.productsSection}>
                    {(displayedProducts.length > 0 ? displayedProducts : products).map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            storeId={store.id}
                            storeName={store.name}
                        />
                    ))}

                    {/* Pharmacy prescription upload */}
                    {store.category === 'pharmacy' && (
                        <TouchableOpacity style={styles.prescriptionCard}>
                            <LinearGradient
                                colors={[`${Colors.pharmacy}20`, `${Colors.pharmacy}08`]}
                                style={styles.prescriptionGradient}
                            >
                                <Ionicons name="document-attach" size={28} color={Colors.pharmacy} />
                                <View style={{ flex: 1, marginLeft: Spacing.base }}>
                                    <Text style={styles.prescriptionTitle}>Upload Prescription</Text>
                                    <Text style={styles.prescriptionSub}>Get medicines as per your doctor's prescription</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={Colors.pharmacy} />
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.ScrollView>

            {/* ── Sticky Cart Bar ── */}
            <CartBar onPress={() => navigation.navigate('Main', { screen: 'Cart' })} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    animatedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    animatedHeaderGradient: { paddingBottom: Spacing.sm },
    animatedHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
    },
    animatedHeaderTitle: { ...Typography.h5, color: Colors.textPrimary, flex: 1, textAlign: 'center' },
    headerBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },

    heroContainer: { height: HERO_HEIGHT, overflow: 'hidden' },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
    heroActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
    },
    heroActionsRight: { flexDirection: 'row', gap: Spacing.sm },
    overlayBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    storeInfo: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.base,
    },
    storeNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    storeName: { ...Typography.h2, color: Colors.textPrimary, flex: 1 },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.md,
    },
    ratingText: { ...Typography.labelMedium, color: Colors.star },
    reviewCount: { ...Typography.caption, color: Colors.textMuted },
    cuisine: { ...Typography.bodyMedium, color: Colors.textSecondary, marginBottom: Spacing.sm },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.sm },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { ...Typography.labelSmall },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { ...Typography.bodySmall, color: Colors.textSecondary },
    offerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: `${Colors.primary}15`,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
        alignSelf: 'flex-start',
    },
    offerText: { ...Typography.labelSmall, color: Colors.primary },

    tabsWrapper: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.sm,
    },
    tabsList: { paddingHorizontal: Spacing.base },
    tab: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.base,
        marginRight: 4,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: Colors.primary },
    tabText: { ...Typography.labelMedium, color: Colors.textSecondary },
    tabTextActive: { color: Colors.primary },

    productsSection: { paddingHorizontal: Spacing.base },
    prescriptionCard: { marginTop: Spacing.sm, borderRadius: BorderRadius.xl, overflow: 'hidden' },
    prescriptionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.base,
    },
    prescriptionTitle: { ...Typography.labelLarge, color: Colors.textPrimary },
    prescriptionSub: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
});

export default StoreDetailScreen;
