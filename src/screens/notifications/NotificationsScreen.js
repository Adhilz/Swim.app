// ─────────────────────────────────────────────
//  Screen: Notifications
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { NOTIFICATIONS, NOTIFICATION_ICONS } from '../../data/mockData';

const NOTIF_ICONS = NOTIFICATION_ICONS;

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState(NOTIFICATIONS);

    const markAllRead = () =>
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    const renderItem = ({ item }) => {
        const { icon, color } = NOTIF_ICONS[item.type] || NOTIF_ICONS.order;
        return (
            <TouchableOpacity
                style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
                onPress={() => {
                    setNotifications(prev =>
                        prev.map(n => n.id === item.id ? { ...n, isRead: true } : n)
                    );
                    if (item.orderId) navigation.navigate('OrderTracking', { orderId: item.orderId });
                }}
            >
                <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <View style={styles.notifContent}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                </View>
                {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>Notifications</Text>
                    {unreadCount > 0 && (
                        <Text style={styles.unreadLabel}>{unreadCount} unread</Text>
                    )}
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
                        <Text style={styles.markAllText}>Mark All Read</Text>
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={i => i.id}
                contentContainerStyle={styles.list}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ fontSize: 64 }}>🔔</Text>
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
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
    title: { ...Typography.h4, color: Colors.textPrimary },
    unreadLabel: { ...Typography.caption, color: Colors.primary },
    markAllBtn: { marginLeft: 'auto' },
    markAllText: { ...Typography.labelSmall, color: Colors.primary },
    list: { padding: Spacing.base, paddingBottom: 40 },
    notifCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.base,
        gap: Spacing.sm,
    },
    notifCardUnread: {
        backgroundColor: `${Colors.primary}08`,
        borderWidth: 1,
        borderColor: `${Colors.primary}20`,
    },
    iconCircle: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
    },
    notifContent: { flex: 1 },
    notifTitle: { ...Typography.labelLarge, color: Colors.textPrimary, marginBottom: 4 },
    notifMessage: { ...Typography.bodySmall, color: Colors.textSecondary, lineHeight: 18 },
    notifTime: { ...Typography.caption, color: Colors.textMuted, marginTop: 6 },
    unreadDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: Colors.primary,
        marginTop: 4,
    },
    separator: { height: Spacing.sm },
    empty: { alignItems: 'center', paddingTop: 100, gap: Spacing.base },
    emptyText: { ...Typography.bodyLarge, color: Colors.textSecondary },
});

export default NotificationsScreen;
