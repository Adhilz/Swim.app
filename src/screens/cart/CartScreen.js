// ─────────────────────────────────────────────
//  Screen: Cart + Checkout
// ─────────────────────────────────────────────
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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import AppButton from '../../components/common/AppButton';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { MOCK_ADDRESSES } from '../../data/mockData';

const PAYMENT_METHODS = [
    { id: 'upi', name: 'UPI', icon: 'phone-portrait', desc: 'Pay via any UPI app' },
    { id: 'card', name: 'Card', icon: 'card', desc: 'Credit / Debit Card' },
    { id: 'wallet', name: 'Wallet', icon: 'wallet', desc: 'QuickCart Wallet • ₹120' },
    { id: 'cod', name: 'Cash', icon: 'cash', desc: 'Pay on Delivery' },
];

const CartScreen = ({ navigation }) => {
    const {
        items,
        storeName,
        addItem,
        removeItem,
        deleteItem,
        clearCart,
        getSubtotal,
        getDeliveryFee,
        getTaxes,
        getTotal,
        applyPromo,
    } = useCartStore();

    const selectedAddress = useAuthStore(s => s.selectedAddress);

    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState('upi');
    const [placingOrder, setPlacingOrder] = useState(false);

    const displayAddress = selectedAddress || MOCK_ADDRESSES[0];

    const handleApplyPromo = () => {
        const promo = applyPromo(promoCode);
        if (promo) {
            setAppliedPromo({ code: promoCode.toUpperCase(), ...promo });
        } else {
            Alert.alert('Invalid Code', 'The promo code you entered is invalid or expired.');
        }
    };

    const getDiscount = () => {
        if (!appliedPromo) return 0;
        const subtotal = getSubtotal();
        return Math.min(
            Math.round(subtotal * appliedPromo.discount),
            appliedPromo.maxDiscount
        );
    };

    const handlePlaceOrder = async () => {
        setPlacingOrder(true);
        await new Promise(r => setTimeout(r, 2000));
        setPlacingOrder(false);
        clearCart();
        navigation.replace('OrderTracking', { orderId: 'ORD' + Date.now() });
    };

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.emptyCart}>
                    <Text style={{ fontSize: 80 }}>🛒</Text>
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptySubtitle}>Add items from a store to get started</Text>
                    <AppButton
                        title="Browse Stores"
                        onPress={() => navigation.navigate('Home')}
                        style={{ marginTop: Spacing.xl, width: 200 }}
                    />
                </View>
            </SafeAreaView>
        );
    }

    const subtotal = getSubtotal();
    const delivery = getDeliveryFee();
    const taxes = getTaxes();
    const discount = getDiscount();
    const total = subtotal + delivery + taxes - discount;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Your Cart</Text>
                    <Text style={styles.headerSub}>{storeName}</Text>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Remove all items?', [
                    { text: 'Cancel' },
                    { text: 'Clear', style: 'destructive', onPress: clearCart },
                ])}>
                    <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                {/* ── Items ── */}
                <View style={styles.section}>
                    {items.map(item => (
                        <View key={item.id} style={styles.itemRow}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.itemPrice}>₹{item.price}</Text>
                            </View>
                            <View style={styles.itemControls}>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(item.id)}>
                                    <Ionicons name={item.quantity === 1 ? 'trash-outline' : 'remove'} size={16} color={Colors.primary} />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <TouchableOpacity style={styles.qtyBtnFilled} onPress={() => addItem(item, null, null)}>
                                    <Ionicons name="add" size={16} color={Colors.white} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── Promo Code ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Promo Code</Text>
                    <View style={styles.promoRow}>
                        <View style={styles.promoInput}>
                            <Ionicons name="pricetag-outline" size={18} color={Colors.textMuted} />
                            <TextInput
                                value={promoCode}
                                onChangeText={setPromoCode}
                                placeholder="Enter promo code"
                                placeholderTextColor={Colors.textMuted}
                                style={styles.promoTextInput}
                                autoCapitalize="characters"
                            />
                            {appliedPromo && (
                                <TouchableOpacity onPress={() => { setAppliedPromo(null); setPromoCode(''); }}>
                                    <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity
                            style={[styles.applyBtn, !promoCode && styles.applyBtnDisabled]}
                            onPress={handleApplyPromo}
                            disabled={!promoCode}
                        >
                            <Text style={styles.applyBtnText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                    {appliedPromo && (
                        <View style={styles.promoSuccess}>
                            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                            <Text style={styles.promoSuccessText}>Saving ₹{discount} with {appliedPromo.code}!</Text>
                        </View>
                    )}
                </View>

                {/* ── Bill Summary ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bill Summary</Text>
                    <View style={styles.billCard}>
                        {[
                            { label: 'Item Total', value: `₹${subtotal}` },
                            { label: 'Delivery Fee', value: delivery === 0 ? 'FREE' : `₹${delivery}`, green: delivery === 0 },
                            { label: 'Taxes & Charges', value: `₹${taxes}` },
                            ...(discount > 0 ? [{ label: `Discount (${appliedPromo.code})`, value: `-₹${discount}`, green: true }] : []),
                        ].map((row, i, arr) => (
                            <View key={row.label} style={[styles.billRow, i < arr.length - 1 && styles.billRowBorder]}>
                                <Text style={styles.billLabel}>{row.label}</Text>
                                <Text style={[styles.billValue, row.green && { color: Colors.success }]}>{row.value}</Text>
                            </View>
                        ))}
                        <View style={[styles.billRow, styles.billTotal]}>
                            <Text style={styles.billTotalLabel}>Grand Total</Text>
                            <Text style={styles.billTotalValue}>₹{total}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Delivery Address ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AddressSelect')}>
                            <Text style={styles.changeLink}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.addressCard}>
                        <View style={styles.addressIcon}>
                            <Ionicons name={displayAddress.type === 'Home' ? 'home' : 'briefcase'} size={18} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.addressType}>{displayAddress.type}</Text>
                            <Text style={styles.addressText}>{displayAddress.addressLine1}, {displayAddress.addressLine2}</Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    </View>
                </View>

                {/* ── Payment Method ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    {PAYMENT_METHODS.map(method => (
                        <TouchableOpacity
                            key={method.id}
                            style={[styles.paymentRow, selectedPayment === method.id && styles.paymentRowActive]}
                            onPress={() => setSelectedPayment(method.id)}
                        >
                            <View style={[styles.paymentIcon, { backgroundColor: `${Colors.primary}15` }]}>
                                <Ionicons name={method.icon} size={20} color={Colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.paymentName}>{method.name}</Text>
                                <Text style={styles.paymentDesc}>{method.desc}</Text>
                            </View>
                            <View style={[styles.radio, selectedPayment === method.id && styles.radioActive]}>
                                {selectedPayment === method.id && <View style={styles.radioDot} />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* ── Bottom CTA ── */}
            <View style={styles.bottomBar}>
                <View style={styles.totalPreview}>
                    <Text style={styles.totalPreviewLabel}>Total Amount</Text>
                    <Text style={styles.totalPreviewValue}>₹{total}</Text>
                </View>
                <AppButton
                    title={`Place Order  ₹${total}`}
                    onPress={handlePlaceOrder}
                    loading={placingOrder}
                    style={styles.placeOrderBtn}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: Spacing.sm,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { ...Typography.h4, color: Colors.textPrimary },
    headerSub: { ...Typography.caption, color: Colors.textSecondary },
    clearText: { ...Typography.labelMedium, color: Colors.error },

    section: {
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.base,
        marginBottom: Spacing.sm,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { ...Typography.h5, color: Colors.textPrimary, marginBottom: Spacing.sm },
    changeLink: { ...Typography.labelMedium, color: Colors.primary },

    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.sm,
        marginBottom: Spacing.sm,
        gap: Spacing.sm,
    },
    itemImage: { width: 60, height: 60, borderRadius: BorderRadius.md },
    itemInfo: { flex: 1 },
    itemName: { ...Typography.labelLarge, color: Colors.textPrimary },
    itemPrice: { ...Typography.bodySmall, color: Colors.primary, marginTop: 4 },
    itemControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: 4,
    },
    qtyBtn: {
        width: 28, height: 28, borderRadius: 14,
        borderWidth: 1, borderColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    qtyBtnFilled: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    qtyText: { ...Typography.labelMedium, color: Colors.textPrimary, minWidth: 20, textAlign: 'center' },

    // Promo
    promoRow: { flexDirection: 'row', gap: Spacing.sm },
    promoInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.sm,
        height: 48,
    },
    promoTextInput: { flex: 1, ...Typography.bodyMedium, color: Colors.textPrimary },
    applyBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
    },
    applyBtnDisabled: { backgroundColor: Colors.surfaceLight },
    applyBtnText: { ...Typography.labelLarge, color: Colors.white },
    promoSuccess: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: Spacing.sm,
        backgroundColor: `${Colors.success}15`,
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    promoSuccessText: { ...Typography.bodySmall, color: Colors.success },

    // Bill
    billCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
    },
    billRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    billLabel: { ...Typography.bodyMedium, color: Colors.textSecondary },
    billValue: { ...Typography.bodyMedium, color: Colors.textPrimary },
    billTotal: {
        borderTopWidth: 2,
        borderTopColor: Colors.border,
        paddingVertical: Spacing.base,
    },
    billTotalLabel: { ...Typography.h5, color: Colors.textPrimary },
    billTotalValue: { ...Typography.h4, color: Colors.primary },

    // Address
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.base,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    addressIcon: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: `${Colors.primary}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    addressType: { ...Typography.labelLarge, color: Colors.textPrimary },
    addressText: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },

    // Payment
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.base,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.base,
        marginBottom: Spacing.sm,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    paymentRowActive: { borderColor: Colors.primary },
    paymentIcon: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
    },
    paymentName: { ...Typography.labelLarge, color: Colors.textPrimary },
    paymentDesc: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
    radio: {
        width: 20, height: 20, borderRadius: 10,
        borderWidth: 2, borderColor: Colors.border,
        alignItems: 'center', justifyContent: 'center',
    },
    radioActive: { borderColor: Colors.primary },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

    // Bottom
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        padding: Spacing.base,
        paddingBottom: Spacing['2xl'],
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.base,
    },
    totalPreview: {},
    totalPreviewLabel: { ...Typography.caption, color: Colors.textSecondary },
    totalPreviewValue: { ...Typography.h4, color: Colors.primary },
    placeOrderBtn: { flex: 1 },

    // Empty
    emptyCart: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
    emptyTitle: { ...Typography.h3, color: Colors.textPrimary, marginTop: Spacing.base },
    emptySubtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
});

export default CartScreen;
