import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import { useToastStore } from '../../store/toastStore';

const { width: W } = Dimensions.get('window');

const iconForType = (type) => {
    if (type === 'success') return { name: 'checkmark-circle', color: Colors.success };
    if (type === 'error') return { name: 'alert-circle', color: Colors.error };
    return { name: 'information-circle', color: Colors.primary };
};

const ToastHost = () => {
    const toasts = useToastStore(state => state.toasts);
    const hideToast = useToastStore(state => state.hideToast);

    useEffect(() => {
        if (!toasts.length) return;
        const timers = toasts.map(toast =>
            setTimeout(() => hideToast(toast.id), toast.duration || 3000)
        );
        return () => {
            timers.forEach(t => clearTimeout(t));
        };
    }, [toasts, hideToast]);

    if (!toasts.length) return null;

    return (
        <SafeAreaView pointerEvents="box-none" style={styles.safe} edges={['top']}>
            <View pointerEvents="box-none" style={styles.container}>
                {toasts.map(toast => {
                    const iconMeta = iconForType(toast.type);
                    return (
                        <Animated.View key={toast.id} style={styles.toast}>
                            <LinearGradient
                                colors={
                                    toast.type === 'error'
                                        ? ['#EF4444', '#B91C1C']
                                        : toast.type === 'success'
                                            ? ['#22C55E', '#15803D']
                                            : Colors.primaryGradient
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradient}
                            >
                                <Ionicons
                                    name={iconMeta.name}
                                    size={20}
                                    color={iconMeta.color}
                                    style={styles.icon}
                                />
                                <View style={styles.textWrap}>
                                    {toast.title && (
                                        <Text style={styles.title} numberOfLines={1}>
                                            {toast.title}
                                        </Text>
                                    )}
                                    {toast.message && (
                                        <Text style={styles.message} numberOfLines={2}>
                                            {toast.message}
                                        </Text>
                                    )}
                                </View>
                            </LinearGradient>
                        </Animated.View>
                    );
                })}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    container: {
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.base,
        alignItems: 'center',
        gap: Spacing.sm,
        width: W,
    },
    toast: {
        width: '100%',
        ...Shadows.primary,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.surface,
    },
    icon: {
        marginRight: Spacing.sm,
        color: Colors.white,
    },
    textWrap: {
        flex: 1,
    },
    title: {
        ...Typography.labelLarge,
        color: Colors.white,
        marginBottom: 2,
    },
    message: {
        ...Typography.bodySmall,
        color: 'rgba(255,255,255,0.9)',
    },
});

export default ToastHost;

