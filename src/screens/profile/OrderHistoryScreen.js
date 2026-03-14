import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { useDataStore } from '../../store/dataStore';
import { useRequestStore } from '../../store/requestStore';

const formatAmount = value => `Rs ${value}`;

const OrderHistoryScreen = ({ navigation }) => {
    const orders = useDataStore(state => state.orders);
    const ordersLoading = useDataStore(state => state.ordersLoading);
    const stores = useDataStore(state => state.stores);
    const requests = useRequestStore(state => state.requests);

    const decorated = useMemo(() => {
        if (!orders || !stores) {
            return [];
        }

        return orders.map(order => {
            const store = stores.find(item => item.id === order.store_id);
            return {
                ...order,
                storeName: store?.name || 'Store',
                storeImage: store?.image,
            };
        });
    }, [orders, stores]);

    const decoratedRequests = useMemo(() => {
        return (requests || []).map(request => ({
            ...request,
            isRequest: true,
            total_amount: null,
            storeName: 'Deliver Anything',
            storeImage: null,
        }));
    }, [requests]);

    const combined = useMemo(() => {
        return [...decoratedRequests, ...decorated].sort((a, b) => {
            const aDate = new Date(a.createdAt || a.created_at || 0).getTime();
            const bDate = new Date(b.createdAt || b.created_at || 0).getTime();
            return bDate - aDate;
        });
    }, [decorated, decoratedRequests]);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Orders</Text>
                <View style={styles.headerSpacer} />
            </View>

            {ordersLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.heroCard}>
                        <Text style={styles.heroEyebrow}>Order History</Text>
                        <Text style={styles.heroTitle}>Track your past and active deliveries</Text>
                        <Text style={styles.heroSubtitle}>Your real shops, totals, and order details are all preserved.</Text>
                    </View>

                    {combined.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <MaterialIcons name="receipt-long" size={34} color={Colors.textMuted} />
                            <Text style={styles.emptyTitle}>No orders yet</Text>
                            <Text style={styles.emptyText}>Place your first order and it will show up here.</Text>
                        </View>
                    ) : (
                        combined.map(order => (
                            <TouchableOpacity
                                key={order.id}
                                style={styles.card}
                                activeOpacity={0.92}
                                onPress={() => {
                                    if (!order.isRequest) {
                                        navigation.navigate('OrderTracking', { orderId: order.id });
                                    }
                                }}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.storeRow}>
                                        <View style={styles.storeImgWrap}>
                                            {order.storeImage ? (
                                                <Image
                                                    source={typeof order.storeImage === 'string' ? { uri: order.storeImage } : order.storeImage}
                                                    style={styles.storeImg}
                                                />
                                            ) : order.isRequest ? (
                                                <View style={styles.requestPlaceholder}>
                                                    <MaterialIcons name="local-shipping" size={18} color={Colors.primary} />
                                                </View>
                                            ) : (
                                                <View style={styles.placeholder}>
                                                    <Ionicons name="storefront-outline" size={18} color={Colors.textSecondary} />
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.storeCopy}>
                                            <Text style={styles.storeName}>{order.storeName}</Text>
                                            <Text style={styles.orderMeta}>
                                                {order.isRequest
                                                    ? `${order.pickupItem} • ${new Date(order.createdAt).toLocaleDateString()}`
                                                    : new Date(order.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.statusPill}>
                                        <Text style={styles.statusText}>{order.status}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardFooter}>
                                    <Text style={styles.amount}>
                                        {order.isRequest ? order.dropoffLocation : formatAmount(order.total_amount)}
                                    </Text>
                                    <View style={styles.trackWrap}>
                                        <Text style={styles.trackText}>{order.isRequest ? 'Saved' : 'Track'}</Text>
                                        {!order.isRequest ? <Ionicons name="chevron-forward" size={16} color={Colors.primary} /> : null}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}
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
        paddingVertical: Spacing.sm,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.82)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 8,
    },
    headerTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    headerSpacer: {
        width: 44,
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: Spacing.base,
        paddingBottom: 140,
    },
    heroCard: {
        backgroundColor: 'rgba(255,255,255,0.82)',
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.xl,
        marginBottom: Spacing.base,
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 8,
    },
    heroEyebrow: {
        ...Typography.labelSmall,
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heroTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
        marginTop: Spacing.sm,
    },
    heroSubtitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    emptyCard: {
        backgroundColor: 'rgba(255,255,255,0.82)',
        borderRadius: BorderRadius['2xl'],
        paddingVertical: Spacing['3xl'],
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
    },
    emptyTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
        marginTop: Spacing.base,
    },
    emptyText: {
        ...Typography.bodyMedium,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.82)',
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.base,
        marginBottom: Spacing.base,
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    storeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    storeImgWrap: {
        width: 48,
        height: 48,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: Colors.surfaceLight,
    },
    storeImg: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    requestPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDF0E1',
    },
    storeCopy: {
        flex: 1,
        marginLeft: Spacing.sm,
    },
    storeName: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
    },
    orderMeta: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    statusPill: {
        backgroundColor: '#FDF0E1',
        borderRadius: BorderRadius.full,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    statusText: {
        ...Typography.labelSmall,
        color: Colors.primaryDark,
    },
    cardFooter: {
        marginTop: Spacing.base,
        paddingTop: Spacing.base,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amount: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
    },
    trackWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    trackText: {
        ...Typography.labelMedium,
        color: Colors.primary,
    },
});

export default OrderHistoryScreen;
