import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import AppButton from '../../components/common/AppButton';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { PAYMENT_METHODS } from '../../data/mockData';
import { supabase } from '../../lib/supabase';
import { useToastStore } from '../../store/toastStore';

const formatCurrency = value => `Rs ${value}`;
const getImageSource = image => (typeof image === 'string' ? { uri: image } : image);

const CartScreen = ({ navigation }) => {
    const items = useCartStore(state => state.items);
    const storeId = useCartStore(state => state.storeId);
    const storeName = useCartStore(state => state.storeName);
    const addItem = useCartStore(state => state.addItem);
    const removeItem = useCartStore(state => state.removeItem);
    const clearCart = useCartStore(state => state.clearCart);
    const getSubtotal = useCartStore(state => state.getSubtotal);
    const getDeliveryFee = useCartStore(state => state.getDeliveryFee);
    const getTaxes = useCartStore(state => state.getTaxes);
    const applyPromo = useCartStore(state => state.applyPromo);
    const selectedAddress = useAuthStore(state => state.selectedAddress);
    const user = useAuthStore(state => state.user);
    const showToast = useToastStore(state => state.showToast);

    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState('upi');
    const [placingOrder, setPlacingOrder] = useState(false);

    const subtotal = getSubtotal();
    const deliveryFee = appliedPromo?.freeDelivery ? 0 : getDeliveryFee();
    const serviceFee = getTaxes();
    const discount = appliedPromo
        ? Math.min(Math.round(subtotal * appliedPromo.discount), appliedPromo.maxDiscount)
        : 0;
    const total = subtotal + deliveryFee + serviceFee - discount;

    const handleApplyPromo = () => {
        const normalizedCode = promoCode.trim().toUpperCase();
        const promo = applyPromo(normalizedCode);

        if (!promo) {
            Alert.alert('Invalid Code', 'The promo code you entered is invalid or expired.');
            return;
        }

        setPromoCode(normalizedCode);
        setAppliedPromo({ code: normalizedCode, ...promo });
    };

    const handlePlaceOrder = async () => {
        if (!user?.id) {
            Alert.alert('Sign In Required', 'Please sign in before placing an order.');
            return;
        }

        if (!storeId || items.length === 0) {
            Alert.alert('Cart Error', 'Your cart is empty or missing store information.');
            return;
        }

        if (!selectedAddress) {
            Alert.alert('Address Required', 'Please add a delivery address before checkout.');
            return;
        }

        setPlacingOrder(true);

        try {
            const { data, error } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    store_id: storeId,
                    total_amount: total,
                    status: 'Pending',
                    items,
                    delivery_address: selectedAddress,
                }])
                .select('*')
                .single();

            if (error) {
                throw error;
            }

            clearCart();
            navigation.replace('OrderTracking', {
                orderId: data?.id ? String(data.id) : `ORD${Date.now()}`,
            });
        } catch (error) {
            if (error?.message?.includes('payment_method')) {
                showToast({
                    type: 'error',
                    title: 'Schema mismatch',
                    message: 'The orders table does not include payment_method. Checkout now skips that field.',
                });
            }
            Alert.alert('Order Failed', error.message || 'Something went wrong while placing the order.');
        } finally {
            setPlacingOrder(false);
        }
    };

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>Cart</Text>
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptyText}>Add items from a store to begin checkout.</Text>
                    <AppButton title="Browse Stores" onPress={() => navigation.navigate('Home')} style={styles.emptyButton} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Support')}>
                    <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionEyebrow}>Delivery Address</Text>
                <TouchableOpacity style={styles.addressCard} onPress={() => navigation.navigate('AddressSelect')}>
                    <View style={styles.addressIcon}>
                        <Ionicons name="location" size={22} color={Colors.primary} />
                    </View>
                    <View style={styles.addressCopy}>
                        <Text style={styles.addressName}>{selectedAddress?.type || 'Home'}</Text>
                        <Text style={styles.addressText}>
                            {selectedAddress
                                ? `${selectedAddress.addressLine1}, ${selectedAddress.addressLine2}`
                                : 'Add your delivery address'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </TouchableOpacity>

                <View style={styles.summaryHeader}>
                    <Text style={styles.sectionEyebrow}>Order Summary</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('StoreDetail', { storeId })}>
                        <Text style={styles.summaryLink}>Add Items +</Text>
                    </TouchableOpacity>
                </View>

                {items.map(item => (
                    <View key={item.id} style={styles.itemCard}>
                        <Image source={getImageSource(item.image)} style={styles.itemImage} />
                        <View style={styles.itemCopy}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemMeta}>{storeName || 'Custom order'}</Text>
                            <View style={styles.itemFooter}>
                                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                                <View style={styles.quantityWrap}>
                                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                                        <Ionicons name="remove" size={16} color={Colors.textPrimary} />
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{item.quantity}</Text>
                                    <TouchableOpacity onPress={() => addItem(item, storeId, storeName)}>
                                        <Ionicons name="add" size={16} color={Colors.textPrimary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}

                <View style={styles.promoCard}>
                    <View style={styles.promoInputWrap}>
                        <Ionicons name="pricetag-outline" size={18} color={Colors.textSecondary} />
                        <TextInput
                            style={styles.promoInput}
                            placeholder="Enter promo code"
                            placeholderTextColor={Colors.textMuted}
                            value={promoCode}
                            onChangeText={setPromoCode}
                            autoCapitalize="characters"
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.promoButton, !promoCode.trim() && styles.promoButtonDisabled]}
                        onPress={handleApplyPromo}
                        disabled={!promoCode.trim()}
                    >
                        <Text style={styles.promoButtonText}>Apply</Text>
                    </TouchableOpacity>
                </View>
                {appliedPromo ? (
                    <Text style={styles.promoSuccess}>
                        Applied {appliedPromo.code}. Saving {formatCurrency(discount)}.
                    </Text>
                ) : null}

                <View style={styles.billCard}>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Subtotal</Text>
                        <Text style={styles.billValue}>{formatCurrency(subtotal)}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Delivery Fee</Text>
                        <Text style={styles.billValue}>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Service Fee</Text>
                        <Text style={styles.billValue}>{formatCurrency(serviceFee)}</Text>
                    </View>
                    {discount > 0 ? (
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Discount</Text>
                            <Text style={[styles.billValue, styles.discountValue]}>-{formatCurrency(discount)}</Text>
                        </View>
                    ) : null}
                    <View style={styles.billDivider} />
                    <View style={styles.billRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                    </View>
                </View>

                <Text style={styles.sectionEyebrow}>Payment Method</Text>
                {PAYMENT_METHODS.map(method => (
                    <TouchableOpacity
                        key={method.id}
                        style={[styles.paymentRow, selectedPayment === method.id && styles.paymentRowActive]}
                        onPress={() => setSelectedPayment(method.id)}
                    >
                        <View style={styles.paymentLeft}>
                            <View style={styles.paymentIcon}>
                                <Ionicons name={method.icon} size={18} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.paymentName}>{method.name}</Text>
                                <Text style={styles.paymentDesc}>{method.desc}</Text>
                            </View>
                        </View>
                        <View style={[styles.radio, selectedPayment === method.id && styles.radioActive]}>
                            {selectedPayment === method.id ? <View style={styles.radioDot} /> : null}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.payBar}>
                <View style={styles.payTrack}>
                    <View style={styles.payThumb}>
                        <Ionicons name="chevron-forward" size={26} color={Colors.white} />
                    </View>
                    <Text style={styles.payText}>Slide to Pay {formatCurrency(total)}</Text>
                </View>
                <TouchableOpacity style={styles.payOverlay} onPress={handlePlaceOrder} disabled={placingOrder}>
                    <Text style={styles.payOverlayText}>{placingOrder ? 'Placing Order...' : ''}</Text>
                </TouchableOpacity>
            </View>
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
        paddingBottom: Spacing.lg,
    },
    headerButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.82)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
        elevation: 8,
    },
    headerTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    content: {
        paddingHorizontal: Spacing.base,
        paddingBottom: 150,
    },
    sectionEyebrow: {
        ...Typography.labelSmall,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: Spacing.sm,
    },
    addressCard: {
        backgroundColor: 'rgba(255,255,255,0.78)',
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 7, height: 7 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 8,
    },
    addressIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#FDF0E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressCopy: {
        flex: 1,
        marginLeft: Spacing.base,
    },
    addressName: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
    },
    addressText: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    summaryLink: {
        ...Typography.labelMedium,
        color: Colors.primary,
        fontWeight: '800',
    },
    itemCard: {
        backgroundColor: 'rgba(255,255,255,0.78)',
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.base,
        flexDirection: 'row',
        marginBottom: Spacing.base,
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 7, height: 7 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 7,
    },
    itemImage: {
        width: 84,
        height: 84,
        borderRadius: 18,
    },
    itemCopy: {
        flex: 1,
        marginLeft: Spacing.base,
    },
    itemName: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
    },
    itemMeta: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.base,
    },
    itemPrice: {
        ...Typography.h4,
        color: Colors.primary,
    },
    quantityWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: Colors.surfaceLight,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    quantityText: {
        ...Typography.labelMedium,
        color: Colors.textPrimary,
        fontWeight: '800',
    },
    promoCard: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    promoInputWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.78)',
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.base,
        height: 54,
    },
    promoInput: {
        flex: 1,
        marginLeft: 8,
        color: Colors.textPrimary,
    },
    promoButton: {
        width: 92,
        borderRadius: BorderRadius.xl,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    promoButtonDisabled: {
        opacity: 0.45,
    },
    promoButtonText: {
        ...Typography.labelLarge,
        color: Colors.white,
    },
    promoSuccess: {
        ...Typography.bodySmall,
        color: Colors.success,
        marginBottom: Spacing.lg,
    },
    billCard: {
        backgroundColor: 'rgba(255,255,255,0.78)',
        borderRadius: BorderRadius['3xl'],
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
        elevation: 8,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    billLabel: {
        ...Typography.bodyMedium,
        color: Colors.textSecondary,
    },
    billValue: {
        ...Typography.labelMedium,
        color: Colors.textPrimary,
    },
    discountValue: {
        color: Colors.success,
    },
    billDivider: {
        borderTopWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.border,
        marginTop: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    totalLabel: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    totalValue: {
        ...Typography.h2,
        color: Colors.primary,
    },
    paymentRow: {
        backgroundColor: 'rgba(255,255,255,0.78)',
        borderRadius: BorderRadius.xl,
        padding: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    paymentRowActive: {
        borderWidth: 1.5,
        borderColor: '#F0C89A',
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    paymentIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#FDF0E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentName: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
    },
    paymentDesc: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioActive: {
        borderColor: Colors.primary,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    payBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.base,
        paddingBottom: Spacing.xl,
        backgroundColor: 'rgba(248,247,245,0.96)',
    },
    payTrack: {
        height: 78,
        borderRadius: 39,
        backgroundColor: '#EFE9E3',
        justifyContent: 'center',
        paddingLeft: 16,
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    payThumb: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payText: {
        position: 'absolute',
        left: 92,
        right: 20,
        textAlign: 'center',
        ...Typography.labelMedium,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    payOverlay: {
        ...StyleSheet.absoluteFillObject,
        top: 16,
        left: Spacing.base,
        right: Spacing.base,
        bottom: Spacing.xl,
        borderRadius: 39,
    },
    payOverlayText: {
        color: 'transparent',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing['2xl'],
    },
    emptyEmoji: {
        ...Typography.displaySmall,
        color: Colors.primary,
        fontWeight: '800',
    },
    emptyTitle: {
        ...Typography.h2,
        color: Colors.textPrimary,
        marginTop: Spacing.base,
    },
    emptyText: {
        ...Typography.bodyMedium,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
    emptyButton: {
        marginTop: Spacing.xl,
        width: 220,
    },
});

export default CartScreen;
