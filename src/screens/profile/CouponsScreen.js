import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { PROMO_CODES } from '../../data/mockData';

const entries = Object.entries(PROMO_CODES);

const CouponsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Offers & Coupons</Text>
                <View style={styles.headerSpacer} />
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {entries.map(([code, cfg]) => (
                    <View key={code} style={styles.card}>
                        <View style={styles.topRow}>
                            <View style={styles.codePill}>
                                <Text style={styles.codeText}>{code}</Text>
                            </View>
                            <Ionicons name="pricetag-outline" size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.title}>
                            {cfg.freeDelivery ? 'Free Delivery' : `${Math.round(cfg.discount * 100)}% OFF up to Rs ${cfg.maxDiscount}`}
                        </Text>
                        <Text style={styles.desc}>Apply this code at checkout to unlock the offer.</Text>
                    </View>
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
    card: {
        backgroundColor: 'rgba(255,255,255,0.82)',
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.base,
        marginBottom: Spacing.base,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    codePill: {
        backgroundColor: '#FDF0E1',
        borderRadius: BorderRadius.full,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    codeText: { ...Typography.labelSmall, color: Colors.primaryDark },
    title: { ...Typography.labelLarge, color: Colors.textPrimary },
    desc: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 6 },
});

export default CouponsScreen;
