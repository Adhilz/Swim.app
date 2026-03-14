import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { useDataStore } from '../../store/dataStore';

const WalletScreen = ({ navigation }) => {
    const orders = useDataStore(state => state.orders);

    const { totalSpent, rewardBalance, txns } = useMemo(() => {
        if (!orders?.length) {
            return { totalSpent: 0, rewardBalance: 0, txns: [] };
        }

        const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const rewardBalance = Math.floor(totalSpent * 0.03);
        const txns = orders.slice(0, 10).map(order => ({
            id: order.id,
            title: 'Order Cashback',
            desc: `3% back on order #${String(order.id).slice(0, 6).toUpperCase()}`,
            amount: Math.floor((order.total_amount || 0) * 0.03),
        }));

        return { totalSpent, rewardBalance, txns };
    }, [orders]);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wallet</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <LinearGradient colors={Colors.primaryGradient} style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Available Swim Coins</Text>
                    <Text style={styles.balanceValue}>{rewardBalance}</Text>
                    <Text style={styles.balanceSub}>Earn 3% back on completed orders and use it on your next checkout.</Text>
                    <View style={styles.balanceStats}>
                        <View style={styles.statBlock}>
                            <Text style={styles.statLabel}>Lifetime Spent</Text>
                            <Text style={styles.statValue}>Rs {totalSpent}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBlock}>
                            <Text style={styles.statLabel}>Orders</Text>
                            <Text style={styles.statValue}>{orders?.length || 0}</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <Text style={styles.sectionHint}>Generated from your real order history</Text>
                </View>

                {txns.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <MaterialIcons name="account-balance-wallet" size={34} color={Colors.textMuted} />
                        <Text style={styles.emptyTitle}>No wallet activity yet</Text>
                        <Text style={styles.emptyText}>Place an order to start earning Swim Coins.</Text>
                    </View>
                ) : (
                    txns.map(tx => (
                        <View key={tx.id} style={styles.txRow}>
                            <View style={styles.txIcon}>
                                <Ionicons name="sparkles-outline" size={18} color={Colors.primary} />
                            </View>
                            <View style={styles.txCopy}>
                                <Text style={styles.txTitle}>{tx.title}</Text>
                                <Text style={styles.txDesc}>{tx.desc}</Text>
                            </View>
                            <Text style={styles.txAmount}>+{tx.amount}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
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
    content: {
        paddingHorizontal: Spacing.base,
        paddingBottom: 140,
    },
    balanceCard: {
        borderRadius: BorderRadius['3xl'],
        padding: Spacing.xl,
        marginTop: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    balanceLabel: {
        ...Typography.bodySmall,
        color: 'rgba(255,255,255,0.84)',
    },
    balanceValue: {
        ...Typography.displayMedium,
        color: Colors.white,
        marginTop: Spacing.xs,
    },
    balanceSub: {
        ...Typography.bodySmall,
        color: 'rgba(255,255,255,0.9)',
        marginTop: Spacing.sm,
    },
    balanceStats: {
        marginTop: Spacing.lg,
        paddingTop: Spacing.base,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    statBlock: {
        flex: 1,
    },
    statLabel: {
        ...Typography.caption,
        color: 'rgba(255,255,255,0.8)',
    },
    statValue: {
        ...Typography.h5,
        color: Colors.white,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 34,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: Spacing.base,
    },
    sectionHeader: {
        marginBottom: Spacing.base,
    },
    sectionTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    sectionHint: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 4,
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
    txRow: {
        backgroundColor: 'rgba(255,255,255,0.82)',
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.base,
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 7,
    },
    txIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#FDF0E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    txCopy: {
        flex: 1,
        marginLeft: Spacing.sm,
    },
    txTitle: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
    },
    txDesc: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    txAmount: {
        ...Typography.labelLarge,
        color: Colors.success,
    },
});

export default WalletScreen;
