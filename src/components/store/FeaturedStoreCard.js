// ─────────────────────────────────────────────
//  Component: FeaturedStoreCard (Swim.ai Premium)
// ─────────────────────────────────────────────
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

const { width: W } = Dimensions.get('window');
const CARD_W = W * 0.75;
const CARD_H = 340;

const FeaturedStoreCard = ({ store, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={styles.container}
        >
            <View style={styles.card}>
                <Image
                    source={typeof store.image === 'string' ? { uri: store.image } : store.image}
                    style={styles.image}
                    resizeMode="cover"
                />

                <LinearGradient
                    colors={['transparent', 'rgba(4,4,10,0.95)', '#04040A']}
                    locations={[0, 0.7, 1]}
                    style={styles.overlay}
                />

                <View style={styles.content}>
                    <View style={styles.badgeRow}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color={Colors.star} />
                            <Text style={styles.ratingText}>{store.rating}</Text>
                        </View>
                        {store.tags?.[0] && (
                            <View style={styles.tagBadge}>
                                <Text style={styles.tagText}>{store.tags[0]}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.name}>{store.name}</Text>
                    <Text style={styles.location}>{store.location}</Text>

                    <View style={styles.footer}>
                        <View style={styles.meta}>
                            <Ionicons name="time" size={14} color={Colors.primaryLight} />
                            <Text style={styles.metaText}>{store.deliveryTime}</Text>
                        </View>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_W,
        marginRight: Spacing.base,
        height: CARD_H,
    },
    card: {
        flex: 1,
        borderRadius: BorderRadius['3xl'],
        overflow: 'hidden',
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
    },
    content: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.xl,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    ratingText: {
        ...Typography.labelSmall,
        color: Colors.white,
    },
    tagBadge: {
        backgroundColor: 'rgba(0,150,199,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    tagText: {
        ...Typography.labelSmall,
        color: Colors.primaryLight,
        fontWeight: '700',
    },
    name: {
        ...Typography.h2,
        color: Colors.white,
        fontSize: 24,
    },
    location: {
        ...Typography.bodyMedium,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        ...Typography.labelMedium,
        color: Colors.white,
    },
    actionBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default FeaturedStoreCard;
