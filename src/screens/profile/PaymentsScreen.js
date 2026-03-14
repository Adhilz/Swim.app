import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { PAYMENT_METHODS } from '../../data/mockData';

const PaymentsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Methods</Text>
                <View style={styles.headerSpacer} />
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {PAYMENT_METHODS.map(method => (
                    <View key={method.id} style={styles.methodCard}>
                        <View style={styles.iconWrap}>
                            <Ionicons name={method.icon} size={22} color={Colors.primary} />
                        </View>
                        <View style={styles.methodCopy}>
                            <Text style={styles.methodName}>{method.name}</Text>
                            <Text style={styles.methodDesc}>{method.desc}</Text>
                        </View>
                        {method.id === 'upi' ? (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>Recommended</Text>
                            </View>
                        ) : null}
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
    methodCard: {
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
    methodCopy: { flex: 1, marginLeft: Spacing.sm },
    methodName: { ...Typography.labelLarge, color: Colors.textPrimary },
    methodDesc: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4 },
    badge: {
        backgroundColor: '#FDF0E1',
        borderRadius: BorderRadius.full,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    badgeText: { ...Typography.labelSmall, color: Colors.primaryDark },
});

export default PaymentsScreen;
