// ─────────────────────────────────────────────
//  Screen: Order Tracking (Live)
// ─────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ScrollView,
    StatusBar,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import AppButton from '../../components/common/AppButton';

const STATUS_STEPS = [
    { id: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle', desc: 'Order accepted' },
    { id: 'preparing', label: 'Preparing', icon: 'restaurant', desc: 'Kitchen at work' },
    { id: 'pickup', label: 'Picked Up', icon: 'bicycle', desc: 'On the way' },
    { id: 'delivered', label: 'Delivered', icon: 'home', desc: 'At your door' },
];

const MOCK_PARTNER = {
    name: 'Rajan Kumar',
    rating: 4.9,
    vehicle: 'Electric Scooter',
    phone: '+91 9876543210',
    totalDeliveries: 1240,
};

const OrderTrackingScreen = ({ route, navigation }) => {
    const { orderId } = route.params || {};
    const [currentStep, setCurrentStep] = useState(1);
    const [eta, setEta] = useState(14);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const mapMoveAnim = useRef(new Animated.Value(0)).current;

    // Simulate order progression
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentStep(prev => (prev < STATUS_STEPS.length - 1 ? prev + 1 : prev));
            setEta(prev => Math.max(0, prev - 3));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Pulse animation for live indicator
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // Animate delivery pin
    useEffect(() => {
        const move = Animated.loop(
            Animated.sequence([
                Animated.timing(mapMoveAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
                Animated.timing(mapMoveAnim, { toValue: 0.7, duration: 2000, useNativeDriver: true }),
            ])
        );
        move.start();
        return () => move.stop();
    }, []);

    const partnerTranslateX = mapMoveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 120], // Adjusted relative to starting position
    });

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Tracking Order</Text>
                    <Text style={styles.orderId}>#{orderId || 'ORD001'}</Text>
                </View>
                <View style={styles.liveChip}>
                    <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
                    <Text style={styles.liveText}>LIVE</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* ── Progress Steps ── */}
                <View style={styles.stepsContainer}>
                    {STATUS_STEPS.map((step, index) => {
                        const isDone = index < currentStep;
                        const isActive = index === currentStep;
                        const color = isDone || isActive ? Colors.primary : Colors.border;

                        return (
                            <React.Fragment key={step.id}>
                                <View style={styles.stepItem}>
                                    <View style={[
                                        styles.stepCircle,
                                        { borderColor: color, backgroundColor: isDone ? Colors.primary : isActive ? `${Colors.primary}20` : Colors.surface }
                                    ]}>
                                        <Ionicons
                                            name={step.icon}
                                            size={16}
                                            color={isDone ? Colors.white : isActive ? Colors.primary : Colors.textMuted}
                                        />
                                    </View>
                                    <View style={styles.stepInfo}>
                                        <Text style={[styles.stepLabel, { color: isDone || isActive ? Colors.textPrimary : Colors.textMuted }]}>
                                            {step.label}
                                        </Text>
                                        <Text style={styles.stepDesc}>{step.desc}</Text>
                                    </View>
                                    {(isDone || isActive) && (
                                        <Ionicons name={isDone ? 'checkmark-circle' : 'time'} size={18} color={color} />
                                    )}
                                </View>
                                {index < STATUS_STEPS.length - 1 && (
                                    <View style={[styles.stepConnector, { backgroundColor: isDone ? Colors.primary : Colors.border }]} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </View>

                {/* ── ETA ── */}
                <View style={styles.etaCard}>
                    <LinearGradient colors={Colors.primaryGradient} style={styles.etaGradient}>
                        {eta > 0 ? (
                            <>
                                <Text style={styles.etaLabel}>Estimated Arrival</Text>
                                <Text style={styles.etaTime}>{eta} min</Text>
                                <Text style={styles.etaSub}>Your order is on the way! 🚀</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={40} color={Colors.white} />
                                <Text style={styles.etaTime}>Delivered!</Text>
                                <Text style={styles.etaSub}>Enjoy your order 🎉</Text>
                            </>
                        )}
                    </LinearGradient>
                </View>

                {/* ── Animated Map ── */}
                <View style={styles.mapCard}>
                    <View style={styles.mapPlaceholder}>
                        {/* Simulated map grid */}
                        {[...Array(6)].map((_, i) => (
                            <View key={`h${i}`} style={[styles.mapGridLine, styles.mapGridH, { top: `${i * 20}%` }]} />
                        ))}
                        {[...Array(6)].map((_, i) => (
                            <View key={`v${i}`} style={[styles.mapGridLine, styles.mapGridV, { left: `${i * 20}%` }]} />
                        ))}

                        {/* Roads */}
                        <View style={styles.mapRoad1} />
                        <View style={styles.mapRoad2} />

                        {/* Delivery partner pin (animated) */}
                        <Animated.View style={[styles.deliveryPin, { transform: [{ translateX: partnerTranslateX }] }]}>
                            <LinearGradient colors={Colors.primaryGradient} style={styles.deliveryPinGradient}>
                                <Ionicons name="bicycle" size={16} color={Colors.white} />
                            </LinearGradient>
                        </Animated.View>

                        {/* Destination pin */}
                        <View style={styles.destinationPin}>
                            <Ionicons name="location" size={28} color={Colors.error} />
                            <View style={styles.destPinShadow} />
                        </View>

                        <View style={styles.mapOverlay}>
                            <Text style={styles.mapLabel}>{'Live Map'}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Delivery Partner ── */}
                <View style={styles.partnerCard}>
                    <View style={styles.partnerAvatar}>
                        <LinearGradient colors={Colors.primaryGradient} style={styles.avatarGradient}>
                            <Text style={styles.avatarInitial}>{MOCK_PARTNER.name.charAt(0)}</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.partnerInfo}>
                        <Text style={styles.partnerName}>{MOCK_PARTNER.name}</Text>
                        <View style={styles.partnerMeta}>
                            <Ionicons name="star" size={12} color={Colors.star} />
                            <Text style={styles.partnerRating}>{MOCK_PARTNER.rating}</Text>
                            <Text style={styles.partnerSep}>•</Text>
                            <Text style={styles.partnerVehicle}>{MOCK_PARTNER.vehicle}</Text>
                        </View>
                    </View>
                    <View style={styles.partnerActions}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => Linking.openURL(`tel:${MOCK_PARTNER.phone}`)}
                        >
                            <Ionicons name="call" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: `${Colors.info}15` }]}>
                            <Ionicons name="chatbubble" size={18} color={Colors.info} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Footer Actions ── */}
                <View style={styles.footerActions}>
                    <AppButton
                        title="Cancel Order"
                        variant="outline"
                        size="sm"
                        onPress={() => navigation.goBack()}
                        style={{ flex: 1 }}
                    />
                    <AppButton
                        title="Contact Support"
                        variant="secondary"
                        size="sm"
                        onPress={() => navigation.navigate('Support')}
                        style={{ flex: 1 }}
                    />
                </View>
            </ScrollView>
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
        gap: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { ...Typography.h5, color: Colors.textPrimary },
    orderId: { ...Typography.caption, color: Colors.textSecondary },
    liveChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: `${Colors.error}20`,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        marginLeft: 'auto',
    },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error },
    liveText: { ...Typography.labelSmall, color: Colors.error },

    // Steps
    stepsContainer: { padding: Spacing.base },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    stepCircle: {
        width: 36, height: 36, borderRadius: 18,
        borderWidth: 2,
        alignItems: 'center', justifyContent: 'center',
    },
    stepInfo: { flex: 1 },
    stepLabel: { ...Typography.labelLarge },
    stepDesc: { ...Typography.caption, color: Colors.textMuted },
    stepConnector: {
        width: 2, height: 24,
        marginLeft: 17,
        marginVertical: 2,
    },

    // ETA
    etaCard: {
        marginHorizontal: Spacing.base,
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
        marginBottom: Spacing.base,
    },
    etaGradient: {
        alignItems: 'center',
        padding: Spacing.xl,
    },
    etaLabel: { ...Typography.labelLarge, color: 'rgba(255,255,255,0.8)' },
    etaTime: {
        ...Typography.displayMedium,
        color: Colors.white,
        marginVertical: Spacing.xs,
    },
    etaSub: { ...Typography.bodyMedium, color: 'rgba(255,255,255,0.9)' },

    // Map
    mapCard: {
        marginHorizontal: Spacing.base,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.base,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    mapPlaceholder: {
        height: 200,
        backgroundColor: '#0A0A18',
        position: 'relative',
        overflow: 'hidden',
    },
    mapGridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.04)' },
    mapGridH: { left: 0, right: 0, height: 1 },
    mapGridV: { top: 0, bottom: 0, width: 1 },
    mapRoad1: {
        position: 'absolute',
        top: '45%',
        left: 0,
        right: 0,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    mapRoad2: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '55%',
        width: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    deliveryPin: {
        position: 'absolute',
        top: '35%',
        left: 80, // Base position for translate
        ...Shadows.primary,
    },
    deliveryPinGradient: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    destinationPin: {
        position: 'absolute',
        right: 50,
        top: '20%',
        alignItems: 'center',
    },
    destPinShadow: {
        width: 12, height: 4,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 6,
        marginTop: -4,
    },
    mapOverlay: {
        position: 'absolute',
        bottom: Spacing.sm,
        left: Spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    mapLabel: { ...Typography.caption, color: Colors.textSecondary },

    // Partner
    partnerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.base,
        marginHorizontal: Spacing.base,
        marginBottom: Spacing.base,
        gap: Spacing.sm,
        ...Shadows.md,
    },
    partnerAvatar: {},
    avatarGradient: {
        width: 52, height: 52, borderRadius: 26,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarInitial: { ...Typography.h3, color: Colors.white },
    partnerInfo: { flex: 1 },
    partnerName: { ...Typography.labelLarge, color: Colors.textPrimary },
    partnerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    partnerRating: { ...Typography.caption, color: Colors.star },
    partnerSep: { ...Typography.caption, color: Colors.textMuted },
    partnerVehicle: { ...Typography.caption, color: Colors.textSecondary },
    partnerActions: { flexDirection: 'row', gap: Spacing.sm },
    actionBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: `${Colors.primary}15`,
        alignItems: 'center', justifyContent: 'center',
    },

    // Footer
    footerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.base,
    },
});

export default OrderTrackingScreen;
