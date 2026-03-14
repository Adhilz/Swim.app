import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.74;

const FeaturedStoreCard = ({ store, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={styles.container}>
            <Image
                source={typeof store.image === 'string' ? { uri: store.image } : store.image}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.overlay} />
            <View style={styles.content}>
                <View style={styles.badgeRow}>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color={Colors.star} />
                        <Text style={styles.badgeText}>{store.rating}</Text>
                    </View>
                    {store.tags?.[0] ? (
                        <View style={styles.tagBadge}>
                            <Text style={styles.tagText}>{store.tags[0]}</Text>
                        </View>
                    ) : null}
                </View>
                <Text style={styles.name}>{store.name}</Text>
                <Text style={styles.meta}>{store.location}</Text>
                <View style={styles.footer}>
                    <Text style={styles.time}>{store.deliveryTime}</Text>
                    <View style={styles.action}>
                        <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: cardWidth,
        height: 324,
        marginRight: Spacing.base,
        borderRadius: BorderRadius['3xl'],
        overflow: 'hidden',
        backgroundColor: Colors.card,
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 9,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(36,26,18,0.18)',
    },
    content: {
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: 18,
        backgroundColor: 'rgba(255,255,255,0.86)',
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.base,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
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
    badgeText: {
        ...Typography.labelSmall,
        color: Colors.textPrimary,
    },
    tagBadge: {
        backgroundColor: '#FDF0E1',
        borderRadius: BorderRadius.full,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    tagText: {
        ...Typography.labelSmall,
        color: Colors.primaryDark,
    },
    name: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    meta: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    footer: {
        marginTop: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    time: {
        ...Typography.labelMedium,
        color: Colors.primary,
    },
    action: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF4DF',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default FeaturedStoreCard;
