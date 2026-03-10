// ─────────────────────────────────────────────
//  Component: StoreCard
// ─────────────────────────────────────────────
import React, { useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';

const StoreCard = ({ store, onPress, style }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 10 }).start();
    const handlePressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();

    const categoryColor = Colors[store.category] || Colors.primary;

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                style={styles.card}
            >
                {/* Store Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: store.image }} style={styles.image} resizeMode="cover" />
                    <LinearGradient
                        colors={['transparent', 'rgba(15,15,26,0.85)']}
                        style={StyleSheet.absoluteFill}
                    />
                    {/* Offer Badge */}
                    {store.offer && (
                        <View style={styles.offerBadge}>
                            <Text style={styles.offerText}>{store.offer}</Text>
                        </View>
                    )}
                    {/* Open/Closed */}
                    <View style={[styles.statusBadge, { backgroundColor: store.isOpen ? Colors.success : Colors.error }]}>
                        <Text style={styles.statusText}>{store.isOpen ? 'Open' : 'Closed'}</Text>
                    </View>
                </View>

                {/* Store Info */}
                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={10} color={Colors.star} />
                            <Text style={styles.ratingText}>{store.rating}</Text>
                        </View>
                    </View>

                    <Text style={styles.cuisine} numberOfLines={1}>{store.cuisine}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
                            <Text style={styles.metaText}>{store.deliveryTime}</Text>
                        </View>
                        <View style={styles.dot} />
                        <View style={styles.metaItem}>
                            <Ionicons name="bicycle-outline" size={12} color={Colors.textSecondary} />
                            <Text style={styles.metaText}>
                                {store.deliveryFee === 0 ? 'Free Delivery' : `₹${store.deliveryFee} delivery`}
                            </Text>
                        </View>
                        <View style={styles.dot} />
                        <View style={styles.metaItem}>
                            <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                            <Text style={styles.metaText}>{store.distance}</Text>
                        </View>
                    </View>

                    {/* Tags */}
                    {store.tags && store.tags.length > 0 && (
                        <View style={styles.tagsRow}>
                            {store.tags.map(tag => (
                                <View key={tag} style={[styles.tag, { borderColor: categoryColor }]}>
                                    <Text style={[styles.tagText, { color: categoryColor }]}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        ...Shadows.md,
    },
    imageContainer: {
        height: 160,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    offerBadge: {
        position: 'absolute',
        bottom: Spacing.sm,
        left: Spacing.sm,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
    },
    offerText: {
        ...Typography.labelSmall,
        color: Colors.white,
    },
    statusBadge: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: BorderRadius.full,
    },
    statusText: {
        ...Typography.caption,
        color: Colors.white,
        fontWeight: '600',
    },
    info: {
        padding: Spacing.base,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    storeName: {
        ...Typography.h5,
        color: Colors.textPrimary,
        flex: 1,
        marginRight: Spacing.sm,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceLight,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
        gap: 3,
    },
    ratingText: {
        ...Typography.labelSmall,
        color: Colors.star,
    },
    cuisine: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    metaText: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: Colors.textMuted,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: Spacing.xs,
        marginTop: Spacing.sm,
        flexWrap: 'wrap',
    },
    tag: {
        borderWidth: 1,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    tagText: {
        ...Typography.caption,
        fontWeight: '600',
    },
});

export default StoreCard;
