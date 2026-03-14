import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

const formatDeliveryFee = fee => (fee === 0 ? 'Free Delivery' : `Rs ${fee} fee`);

const StoreCard = ({ store, onPress, style }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={[styles.card, style]}>
            <Image
                source={typeof store.image === 'string' ? { uri: store.image } : store.image}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <View style={styles.titleWrap}>
                        <Text style={styles.name} numberOfLines={1}>{store.name}</Text>
                        <Text style={styles.location} numberOfLines={1}>{store.cuisine} · {store.location}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color={Colors.star} />
                        <Text style={styles.ratingText}>{store.rating}</Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={13} color={Colors.primary} />
                        <Text style={styles.metaText}>{store.deliveryTime}</Text>
                    </View>
                    <Text style={styles.dot}>·</Text>
                    <Text style={styles.metaText}>{formatDeliveryFee(store.deliveryFee)}</Text>
                </View>

                {store.offer ? (
                    <View style={styles.offerPill}>
                        <Text style={styles.offerText}>{store.offer}</Text>
                    </View>
                ) : null}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255,255,255,0.82)',
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 8,
    },
    image: {
        width: '100%',
        height: 164,
    },
    content: {
        padding: Spacing.base,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    titleWrap: {
        flex: 1,
    },
    name: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    location: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF4DF',
        borderRadius: BorderRadius.full,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingText: {
        ...Typography.labelSmall,
        color: Colors.textPrimary,
    },
    metaRow: {
        marginTop: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    dot: {
        marginHorizontal: 6,
        color: Colors.textMuted,
    },
    offerPill: {
        alignSelf: 'flex-start',
        marginTop: Spacing.sm,
        backgroundColor: '#FDF0E1',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
    },
    offerText: {
        ...Typography.labelSmall,
        color: Colors.primaryDark,
    },
});

export default StoreCard;
