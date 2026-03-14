import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

const rows = [
    {
        id: 'faq',
        icon: 'help-circle-outline',
        title: 'Browse FAQs',
        desc: 'Find answers to common delivery, payment, and order questions.',
    },
    {
        id: 'email',
        icon: 'mail-outline',
        title: 'Email Support',
        desc: 'Write to us and we will get back within 24 hours.',
        action: () => Linking.openURL('mailto:support@swim.ai'),
    },
    {
        id: 'call',
        icon: 'call-outline',
        title: 'Call Support',
        desc: 'Talk to a support specialist for urgent help with an active order.',
        action: () => Linking.openURL('tel:+919876543210'),
    },
];

const SupportScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.headerSpacer} />
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroCard}>
                    <Ionicons name="chatbubbles-outline" size={30} color={Colors.primary} />
                    <Text style={styles.heroTitle}>We’re here to help</Text>
                    <Text style={styles.heroText}>Reach out any time if something doesn’t feel right with your delivery experience.</Text>
                </View>

                {rows.map(row => (
                    <TouchableOpacity
                        key={row.id}
                        style={styles.rowCard}
                        activeOpacity={0.92}
                        onPress={row.action}
                        disabled={!row.action}
                    >
                        <View style={styles.iconWrap}>
                            <Ionicons name={row.icon} size={22} color={Colors.primary} />
                        </View>
                        <View style={styles.rowCopy}>
                            <Text style={styles.rowTitle}>{row.title}</Text>
                            <Text style={styles.rowDesc}>{row.desc}</Text>
                        </View>
                        {row.action ? <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} /> : null}
                    </TouchableOpacity>
                ))}
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
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.82)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { ...Typography.h3, color: Colors.textPrimary },
    headerSpacer: { width: 44 },
    content: { padding: Spacing.base, paddingBottom: 140 },
    heroCard: {
        backgroundColor: 'rgba(255,255,255,0.82)',
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.xl,
        alignItems: 'center',
        marginBottom: Spacing.base,
    },
    heroTitle: { ...Typography.h4, color: Colors.textPrimary, marginTop: Spacing.sm },
    heroText: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center', marginTop: 6 },
    rowCard: {
        backgroundColor: 'rgba(255,255,255,0.82)',
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.base,
    },
    iconWrap: {
        width: 46,
        height: 46,
        borderRadius: 15,
        backgroundColor: '#FDF0E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowCopy: { flex: 1, marginLeft: Spacing.sm },
    rowTitle: { ...Typography.labelLarge, color: Colors.textPrimary },
    rowDesc: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4 },
});

export default SupportScreen;
