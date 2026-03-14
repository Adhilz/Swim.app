import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useRequestStore } from '../../store/requestStore';

const RequestDeliveryScreen = ({ navigation }) => {
    const user = useAuthStore(state => state.user);
    const selectedAddress = useAuthStore(state => state.selectedAddress);
    const showToast = useToastStore(state => state.showToast);
    const addRequest = useRequestStore(state => state.addRequest);
    const [pickupItem, setPickupItem] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [dropoffLocation, setDropoffLocation] = useState(
        selectedAddress ? `${selectedAddress.addressLine1}, ${selectedAddress.addressLine2}` : ''
    );
    const [instructions, setInstructions] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (selectedAddress) {
            setDropoffLocation(`${selectedAddress.addressLine1}, ${selectedAddress.addressLine2}`);
        }
    }, [selectedAddress]);

    const canContinue = useMemo(() => {
        return pickupItem.trim() && pickupLocation.trim() && dropoffLocation.trim();
    }, [dropoffLocation, pickupItem, pickupLocation]);

    const handleContinue = () => {
        if (!pickupItem.trim()) {
            Alert.alert('Missing details', 'Please tell us what needs to be picked up.');
            return;
        }

        if (!pickupLocation.trim()) {
            Alert.alert('Missing pickup', 'Please add the pickup location.');
            return;
        }

        if (!dropoffLocation.trim()) {
            showToast({
                type: 'info',
                title: 'Delivery address needed',
                message: 'Choose a drop-off address before continuing.',
            });
            navigation.navigate('AddressSelect');
            return;
        }

        setSubmitting(true);
        addRequest({
            userId: user?.id || null,
            pickupItem: pickupItem.trim(),
            pickupLocation: pickupLocation.trim(),
            dropoffLocation: dropoffLocation.trim(),
            instructions: instructions.trim(),
            dropoffAddress: selectedAddress || null,
        });
        setSubmitting(false);
        showToast({
            type: 'success',
            title: 'Request saved',
            message: 'Your delivery request has been saved and added to your orders flow.',
        });
        navigation.navigate('Orders');
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <View style={styles.bgOrbTop} />
            <View style={styles.bgOrbSide} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Home')}>
                    <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Request Delivery</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.heroTitle}>Deliver Anything</Text>

                <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>What are we picking up?</Text>
                    <View style={styles.fieldShell}>
                        <TextInput
                            value={pickupItem}
                            onChangeText={setPickupItem}
                            placeholder="e.g. A bouquet of flowers, forgotten keys..."
                            placeholderTextColor={Colors.textMuted}
                            style={[styles.input, styles.textArea]}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Pickup Location</Text>
                    <TouchableOpacity
                        style={[styles.fieldShell, styles.rowShell]}
                        activeOpacity={0.95}
                        onPress={() => {}}
                    >
                        <TextInput
                            value={pickupLocation}
                            onChangeText={setPickupLocation}
                            placeholder="Enter pickup address"
                            placeholderTextColor={Colors.textMuted}
                            style={styles.input}
                        />
                        <MaterialIcons name="location-on" size={22} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Drop-off Location</Text>
                    <TouchableOpacity
                        style={[styles.fieldShell, styles.rowShell]}
                        activeOpacity={0.95}
                        onPress={() => navigation.navigate('AddressSelect')}
                    >
                        <TextInput
                            value={dropoffLocation}
                            onChangeText={setDropoffLocation}
                            placeholder="Enter destination address"
                            placeholderTextColor={Colors.textMuted}
                            style={styles.input}
                            editable={false}
                            pointerEvents="none"
                        />
                        <MaterialIcons name="flag" size={22} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Instructions for Delivery Partner</Text>
                    <View style={styles.fieldShell}>
                        <TextInput
                            value={instructions}
                            onChangeText={setInstructions}
                            placeholder="Door code, specific entrance, etc."
                            placeholderTextColor={Colors.textMuted}
                            style={styles.input}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
                    onPress={handleContinue}
                    activeOpacity={0.9}
                    disabled={!canContinue || submitting}
                >
                    <Text style={styles.primaryButtonText}>{submitting ? 'Saving...' : 'Next'}</Text>
                    <MaterialIcons name="arrow-forward" size={20} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    bgOrbTop: {
        position: 'absolute',
        top: -36,
        right: -28,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(244,140,37,0.1)',
    },
    bgOrbSide: {
        position: 'absolute',
        left: -80,
        top: '48%',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(244,140,37,0.06)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.sm,
    },
    headerButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.74)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 7,
    },
    headerTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    headerSpacer: {
        width: 48,
    },
    content: {
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.xl,
        paddingBottom: 140,
    },
    heroTitle: {
        ...Typography.displaySmall,
        color: Colors.textPrimary,
        marginBottom: Spacing.xl,
    },
    fieldBlock: {
        marginBottom: Spacing.xl,
    },
    fieldLabel: {
        ...Typography.labelMedium,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        paddingHorizontal: 4,
    },
    fieldShell: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: BorderRadius['2xl'],
        padding: 6,
        shadowColor: '#D8CCC0',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 18,
        elevation: 8,
    },
    rowShell: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: Spacing.base,
    },
    input: {
        ...Typography.bodyMedium,
        color: Colors.textPrimary,
        backgroundColor: 'rgba(255,255,255,0.55)',
        borderRadius: BorderRadius.xl,
        minHeight: 56,
        paddingHorizontal: Spacing.base,
        flex: 1,
    },
    textArea: {
        minHeight: 128,
        paddingTop: Spacing.base,
    },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.base,
        paddingBottom: Spacing.xl,
        backgroundColor: 'rgba(248,247,245,0.96)',
    },
    primaryButton: {
        height: 64,
        borderRadius: BorderRadius['2xl'],
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.24,
        shadowRadius: 18,
        elevation: 10,
    },
    primaryButtonDisabled: {
        opacity: 0.85,
    },
    primaryButtonText: {
        ...Typography.h4,
        color: Colors.white,
    },
});

export default RequestDeliveryScreen;
