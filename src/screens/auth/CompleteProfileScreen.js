import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import AppButton from '../../components/common/AppButton';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';

const CompleteProfileScreen = () => {
    const { completeProfile, user } = useAuthStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        if (!name.trim()) {
            alert('Please enter your full name');
            return;
        }
        setLoading(true);
        const res = await completeProfile(name.trim(), email.trim());
        setLoading(false);
        if (!res.success) {
            alert(res.error || 'Failed to save profile');
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.authHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="person-add" size={40} color={Colors.primary} />
                        </View>
                        <Text style={styles.authTitle}>Complete Profile</Text>
                        <Text style={styles.authSubtitle}>Tell us a bit about yourself</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor={Colors.textMuted}
                                value={name}
                                onChangeText={setName}
                                autoFocus
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address (Optional)</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Your email for receipts"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    <AppButton
                        title="Get Started"
                        onPress={handleComplete}
                        loading={loading}
                        disabled={name.trim().length === 0}
                        style={styles.submitBtn}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    container: { flex: 1 },
    authContainer: {
        flexGrow: 1,
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing['3xl'],
        paddingBottom: Spacing['3xl'],
    },
    authHeader: { alignItems: 'center', marginBottom: Spacing['2xl'] },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius['2xl'],
        backgroundColor: `${Colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    authTitle: {
        ...Typography.h1,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    authSubtitle: {
        ...Typography.bodyLarge,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: Spacing.xl,
    },
    label: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.sm,
        height: 52,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        ...Typography.bodyLarge,
        color: Colors.textPrimary,
        height: '100%',
    },
    submitBtn: {
        marginTop: Spacing.lg,
        width: '100%',
    },
});

export default CompleteProfileScreen;
