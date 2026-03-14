// ─────────────────────────────────────────────
//  Screen: Profile + Order History
// ─────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    Alert,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';

const ProfileScreen = ({ navigation }) => {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const [activeTab, setActiveTab] = useState('overview'); // overview | settings
    const orders = useDataStore(state => state.orders);
    const ordersLoading = useDataStore(state => state.ordersLoading);
    const stores = useDataStore(state => state.stores);

    const decoratedOrders = React.useMemo(() => {
        if (!orders || !stores) return [];
        return orders.map(o => {
            const store = stores.find(s => s.id === o.store_id);
            return {
                ...o,
                storeName: store?.name || 'Store',
                storeImage: store?.image,
            };
        });
    }, [orders, stores]);

    const lifetimeSpend = React.useMemo(
        () => (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0),
        [orders]
    );

    const statusColor = (status) => {
        switch (status) {
            case 'Delivered': return Colors.success;
            case 'Cancelled': return Colors.error;
            case 'Pending': return Colors.primary;
            default: return Colors.warning;
        }
    };

    const StatusBadge = ({ status }) => (
        <View style={[styles.badge, { backgroundColor: `${statusColor(status)}20` }]}>
            <Text style={{ ...Typography.caption, color: statusColor(status), fontWeight: '700' }}>
                {status}
            </Text>
        </View>
    );

    const renderOrderCard = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={styles.orderStoreInfo}>
                    <View style={styles.orderStoreImgWrap}>
                        <Image
                            source={
                                item.storeImage
                                    ? typeof item.storeImage === 'string'
                                        ? { uri: item.storeImage }
                                        : item.storeImage
                                    : { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200' }
                            }
                            style={styles.orderStoreImg}
                        />
                    </View>
                    <View>
                        <Text style={styles.orderStoreName}>{item.storeName}</Text>
                        <Text style={styles.orderDate}>
                            {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
                <StatusBadge status={item.status} />
            </View>
            <View style={styles.orderFooter}>
                <Text style={styles.orderAmount}>₹{item.total_amount}</Text>
                <TouchableOpacity style={styles.orderTrackBtn} onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}>
                    <Text style={styles.orderTrackText}>View Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={styles.settingsBtn} onPress={() => setActiveTab('settings')}>
                    <Ionicons name="settings-outline" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}>
                {/* ── User Card ── */}
                <LinearGradient
                    colors={['rgba(244,123,37,0.15)', 'transparent']}
                    style={styles.userCard}
                >
                    <View style={styles.userCardContent}>
                        <LinearGradient colors={Colors.primaryGradient} style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                        </LinearGradient>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
                            <Text style={styles.userPhone}>{user?.phone ? user.phone : ''}</Text>
                            <Text style={styles.userEmail}>{user?.email || ''}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBtn}>
                            <Ionicons name="pencil" size={16} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* ── Tabs ── */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
                        onPress={() => setActiveTab('overview')}
                    >
                        <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
                            Overview
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
                        onPress={() => setActiveTab('settings')}
                    >
                        <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
                            Settings
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Tab Content ── */}
                {activeTab === 'overview' ? (
                    <View style={styles.tabContent}>
                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{decoratedOrders.length}</Text>
                                <Text style={styles.statLabel}>Orders</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>₹{lifetimeSpend}</Text>
                                <Text style={styles.statLabel}>Total Spend</Text>
                            </View>
                        </View>

                        {/* Recent Orders */}
                        <View style={styles.menuSection}>
                            <Text style={styles.menuSectionTitle}>Recent Orders</Text>
                            {ordersLoading ? (
                                <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 16 }} />
                            ) : decoratedOrders.length > 0 ? (
                                decoratedOrders.slice(0, 3).map(order => (
                                    <React.Fragment key={order.id}>
                                        {renderOrderCard({ item: order })}
                                    </React.Fragment>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="receipt-outline" size={32} color={Colors.textMuted} />
                                    <Text style={styles.emptyText}>No orders yet</Text>
                                </View>
                            )}
                            {decoratedOrders.length > 3 && (
                                <TouchableOpacity
                                    style={styles.seeAllOrders}
                                    onPress={() => navigation.navigate('OrderHistory')}
                                >
                                    <Text style={styles.seeAllText}>View all orders</Text>
                                    <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={styles.tabContent}>
                        {/* Settings Menu */}
                        <View style={styles.menuSection}>
                            <Text style={styles.menuSectionTitle}>Orders & Wallet</Text>
                            <View style={styles.menuCard}>
                                <TouchableOpacity
                                    style={[styles.menuItem, styles.menuItemBorder]}
                                    onPress={() => navigation.navigate('OrderHistory')}
                                >
                                    <View style={styles.menuIconContainer}>
                                        <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.menuLabel}>My Orders</Text>
                                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.menuItem, styles.menuItemBorder]}
                                    onPress={() => navigation.navigate('Wallet')}
                                >
                                    <View style={styles.menuIconContainer}>
                                        <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.menuLabel}>Swim.ai Wallet</Text>
                                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => navigation.navigate('Coupons')}
                                >
                                    <View style={styles.menuIconContainer}>
                                        <Ionicons name="pricetag-outline" size={20} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.menuLabel}>Offers & Coupons</Text>
                                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.menuSection}>
                            <Text style={styles.menuSectionTitle}>Account</Text>
                            <View style={styles.menuCard}>
                                <TouchableOpacity
                                    style={[styles.menuItem, styles.menuItemBorder]}
                                    onPress={() => navigation.navigate('AddressSelect')}
                                >
                                    <View style={styles.menuIconContainer}>
                                        <Ionicons name="location-outline" size={20} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.menuLabel}>Saved Addresses</Text>
                                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.menuItem, styles.menuItemBorder]}
                                    onPress={() => navigation.navigate('Payments')}
                                >
                                    <View style={styles.menuIconContainer}>
                                        <Ionicons name="card-outline" size={20} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.menuLabel}>Payment Methods</Text>
                                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => navigation.navigate('Notifications')}
                                >
                                    <View style={styles.menuIconContainer}>
                                        <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.menuLabel}>Notifications</Text>
                                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.menuSection}>
                            <Text style={styles.menuSectionTitle}>Support</Text>
                            <View style={styles.menuCard}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => navigation.navigate('Support')}
                                >
                                    <View style={styles.menuIconContainer}>
                                        <Ionicons name="help-circle-outline" size={20} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.menuLabel}>Help & Support</Text>
                                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Logout */}
                        <TouchableOpacity
                            style={styles.logoutBtn}
                            onPress={() =>
                                Alert.alert('Logout', 'Are you sure you want to logout?', [
                                    { text: 'Cancel' },
                                    { text: 'Logout', style: 'destructive', onPress: logout },
                                ])
                            }
                        >
                            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
    },
    headerTitle: { ...Typography.h3, color: Colors.textPrimary },
    settingsBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center', justifyContent: 'center',
    },

    tabs: {
        flexDirection: 'row',
        marginHorizontal: Spacing.base,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: 4,
        marginBottom: Spacing.base,
    },
    tab: {
        flex: 1, paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
    },
    tabActive: { backgroundColor: Colors.card, ...Shadows.sm },
    tabText: { ...Typography.labelMedium, color: Colors.textSecondary },
    tabTextActive: { color: Colors.textPrimary },

    // User Card
    userCard: {
        marginHorizontal: Spacing.base,
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.base,
        marginBottom: Spacing.base,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    userCardContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, marginBottom: Spacing.base },
    avatar: {
        width: 64, height: 64, borderRadius: 32,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { ...Typography.h2, color: Colors.white },
    userInfo: { flex: 1 },
    userName: { ...Typography.h4, color: Colors.textPrimary },
    userPhone: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
    userEmail: { ...Typography.caption, color: Colors.textMuted },
    editBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: `${Colors.primary}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: Spacing.base,
    },
    stat: { flex: 1, alignItems: 'center' },
    statValue: { ...Typography.h4, color: Colors.textPrimary },
    statLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4 },
    statDivider: { width: 1, backgroundColor: Colors.border },

    // Menu
    menuSection: { marginHorizontal: Spacing.base, marginBottom: Spacing.base },
    menuSectionTitle: { ...Typography.labelMedium, color: Colors.textMuted, marginBottom: Spacing.sm, marginLeft: 4 },
    menuCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.xl, overflow: 'hidden' },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    menuIconContainer: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: `${Colors.primary}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    menuLabel: { ...Typography.bodyMedium, color: Colors.textPrimary, flex: 1 },
    menuRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    menuValue: { ...Typography.labelMedium, color: Colors.success },
    badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
    badgeCount: { backgroundColor: Colors.primary },
    badgeNew: { backgroundColor: Colors.success },
    badgeText: { ...Typography.caption, color: Colors.white, fontWeight: '700' },

    // Logout
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginHorizontal: Spacing.base,
        padding: Spacing.base,
        borderRadius: BorderRadius.xl,
        backgroundColor: `${Colors.error}10`,
        borderWidth: 1,
        borderColor: `${Colors.error}30`,
        marginBottom: Spacing.xl,
    },
    logoutText: { ...Typography.labelLarge, color: Colors.error },

    // Tabs content
    tabContent: {
        marginTop: Spacing.sm,
    },
    
    // Orders
    orderCard: {
        marginHorizontal: Spacing.base,
        marginBottom: Spacing.base,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.base,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingBottom: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    orderStoreInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        flex: 1,
    },
    orderStoreImgWrap: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    orderStoreImg: {
        width: '100%',
        height: '100%',
    },
    orderStoreName: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
    },
    orderDate: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderAmount: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
    },
    orderTrackBtn: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: `${Colors.primary}15`,
        borderRadius: BorderRadius.full,
    },
    orderTrackText: {
        ...Typography.labelMedium,
        color: Colors.primary,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing['3xl'],
        gap: Spacing.md,
    },
    emptyText: {
        ...Typography.bodyLarge,
        color: Colors.textSecondary,
    },
});

export default ProfileScreen;
