// ─────────────────────────────────────────────
//  Screen: Splash Logo → Phone → OTP
//  No onboarding slides — just Swim.ai branding
// ─────────────────────────────────────────────
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useState, useRef, useEffect } from 'react';
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
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import AppButton from '../../components/common/AppButton';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';

const { width: W, height: H } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
    const [step, setStep] = useState('splash'); // splash | phone | otp
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
    const { sendOtp, verifyOtp, continueWithGoogle } = useAuthStore();
    const showToast = useToastStore(s => s.showToast);

    // ── Splash animations ────────────────────
    const logoScale = useRef(new Animated.Value(0.3)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const splashVideoPlayer = useVideoPlayer(
        require('../../../assets/Wave_Video_Generation_With_Logo.mp4'),
        (player) => {
            player.loop = true;
            player.muted = true;
            player.play();
        }
    );

    useEffect(() => {
        if (step === 'splash') {
            // Logo entrance
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start();

            // Tagline fade in
            setTimeout(() => {
                Animated.timing(taglineOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }).start();
            }, 600);

            // Glow pulse
            setTimeout(() => {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(glowOpacity, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
                        Animated.timing(glowOpacity, { toValue: 0.2, duration: 1200, useNativeDriver: true }),
                    ])
                ).start();
            }, 400);

            // Auto-transition to phone after 2.5s
            const timer = setTimeout(() => {
                setStep('phone');
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [step]);

    const handleSendOtp = async () => {
        if (phone.length < 10) return;
        setLoading(true);
        const res = await sendOtp(phone);
        setLoading(false);
        if (res.success) {
            setStep('otp');
        } else {
            showToast({
                type: 'error',
                title: 'OTP Failed',
                message: res.error || 'Failed to send OTP code.',
            });
        }
    };

    const handleOtpChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 5) otpRefs[index + 1].current?.focus();
        if (!text && index > 0) otpRefs[index - 1].current?.focus();
    };

    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code.length < 6) return;
        setLoading(true);
        const res = await verifyOtp(phone, code);
        setLoading(false);
        if (!res.success) {
            showToast({
                type: 'error',
                title: 'Invalid OTP',
                message: res.error || 'Invalid OTP code.',
            });
        }
    };

    // ── OTP Input Box ────────────────────────
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
                {/* ════════════════════════════════════════
                     SPLASH — Swim.ai Logo Only
                   ════════════════════════════════════════ */}
                {step === 'splash' && (
                    <View style={styles.splashContainer}>
                        <LinearGradient
                            colors={['#010409', '#0D1117', '#010409']}
                            style={StyleSheet.absoluteFill}
                        />

                        {/* Animated glow ring behind logo */}
                        <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]}>
                            <LinearGradient
                                colors={['transparent', `${Colors.primary}30`, 'transparent']}
                                style={styles.glowGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                        </Animated.View>

                        {/* Wave video instead of logo */}
                        <Animated.View style={[
                            styles.splashLogoWrap,
                            {
                                transform: [{ scale: logoScale }],
                                opacity: logoOpacity,
                            }
                        ]}>
                            <VideoView
                                player={splashVideoPlayer}
                                style={styles.splashLogo}
                                contentFit="cover"
                                nativeControls={false}
                                allowsFullscreen={false}
                            />
                        </Animated.View>

                        {/* App Name */}
                        <Animated.View style={{ opacity: logoOpacity, marginTop: Spacing.xl }}>
                            <Text style={styles.splashName}>Swim.ai</Text>
                        </Animated.View>

                        {/* Tagline */}
                        <Animated.View style={{ opacity: taglineOpacity, marginTop: Spacing.sm }}>
                            <Text style={styles.splashTagline}>Everything delivered. Ernakulam.</Text>
                        </Animated.View>

                        {/* Skip to sign in */}
                        <Animated.View style={[styles.splashSkip, { opacity: taglineOpacity }]}>
                            <TouchableOpacity onPress={() => setStep('phone')}>
                                <Text style={styles.splashSkipText}>Tap to continue →</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                )}

                {/* ════════════════════════════════════════
                     LOGIN OPTIONS
                   ════════════════════════════════════════ */}
                {step === 'phone' && (
                    <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
                        <View style={styles.authHeader}>
                            <Image source={require('../../../assets/logo.png')} style={styles.authLogo} />
                            <Text style={styles.authTitle}>Welcome to Swim</Text>
                            <Text style={styles.authSubtitle}>Sign in or create an account to get started</Text>
                        </View>

                        {/* Social Login Main */}
                        <TouchableOpacity 
                            style={styles.googleBtn}
                            onPress={async () => {
                                const res = await continueWithGoogle();
                                if (!res.success) {
                                    showToast({
                                        type: 'error',
                                        title: 'Google sign-in failed',
                                        message: res.error || 'Failed to authenticate with Google',
                                    });
                                }
                            }}
                            disabled={loading}
                        >
                            <Ionicons name="logo-google" size={22} color={Colors.surface} style={{ marginRight: Spacing.sm }} />
                            <Text style={styles.googleBtnText}>Continue with Google</Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with mobile</Text>
                            <View style={styles.dividerLine} />
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

                        <Text style={[styles.termsText, { marginTop: Spacing.xl }]}>
                            By continuing, you agree to our{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    </ScrollView>
                )}

                {/* ════════════════════════════════════════
                     OTP VERIFICATION
                   ════════════════════════════════════════ */}
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
                                Enter the 6-digit code sent to{'\n'}
                                <Text style={{ color: Colors.primary }}>+91 {phone}</Text>
                            </Text>
                        </View>

                        {/* OTP Boxes */}
                        <View style={styles.otpRow}>
                            {[0, 1, 2, 3, 4, 5].map(renderOtpBox)}
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

    // ── Splash ───────────────────────────────
    splashContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowRing: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        overflow: 'hidden',
    },
    glowGradient: {
        width: '100%',
        height: '100%',
    },
    splashLogoWrap: {
        width: 120,
        height: 120,
        borderRadius: 30,
        overflow: 'hidden',
        ...Shadows.primary,
        shadowRadius: 30,
    },
    splashLogo: {
        width: 120,
        height: 120,
    },
    splashName: {
        ...Typography.h1,
        color: Colors.white,
        fontSize: 42,
        fontWeight: '800',
        letterSpacing: -1,
    },
    splashTagline: {
        ...Typography.bodyLarge,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    splashSkip: {
        position: 'absolute',
        bottom: 60,
    },
    splashSkipText: {
        ...Typography.bodyMedium,
        color: Colors.primaryLight,
        opacity: 0.8,
    },

    // ── Auth common ──────────────────────────
    authContainer: {
        flexGrow: 1,
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing['3xl'],
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
    authLogo: {
        width: 100,
        height: 100,
        borderRadius: 25,
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

    // ── Phone Input ──────────────────────────
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

    // ── Divider ──────────────────────────────
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl, gap: Spacing.sm },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    dividerText: { ...Typography.bodySmall, color: Colors.textMuted },

    // ── Google ───────────────────────────────
    googleBtn: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        paddingVertical: 14,
        marginBottom: Spacing.md,
    },
    googleBtnText: { ...Typography.labelLarge, color: Colors.background, fontWeight: '700' },

    // ── Social ───────────────────────────────
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

    // ── Terms ────────────────────────────────
    termsText: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
    termsLink: { color: Colors.primary, fontWeight: '600' },

    // ── OTP ──────────────────────────────────
    otpRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', marginBottom: Spacing.xl },
    otpBox: {
        width: 48,
        height: 56,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        borderColor: Colors.border,
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    otpBoxFilled: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}15` },
    resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
    resendText: { ...Typography.bodyMedium, color: Colors.textSecondary },
    resendLink: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '600' },
});

export default OnboardingScreen;
