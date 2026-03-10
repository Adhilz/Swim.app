// ─────────────────────────────────────────────
//  Component: ProductCard
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import { useCartStore } from '../../store/cartStore';

const ProductCard = ({ product, storeId, storeName, onCustomize }) => {
    const addItem = useCartStore(s => s.addItem);
    const removeItem = useCartStore(s => s.removeItem);
    const getItemQuantity = useCartStore(s => s.getItemQuantity);

    const quantity = getItemQuantity(product.id);

    const handleAdd = () => addItem(product, storeId, storeName);
    const handleRemove = () => removeItem(product.id);

    return (
        <View style={styles.card}>
            <View style={styles.content}>
                {/* Veg/Non-Veg Indicator */}
                <View style={styles.header}>
                    <View style={[styles.vegIndicator, { borderColor: product.isVeg ? Colors.success : Colors.error }]}>
                        <View style={[styles.vegDot, { backgroundColor: product.isVeg ? Colors.success : Colors.error }]} />
                    </View>
                    {product.isBestseller && (
                        <View style={styles.bestsellerBadge}>
                            <Ionicons name="flame" size={10} color={Colors.primary} />
                            <Text style={styles.bestsellerText}>Bestseller</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.description} numberOfLines={2}>{product.description}</Text>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{product.price}</Text>
                    {product.originalPrice && (
                        <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                    )}
                    {product.originalPrice && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                            </Text>
                        </View>
                    )}
                </View>

                {/* Rating */}
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={11} color={Colors.star} />
                    <Text style={styles.ratingText}>{product.rating}</Text>
                </View>
            </View>

            {/* Right Side: Image + Add Button */}
            <View style={styles.rightSide}>
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
                    {product.customizable && (
                        <Text style={styles.customizable}>Customisable</Text>
                    )}
                </View>

                {/* Quantity Control */}
                {quantity === 0 ? (
                    <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                        <Text style={styles.addBtnText}>ADD</Text>
                        <Ionicons name="add" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.quantityControl}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={handleRemove}>
                            <Ionicons name="remove" size={16} color={Colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={handleAdd}>
                            <Ionicons name="add" size={16} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.base,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    content: {
        flex: 1,
        marginRight: Spacing.base,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    vegIndicator: {
        width: 14,
        height: 14,
        borderWidth: 1.5,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vegDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    bestsellerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(244, 123, 37, 0.15)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    bestsellerText: {
        ...Typography.caption,
        color: Colors.primary,
        fontWeight: '600',
    },
    name: {
        ...Typography.h5,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    description: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        lineHeight: 18,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: 4,
    },
    price: {
        ...Typography.h5,
        color: Colors.textPrimary,
    },
    originalPrice: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: BorderRadius.xs,
    },
    discountText: {
        ...Typography.caption,
        color: Colors.success,
        fontWeight: '600',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    ratingText: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    rightSide: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    imageWrapper: {
        width: 110,
        height: 90,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    customizable: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        ...Typography.caption,
        color: Colors.textSecondary,
        paddingVertical: 2,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.card,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        gap: 4,
        width: 100,
        ...Shadows.sm,
    },
    addBtnText: {
        ...Typography.labelMedium,
        color: Colors.primary,
        letterSpacing: 1,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        width: 100,
        justifyContent: 'space-between',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
    },
    qtyBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
    },
    qtyText: {
        ...Typography.labelLarge,
        color: Colors.white,
        minWidth: 20,
        textAlign: 'center',
    },
});

export default ProductCard;
