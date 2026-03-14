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
import { MaterialIcons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../../theme';
import { useDataStore } from '../../store/dataStore';

const CATEGORY_CARDS = [
    {
        id: 'food',
        title: 'Food',
        icon: 'restaurant',
        storeCategory: 'food',
        tint: '#FEF0E2',
        iconTint: '#F48C25',
        textColor: '#9A5613',
    },
    {
        id: 'grocery',
        title: 'Groceries',
        icon: 'shopping-basket',
        storeCategory: 'lifestyle',
        tint: '#E8F4E2',
        iconTint: '#4C9A45',
        textColor: '#2F6A2A',
    },
    {
        id: 'pharmacy',
        title: 'Pharmacy',
        icon: 'medical-services',
        storeCategory: 'pharmacy',
        tint: '#E8F1FF',
        iconTint: '#4D8EDE',
        textColor: '#305F9D',
    },
    {
        id: 'shopping',
        title: 'Clothes',
        icon: 'checkroom',
        storeCategory: 'shopping',
        tint: '#F4E9FF',
        iconTint: '#9A60DD',
        textColor: '#6B3E9F',
    },
    {
        id: 'electronics',
        title: 'Electronics',
        icon: 'devices',
        storeCategory: 'lifestyle',
        tint: '#EFF1F4',
        iconTint: '#566270',
        textColor: '#273240',
        subtitle: 'Gadgets, accessories & more',
        featured: true,
    },
];

const getImageSource = image => (typeof image === 'string' ? { uri: image } : image);

const SearchScreen = ({ navigation, route }) => {
    const inputRef = useRef(null);
    const stores = useDataStore(state => state.stores);
    const isLoading = useDataStore(state => state.isLoading);
    const error = useDataStore(state => state.error);
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(route?.params?.initialCategory || 'food');

    const visibleStores = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const selectedCard = CATEGORY_CARDS.find(card => card.id === selectedCategory);

        return stores
            .filter(store => {
                const categoryMatch = selectedCard ? store.category === selectedCard.storeCategory : true;
                const queryMatch = !normalizedQuery
                    || store.name.toLowerCase().includes(normalizedQuery)
                    || store.cuisine.toLowerCase().includes(normalizedQuery)
                    || store.location.toLowerCase().includes(normalizedQuery);

                return categoryMatch && queryMatch;
            })
            .slice(0, 6);
    }, [query, selectedCategory, stores]);

    const fallbackStores = useMemo(() => stores.slice(0, 6), [stores]);
    const displayStores = visibleStores.length > 0 ? visibleStores : fallbackStores;

    const handleCategoryPress = categoryId => {
        setSelectedCategory(categoryId);
        setQuery('');
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={22} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Browse Categories</Text>
                <TouchableOpacity style={styles.headerButton} onPress={() => inputRef.current?.focus()}>
                    <MaterialIcons name="search" size={22} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroBlock}>
                    <Text style={styles.heroTitle}>
                        What do you{'\n'}
                        <Text style={styles.heroAccent}>need today?</Text>
                    </Text>
                    <Text style={styles.heroSubtitle}>Fast delivery to your doorstep.</Text>
                </View>

                <View style={styles.searchShell}>
                    <MaterialIcons name="search" size={20} color={Colors.textMuted} />
                    <TextInput
                        ref={inputRef}
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search stores, cuisines, locations..."
                        placeholderTextColor={Colors.textMuted}
                        style={styles.searchInput}
                    />
                </View>

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
                                <View style={[styles.categoryIconWrap, { backgroundColor: `${card.iconTint}22` }]}>
                                    <MaterialIcons name={card.icon} size={40} color={card.iconTint} />
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
                                <View style={[styles.categoryIconWrapLarge, { backgroundColor: '#DDE1E7' }]}>
                                    <MaterialIcons name={card.icon} size={40} color={card.iconTint} />
                                </View>
                                <View style={styles.featuredCategoryCopy}>
                                    <Text style={[styles.featuredCategoryTitle, { color: card.textColor }]}>{card.title}</Text>
                                    <Text style={styles.featuredCategorySubtitle}>{card.subtitle}</Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        );
                    })}
                </View>

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
                    <MaterialIcons name="local-shipping" size={106} color="rgba(255,255,255,0.28)" style={styles.promoTruck} />
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Available Stores</Text>
                    <Text style={styles.sectionCount}>{displayStores.length} showing</Text>
                </View>

                {displayStores.map(store => (
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
                            <Text style={styles.storeRating}>{store.rating}</Text>
                            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
                        </View>
                    </TouchableOpacity>
                ))}

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
        backgroundColor: 'rgba(255,255,255,0.86)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 8,
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
        height: 56,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.base,
        marginBottom: Spacing.xl,
        backgroundColor: 'rgba(255,255,255,0.82)',
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
        elevation: 7,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
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
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 7, height: 7 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 7,
    },
    categoryCardActive: {
        borderWidth: 1.5,
        borderColor: 'rgba(244,140,37,0.35)',
    },
    categoryIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.base,
    },
    categoryTitle: {
        ...Typography.h4,
    },
    featuredCategoryCard: {
        width: '100%',
        borderRadius: BorderRadius.xl,
        padding: Spacing.base,
        backgroundColor: '#EFF1F4',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 7, height: 7 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 7,
    },
    categoryIconWrapLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.base,
    },
    featuredCategoryCopy: {
        flex: 1,
    },
    featuredCategoryTitle: {
        ...Typography.h3,
    },
    featuredCategorySubtitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    promoCard: {
        marginTop: Spacing.xl,
        borderRadius: BorderRadius.xl,
        minHeight: 160,
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
    },
    sectionCount: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    storeCard: {
        backgroundColor: 'rgba(255,255,255,0.86)',
        borderRadius: BorderRadius.xl,
        padding: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
        elevation: 7,
    },
    storeImage: {
        width: 78,
        height: 78,
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
    storeRating: {
        ...Typography.labelMedium,
        color: Colors.textPrimary,
        fontWeight: '800',
    },
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
