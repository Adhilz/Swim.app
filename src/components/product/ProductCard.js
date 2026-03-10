// ─────────────────────────────────────────────
//  Component: ProductCard (Swim.ai Premium)
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import { useCartStore } from '../../store/cartStore';

const ProductCard = ({ product, storeId, storeName }) => {
    const addItem = useCartStore(s => s.addItem);
    const removeItem = useCartStore(s => s.removeItem);
    const getItemQuantity = useCartStore(s => s.getItemQuantity);

    const quantity = getItemQuantity(product.id);

    return (
        <View style={styles.card}>
            {/* Header: Visuals */}
            <View style={styles.visuals}>
                <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
                <View style={styles.overlay}>
                    {product.isBestseller && (
                        <View style={styles.badge}>
                            <Ionicons name="sparkles" size={10} color={Colors.star} />
                            <Text style={styles.badgeText}>Top Choice</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Content: Info */}
            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.price}>₹{product.price}</Text>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {product.description}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={12} color={Colors.star} />
                        <Text style={styles.ratingText}>{product.rating}</Text>
                    </View>

                    {quantity === 0 ? (
                        <TouchableOpacity style={styles.addBtn} onPress={() => addItem(product, storeId, storeName)}>
                            <Text style={styles.addBtnText}>Collect</Text>
                            <Ionicons name="add" size={16} color={Colors.white} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.quantityPicker}>
                            <TouchableOpacity onPress={() => removeItem(product.id)} style={styles.qtyBtn}>
                                <Ionicons name="remove" size={16} color={Colors.white} />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{quantity}</Text>
                            <TouchableOpacity onPress={() => addItem(product, storeId, storeName)} style={styles.qtyBtn}>
                                <Ionicons name="add" size={16} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius['2xl'],
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        overflow: 'hidden',
    },
    visuals: {
        height: 140,
        backgroundColor: Colors.card,
    },
    image: { width: '100%', height: '100%' },
    overlay: {
        position: 'absolute',
        top: 12,
        left: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(1,4,9,0.7)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    badgeText: { ...Typography.labelSmall, color: Colors.white, fontSize: 10 },

    info: { padding: Spacing.lg },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    name: { ...Typography.h5, color: Colors.white, flex: 1, marginRight: 8 },
    price: { ...Typography.h5, color: Colors.primaryLight },

    description: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 18 },

    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { ...Typography.caption, color: Colors.textMuted },

    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
        gap: 4,
    },
    addBtnText: { ...Typography.labelMedium, color: Colors.white },

    quantityPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryDark,
        borderRadius: BorderRadius.full,
        paddingHorizontal: 4,
        paddingVertical: 4,
        gap: 12,
    },
    qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    qtyText: { ...Typography.labelLarge, color: Colors.white, minWidth: 16, textAlign: 'center' },
});

export default ProductCard;
