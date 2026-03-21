import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import ProductCard from '../../components/product/ProductCard';
import { useCartStore } from '../../store/cartStore';
import { useDataStore } from '../../store/dataStore';

const StoreDetailScreen = ({ route, navigation }) => {
    const { storeId } = route.params;
    const stores = useDataStore(state => state.stores);
    const products = useDataStore(state => state.products);
    const totalItems = useCartStore(state => state.getTotalItems());
    const cartTotal = useCartStore(state => state.getTotal());
    const store = useMemo(() => stores.find(item => item.id === storeId), [stores, storeId]);
    const storeProducts = useMemo(() => products.filter(item => item.storeId === storeId), [products, storeId]);
    const categories = useMemo(() => ['All', ...new Set(storeProducts.map(item => item.category).filter(Boolean))], [storeProducts]);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredProducts = selectedCategory === 'All'
        ? storeProducts
        : storeProducts.filter(item => item.category === selectedCategory);

    if (!store) {
        return (
            <SafeAreaView style={styles.safe}>
                <Text style={styles.missingText}>Store not found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.safe}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.hero}>
                    <Image
                        source={typeof store.image === 'string' ? { uri: store.image } : store.image}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.heroOverlay} />
                    <SafeAreaView edges={['top']} style={styles.heroSafe}>
                        <View style={styles.heroHeader}>
                            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                                <Ionicons name="arrow-back" size={20} color={Colors.white} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="heart-outline" size={20} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                    <View style={styles.heroCopy}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={13} color={Colors.star} />
                            <Text style={styles.ratingText}>{store.rating}</Text>
                            <Text style={styles.reviewText}>{store.reviewCount} reviews</Text>
                        </View>
                        <Text style={styles.heroTitle}>{store.name}</Text>
                        <Text style={styles.heroMeta}>{store.cuisine} · {store.location}</Text>
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{store.deliveryTime}</Text>
                        <Text style={styles.summaryLabel}>Delivery</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>Rs {store.minOrder}</Text>
                        <Text style={styles.summaryLabel}>Min order</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{store.distance}</Text>
                        <Text style={styles.summaryLabel}>Distance</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Browse the menu</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                        {categories.map(category => (
                            <TouchableOpacity
                                key={category}
                                style={[styles.categoryPill, selectedCategory === category && styles.categoryPillActive]}
                                onPress={() => setSelectedCategory(category)}
                            >
                                <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            storeId={store.id}
                            storeName={store.name}
                        />
                    ))}
                </View>
            </ScrollView>

            {totalItems > 0 ? (
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('Cart')}>
                        <View>
                            <Text style={styles.bottomTitle}>{totalItems} items selected</Text>
                            <Text style={styles.bottomSubtitle}>Rs {cartTotal} · View cart and checkout</Text>
                        </View>
                        <View style={styles.bottomArrow}>
                            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
                        </View>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        paddingBottom: 132,
    },
    hero: {
        height: 360,
        justifyContent: 'space-between',
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(36,26,18,0.24)',
    },
    heroSafe: {
        paddingHorizontal: Spacing.base,
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Spacing.sm,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroCopy: {
        paddingHorizontal: Spacing.base,
        paddingBottom: Spacing.xl,
    },
    ratingBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.84)',
        borderRadius: BorderRadius.full,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: Spacing.sm,
    },
    ratingText: {
        ...Typography.labelSmall,
        color: Colors.textPrimary,
    },
    reviewText: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    heroTitle: {
        ...Typography.h1,
        color: Colors.white,
    },
    heroMeta: {
        ...Typography.bodyMedium,
        color: 'rgba(255,255,255,0.86)',
        marginTop: 4,
    },
    summaryCard: {
        marginHorizontal: Spacing.base,
        marginTop: -24,
        backgroundColor: 'rgba(255,255,255,0.86)',
        borderRadius: BorderRadius['2xl'],
        flexDirection: 'row',
        paddingVertical: Spacing.base,
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 8,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
    },
    summaryLabel: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: Colors.border,
    },
    section: {
        paddingHorizontal: Spacing.base,
        marginTop: Spacing.xl,
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
        marginBottom: Spacing.base,
    },
    categoryRow: {
        paddingRight: Spacing.base,
    },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(255,255,255,0.82)',
        marginRight: 8,
    },
    categoryPillActive: {
        backgroundColor: Colors.primaryLight,
    },
    categoryText: {
        ...Typography.labelMedium,
        color: Colors.textSecondary,
    },
    categoryTextActive: {
        color: Colors.primaryDark,
    },
    bottomBar: {
        position: 'absolute',
        left: Spacing.base,
        right: Spacing.base,
        bottom: 104,
    },
    bottomButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius['2xl'],
        paddingHorizontal: Spacing.base,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.24,
        shadowRadius: 18,
        elevation: 10,
    },
    bottomTitle: {
        ...Typography.labelLarge,
        color: Colors.white,
    },
    bottomSubtitle: {
        ...Typography.caption,
        color: 'rgba(255,255,255,0.82)',
        marginTop: 4,
    },
    bottomArrow: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    missingText: {
        ...Typography.bodyLarge,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginTop: 60,
    },
});

export default StoreDetailScreen;
