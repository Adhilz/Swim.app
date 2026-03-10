// ─────────────────────────────────────────────
//  Screen: Onboarding + Auth (Phone + OTP)
// ─────────────────────────────────────────────
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Animated,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import AppButton from '../../components/common/AppButton';
import { useAuthStore } from '../../store/authStore';

const { width: W, height: H } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
    {
        id: '1',
        title: 'Everything,\nDelivered Fast',
        subtitle: 'Food, groceries, medicine and more — at your doorstep in minutes.',
        icon: 'restaurant',
        color: Colors.food,
        gradient: ['#F47B25', '#E55A00'],
    },
    {
        id: '2',
        title: 'Health at\nYour Door',
        subtitle: 'Order medicines, upload prescriptions, and get healthcare products instantly.',
        icon: 'medical',
        color: Colors.pharmacy,
        gradient: ['#22C55E', '#16A34A'],
    },
    {
        id: '3',
        title: 'Shop Local,\nShop Smart',
        subtitle: 'Discover the best local stores, supermarkets, and boutiques near you.',
        icon: 'bag',
        color: Colors.shopping,
        gradient: ['#A855F7', '#7C3AED'],
    },
];

const OnboardingScreen = ({ navigation }) => {
    const [step, setStep] = useState('onboard'); // onboard | phone | otp
    const [slideIndex, setSlideIndex] = useState(0);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);
    const otpRefs = [useRef(), useRef(), useRef(), useRef()];
    const { login } = useAuthStore();

    const handleSlideChange = (e) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / W);
        setSlideIndex(index);
    };

    const handleNextSlide = () => {
        if (slideIndex < ONBOARDING_SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: slideIndex + 1, animated: true });
        } else {
            setStep('phone');
        }
    };

    const handleSendOtp = async () => {
        if (phone.length < 10) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        setStep('otp');
    };

    const handleOtpChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 3) otpRefs[index + 1].current?.focus();
        if (!text && index > 0) otpRefs[index - 1].current?.focus();
    };

    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code.length < 4) return;
        setLoading(true);
        await login(phone, code);
        setLoading(false);
    };

    // ── Onboarding Slide ──────────────────────
    const renderSlide = ({ item }) => (
        <View style={[styles.slide, { width: W }]}>
            <LinearGradient
                colors={[`${item.color}20`, Colors.background]}
                style={StyleSheet.absoluteFill}
            />
            <View style={[styles.illustrationCircle, { backgroundColor: `${item.color}15` }]}>
                <LinearGradient colors={item.gradient} style={styles.iconGradient}>
                    <Ionicons name={item.icon} size={72} color={Colors.white} />
                </LinearGradient>
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </View>
    );

    // ── OTP Input ─────────────────────────────
    const renderOtpBox = (index) => (
        <TextInput
            key={index}
            ref={otpRefs[index]}
            style={[
                styles.otpBox,
                otp[index] ? styles.otpBoxFilled : null,
            ]}
            maxLength={1}
            keyboardType="number-pad"
            value={otp[index]}
            onChangeText={(t) => handleOtpChange(t, index)}
            textAlign="center"
            selectionColor={Colors.primary}
        />
    );

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {/* ── Onboarding ── */}
                {step === 'onboard' && (
                    <View style={{ flex: 1 }}>
                        {/* App Logo */}
                        <View style={styles.logoRow}>
                            <LinearGradient colors={Colors.primaryGradient} style={styles.logoIcon}>
                                <Ionicons name="flash" size={20} color={Colors.white} />
                            </LinearGradient>
                            <Text style={styles.logoText}>QuickCart</Text>
                        </View>

                        <FlatList
                            ref={flatListRef}
                            data={ONBOARDING_SLIDES}
                            renderItem={renderSlide}
                            keyExtractor={i => i.id}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleSlideChange}
                            scrollEventThrottle={16}
                            style={{ flex: 1 }}
                        />

                        {/* Dots + Navigation */}
                        <View style={styles.onboardFooter}>
                            <View style={styles.dots}>
                                {ONBOARDING_SLIDES.map((_, i) => (
                                    <View
                                        key={i}
                                        style={[styles.dot, i === slideIndex && styles.dotActive]}
                                    />
                                ))}
                            </View>
                            <AppButton
                                title={slideIndex === ONBOARDING_SLIDES.length - 1 ? "Get Started" : "Next"}
                                onPress={handleNextSlide}
                                size="md"
                                style={{ paddingHorizontal: Spacing['2xl'] }}
                            />
                            {slideIndex < ONBOARDING_SLIDES.length - 1 && (
                                <TouchableOpacity onPress={() => setStep('phone')} style={styles.skipBtn}>
                                    <Text style={styles.skipText}>Skip</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* ── Phone Number ── */}
                {step === 'phone' && (
                    <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
                        <TouchableOpacity onPress={() => setStep('onboard')} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>

                        <View style={styles.authHeader}>
                            <LinearGradient colors={Colors.primaryGradient} style={styles.authIcon}>
                                <Ionicons name="flash" size={32} color={Colors.white} />
                            </LinearGradient>
                            <Text style={styles.authTitle}>Enter your{'\n'}mobile number</Text>
                            <Text style={styles.authSubtitle}>We'll send a 4-digit OTP to verify your number</Text>
                        </View>

                        {/* Phone Input */}
                        <View style={styles.phoneRow}>
                            <View style={styles.countryCode}>
                                <Text style={styles.countryFlag}>🇮🇳</Text>
                                <Text style={styles.countryCodeText}>+91</Text>
                                <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
                            </View>
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="10-digit mobile number"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={phone}
                                onChangeText={setPhone}
                                selectionColor={Colors.primary}
                            />
                        </View>

                        <AppButton
                            title="Send OTP"
                            onPress={handleSendOtp}
                            loading={loading}
                            disabled={phone.length < 10}
                            style={styles.authBtn}
                        />

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login */}
                        <View style={styles.socialRow}>
                            {[
                                { name: 'Google', icon: 'logo-google', color: '#EA4335' },
                                { name: 'Apple', icon: 'logo-apple', color: Colors.white },
                            ].map(s => (
                                <TouchableOpacity key={s.name} style={styles.socialBtn}>
                                    <Ionicons name={s.icon} size={22} color={s.color} />
                                    <Text style={styles.socialText}>{s.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.termsText}>
                            By continuing, you agree to our{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    </ScrollView>
                )}

                {/* ── OTP Verification ── */}
                {step === 'otp' && (
                    <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
                        <TouchableOpacity onPress={() => setStep('phone')} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>

                        <View style={styles.authHeader}>
                            <View style={styles.otpIconContainer}>
                                <Text style={styles.otpEmoji}>📱</Text>
                            </View>
                            <Text style={styles.authTitle}>Verify OTP</Text>
                            <Text style={styles.authSubtitle}>
                                Enter the 4-digit code sent to{'\n'}
                                <Text style={{ color: Colors.primary }}>+91 {phone}</Text>
                            </Text>
                        </View>

                        {/* OTP Boxes */}
                        <View style={styles.otpRow}>
                            {[0, 1, 2, 3].map(renderOtpBox)}
                        </View>

                        <AppButton
                            title="Verify & Continue"
                            onPress={handleVerifyOtp}
                            loading={loading}
                            disabled={otp.some(d => !d)}
                            style={styles.authBtn}
                        />

                        <View style={styles.resendRow}>
                            <Text style={styles.resendText}>Didn't receive OTP? </Text>
                            <TouchableOpacity onPress={handleSendOtp}>
                                <Text style={styles.resendLink}>Resend OTP</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    container: { flex: 1 },

    // Logo
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.base,
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    logoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    logoText: { ...Typography.h3, color: Colors.textPrimary },

    // Slide
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing['2xl'],
    },
    illustrationCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing['3xl'],
    },
    iconGradient: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slideTitle: {
        ...Typography.displaySmall,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.base,
    },
    slideSubtitle: {
        ...Typography.bodyLarge,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
    },

    // Onboard footer
    onboardFooter: {
        alignItems: 'center',
        paddingBottom: Spacing['2xl'],
        paddingHorizontal: Spacing.base,
        gap: Spacing.base,
    },
    dots: { flexDirection: 'row', gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
    dotActive: { width: 24, backgroundColor: Colors.primary },
    skipBtn: { padding: Spacing.sm },
    skipText: { ...Typography.bodyMedium, color: Colors.textSecondary },

    // Auth common
    authContainer: {
        flexGrow: 1,
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing['3xl'],
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
    },
    authHeader: { alignItems: 'center', marginBottom: Spacing['2xl'] },
    authIcon: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius['2xl'],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    otpIconContainer: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius['2xl'],
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    otpEmoji: { fontSize: 40 },
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
        lineHeight: 24,
    },

    // Phone Input
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.sm,
        marginBottom: Spacing.xl,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingRight: Spacing.sm,
        borderRightWidth: 1,
        borderRightColor: Colors.border,
        marginRight: Spacing.sm,
        height: 40,
    },
    countryFlag: { fontSize: 20 },
    countryCodeText: { ...Typography.bodyLarge, color: Colors.textPrimary },
    phoneInput: {
        flex: 1,
        ...Typography.bodyLarge,
        color: Colors.textPrimary,
        height: 40,
    },

    authBtn: { width: '100%' },

    // Divider
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl, gap: Spacing.sm },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    dividerText: { ...Typography.bodySmall, color: Colors.textMuted },

    // Social
    socialRow: { flexDirection: 'row', gap: Spacing.base, marginBottom: Spacing.xl },
    socialBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.base,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    socialText: { ...Typography.labelLarge, color: Colors.textPrimary },

    // Terms
    termsText: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
    termsLink: { color: Colors.primary, fontWeight: '600' },

    // OTP
    otpRow: { flexDirection: 'row', gap: Spacing.base, justifyContent: 'center', marginBottom: Spacing.xl },
    otpBox: {
        width: 64,
        height: 72,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        borderColor: Colors.border,
        ...Typography.h2,
        color: Colors.textPrimary,
    },
    otpBoxFilled: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}15` },
    resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
    resendText: { ...Typography.bodyMedium, color: Colors.textSecondary },
    resendLink: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '600' },
});

export default OnboardingScreen;
