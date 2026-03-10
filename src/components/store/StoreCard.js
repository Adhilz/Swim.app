// ─────────────────────────────────────────────
//  Component: StoreCard (Swim.ai Premium)
// ─────────────────────────────────────────────
import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

const StoreCard = ({ store, onPress, style }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={[styles.card, style]}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: store.image }} style={styles.image} resizeMode="cover" />
                <LinearGradient
                    colors={['transparent', 'rgba(1,4,9,0.85)']}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.statusBadge}>
                    <View style={[styles.dot, { backgroundColor: store.isOpen ? Colors.success : Colors.error }]} />
                    <Text style={styles.statusText}>{store.isOpen ? 'Open' : 'Closed'}</Text>
                </View>
                {store.offer && (
                    <View style={styles.offerTag}>
                        <Text style={styles.offerText}>{store.offer}</Text>
                    </View>
                )}
            </View>

            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{store.name}</Text>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color={Colors.star} />
                        <Text style={styles.ratingText}>{store.rating}</Text>
                    </View>
                </View>
                <Text style={styles.location} numberOfLines={1}>{store.cuisine} • {store.location}</Text>

                <View style={styles.meta}>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.metaText}>{store.deliveryTime}</Text>
                    </View>
                    <View style={styles.sep} />
                    <View style={styles.metaItem}>
                        <Ionicons name="bicycle-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.metaText}>₹{store.deliveryFee} fee</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    imageContainer: { height: 160, position: 'relative' },
    image: { width: '100%', height: '100%' },
    statusBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(1,4,9,0.7)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: BorderRadius.full,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { ...Typography.labelSmall, color: Colors.white, fontSize: 10 },
    offerTag: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    offerText: { ...Typography.labelSmall, color: Colors.white },

    info: { padding: Spacing.lg },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    name: { ...Typography.h4, color: Colors.white, flex: 1, marginRight: 8 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { ...Typography.labelSmall, color: Colors.star },
    location: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 12 },

    meta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { ...Typography.caption, color: Colors.textMuted },
    sep: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textMuted },
});

export default StoreCard;
