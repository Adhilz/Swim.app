// ─────────────────────────────────────────────
//  Component: CartBar – Sticky bottom bar
// ─────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import { useCartStore } from '../../store/cartStore';

const CartBar = ({ onPress }) => {
    const totalItems = useCartStore(s => s.getTotalItems());
    const total = useCartStore(s => s.getTotal());
    const slideAnim = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: totalItems > 0 ? 0 : 100,
            useNativeDriver: true,
            tension: 200,
            friction: 20,
        }).start();
    }, [totalItems]);

    if (totalItems === 0) return null;

    return (
        <Animated.View
            style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
        >
            <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
                <LinearGradient
                    colors={Colors.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.bar}
                >
                    <View style={styles.left}>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{totalItems}</Text>
                        </View>
                        <Text style={styles.label}>View Cart</Text>
                    </View>
                    <View style={styles.right}>
                        <Text style={styles.total}>₹{total}</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.white} />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.base,
        paddingBottom: Spacing['2xl'],
        paddingTop: Spacing.sm,
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        ...Shadows.primary,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countText: {
        ...Typography.labelMedium,
        color: Colors.white,
    },
    label: {
        ...Typography.h5,
        color: Colors.white,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    total: {
        ...Typography.h5,
        color: Colors.white,
    },
});

export default CartBar;
