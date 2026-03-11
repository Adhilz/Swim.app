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
const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuthStore();

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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}>
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
                </LinearGradient>

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
});

export default ProfileScreen;
