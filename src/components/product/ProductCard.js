import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { useCartStore } from '../../store/cartStore';

const ProductCard = ({ product, storeId, storeName }) => {
    const addItem = useCartStore(state => state.addItem);
    const removeItem = useCartStore(state => state.removeItem);
    const getItemQuantity = useCartStore(state => state.getItemQuantity);
    const quantity = getItemQuantity(product.id);

    return (
        <View style={styles.card}>
            <Image
                source={typeof product.image === 'string' ? { uri: product.image } : product.image}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.price}>Rs {product.price}</Text>
                </View>
                <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
                <View style={styles.footer}>
                    <View style={styles.ratingWrap}>
                        <Ionicons name="star" size={12} color={Colors.star} />
                        <Text style={styles.ratingText}>{product.rating}</Text>
                    </View>

                    {quantity === 0 ? (
                        <TouchableOpacity style={styles.addButton} onPress={() => addItem(product, storeId, storeName)}>
                            <Text style={styles.addButtonText}>Add</Text>
                            <Ionicons name="add" size={16} color={Colors.white} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.counter}>
                            <TouchableOpacity style={styles.counterBtn} onPress={() => removeItem(product.id)}>
                                <Ionicons name="remove" size={16} color={Colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.counterText}>{quantity}</Text>
                            <TouchableOpacity style={styles.counterBtn} onPress={() => addItem(product, storeId, storeName)}>
                                <Ionicons name="add" size={16} color={Colors.primary} />
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
        backgroundColor: 'rgba(255,255,255,0.82)',
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
        marginBottom: Spacing.base,
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 8,
    },
    image: {
        width: '100%',
        height: 158,
    },
    content: {
        padding: Spacing.base,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    name: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
        flex: 1,
    },
    price: {
        ...Typography.labelLarge,
        color: Colors.primary,
    },
    description: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginTop: 6,
    },
    footer: {
        marginTop: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ratingWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
    },
    addButtonText: {
        ...Typography.labelMedium,
        color: Colors.white,
    },
    counter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
    },
    counterBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterText: {
        ...Typography.labelMedium,
        color: Colors.textPrimary,
        minWidth: 18,
        textAlign: 'center',
    },
});

export default ProductCard;
