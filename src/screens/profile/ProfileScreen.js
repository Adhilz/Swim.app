// ─────────────────────────────────────────────
//  Screen: Profile + Order History
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { MOCK_ORDERS } from '../../data/mockData';

const MENU_SECTIONS = [
    {
        title: 'Orders & Wallet',
        items: [
            { id: 'orders', label: 'My Orders', icon: 'receipt-outline', badge: '2', route: 'OrderHistory' },
            { id: 'wallet', label: 'Swim.ai Wallet', icon: 'wallet-outline', value: '₹120', route: 'Wallet' },
            { id: 'coupons', label: 'Offers & Coupons', icon: 'pricetag-outline', badge: 'NEW', route: 'Coupons' },
        ],
    },
    {
        title: 'Account',
        items: [
            { id: 'addresses', label: 'Saved Addresses', icon: 'location-outline', route: 'AddressSelect' },
            { id: 'payments', label: 'Payment Methods', icon: 'card-outline', route: 'Payments' },
            { id: 'notifications', label: 'Notifications', icon: 'notifications-outline', route: 'Notifications' },
        ],
    },
    {
        title: 'Support',
        items: [
            { id: 'help', label: 'Help & Support', icon: 'help-circle-outline', route: 'Support' },
            { id: 'rate', label: 'Rate the App', icon: 'star-outline', route: null },
            { id: 'about', label: 'About Swim.ai', icon: 'information-circle-outline', route: null },
        ],
    },
];

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile'); // profile | orders

    const statusColor = (status) => {
        switch (status) {
            case 'Delivered': return Colors.success;
            case 'Cancelled': return Colors.error;
            default: return Colors.warning;
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={styles.settingsBtn}>
                    <Ionicons name="settings-outline" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabs}>
                {['Profile', 'Orders'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab.toLowerCase() && styles.tabActive]}
                        onPress={() => setActiveTab(tab.toLowerCase())}
                    >
                        <Text style={[styles.tabText, activeTab === tab.toLowerCase() && styles.tabTextActive]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {activeTab === 'profile' ? (
                    <>
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
                                    <Text style={styles.userPhone}>{user?.phone ? `+91 ${user.phone}` : ''}</Text>
                                    <Text style={styles.userEmail}>{user?.email || ''}</Text>
                                </View>
                                <TouchableOpacity style={styles.editBtn}>
                                    <Ionicons name="pencil" size={16} color={Colors.primary} />
                                </TouchableOpacity>
                            </View>

                            {/* Stats */}
                            <View style={styles.statsRow}>
                                {[
                                    { label: 'Total Orders', value: user?.totalOrders || 23 },
                                    { label: 'Loyalty Points', value: user?.loyaltyPoints || 450 },
                                    { label: 'Saved 💰', value: '₹1.2K' },
                                ].map((stat, i) => (
                                    <React.Fragment key={stat.label}>
                                        <View style={styles.stat}>
                                            <Text style={styles.statValue}>{stat.value}</Text>
                                            <Text style={styles.statLabel}>{stat.label}</Text>
                                        </View>
                                        {i < 2 && <View style={styles.statDivider} />}
                                    </React.Fragment>
                                ))}
                            </View>
                        </LinearGradient>

                        {/* ── Menu Sections ── */}
                        {MENU_SECTIONS.map(section => (
                            <View key={section.title} style={styles.menuSection}>
                                <Text style={styles.menuSectionTitle}>{section.title}</Text>
                                <View style={styles.menuCard}>
                                    {section.items.map((item, index) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[
                                                styles.menuItem,
                                                index < section.items.length - 1 && styles.menuItemBorder,
                                            ]}
                                            onPress={() => item.route && navigation.navigate(item.route)}
                                        >
                                            <View style={styles.menuIconContainer}>
                                                <Ionicons name={item.icon} size={20} color={Colors.primary} />
                                            </View>
                                            <Text style={styles.menuLabel}>{item.label}</Text>
                                            <View style={styles.menuRight}>
                                                {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                                                {item.badge && (
                                                    <View style={[
                                                        styles.badge,
                                                        item.badge === 'NEW' ? styles.badgeNew : styles.badgeCount,
                                                    ]}>
                                                        <Text style={styles.badgeText}>{item.badge}</Text>
                                                    </View>
                                                )}
                                                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}

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
                    </>
                ) : (
                    <>
                        {/* ── Order History ── */}
                        {MOCK_ORDERS.map(order => (
                            <View key={order.id} style={styles.orderCard}>
                                <View style={styles.orderHeader}>
                                    <View>
                                        <Text style={styles.orderStoreName}>{order.storeName}</Text>
                                        <Text style={styles.orderDate}>{order.date} • {order.paymentMethod}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor(order.status)}20` }]}>
                                        <Text style={[styles.statusText, { color: statusColor(order.status) }]}>
                                            {order.status}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.orderItems}>
                                    {order.items.map(item => (
                                        <Text key={item.name} style={styles.orderItemText}>
                                            {item.qty}x {item.name}
                                        </Text>
                                    ))}
                                </View>

                                <View style={styles.orderFooter}>
                                    <View>
                                        <Text style={styles.orderTotal}>₹{order.totalAmount}</Text>
                                        <Text style={styles.orderDelivery}>{order.deliveryTime} delivery</Text>
                                    </View>
                                    <TouchableOpacity style={styles.reorderBtn}>
                                        <Ionicons name="refresh" size={14} color={Colors.primary} />
                                        <Text style={styles.reorderText}>Reorder</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Rating (if delivered) */}
                                {order.status === 'Delivered' && order.rating && (
                                    <View style={styles.ratingRow}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Ionicons
                                                key={star}
                                                name="star"
                                                size={14}
                                                color={star <= order.rating ? Colors.star : Colors.border}
                                            />
                                        ))}
                                        <Text style={styles.ratingLabel}>Your rating</Text>
                                    </View>
                                )}
                            </View>
                        ))}

                        {MOCK_ORDERS.length === 0 && (
                            <View style={styles.emptyOrders}>
                                <Text style={{ fontSize: 64 }}>📦</Text>
                                <Text style={styles.emptyTitle}>No orders yet</Text>
                                <Text style={styles.emptySub}>Start ordering from your favorite stores!</Text>
                            </View>
                        )}
                    </>
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

    // Order Cards
    orderCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.base,
        marginHorizontal: Spacing.base,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    orderStoreName: { ...Typography.labelLarge, color: Colors.textPrimary },
    orderDate: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
    statusText: { ...Typography.labelSmall },
    orderItems: { marginBottom: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
    orderItemText: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 2 },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    orderTotal: { ...Typography.h5, color: Colors.textPrimary },
    orderDelivery: { ...Typography.caption, color: Colors.textMuted },
    reorderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: `${Colors.primary}15`,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    reorderText: { ...Typography.labelSmall, color: Colors.primary },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    ratingLabel: { ...Typography.caption, color: Colors.textMuted, marginLeft: 4 },

    emptyOrders: { alignItems: 'center', padding: Spacing['3xl'] },
    emptyTitle: { ...Typography.h4, color: Colors.textPrimary, marginTop: Spacing.base },
    emptySub: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
});

export default ProfileScreen;
