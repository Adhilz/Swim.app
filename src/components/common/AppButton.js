// ─────────────────────────────────────────────
//  Component: AppButton
// ─────────────────────────────────────────────
import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    ActivityIndicator,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';

const AppButton = ({
    title,
    onPress,
    variant = 'primary', // primary | secondary | outline | ghost
    size = 'md',         // sm | md | lg
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    style,
    textStyle,
    gradient,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
        }).start();
    };

    const sizeStyles = {
        sm: { height: 40, paddingHorizontal: Spacing.md },
        md: { height: 52, paddingHorizontal: Spacing.xl },
        lg: { height: 60, paddingHorizontal: Spacing['2xl'] },
    };

    const textSizes = {
        sm: Typography.labelMedium,
        md: Typography.labelLarge,
        lg: { ...Typography.h5 },
    };

    const isDisabled = disabled || loading;

    const getContent = () => (
        <View style={styles.content}>
            {leftIcon && !loading && <View style={styles.iconLeft}>{leftIcon}</View>}
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.white} size="small" />
            ) : (
                <Text
                    style={[
                        textSizes[size],
                        styles.text,
                        variant === 'outline' && { color: Colors.primary },
                        variant === 'ghost' && { color: Colors.primary },
                        variant === 'secondary' && { color: Colors.textPrimary },
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
            {rightIcon && !loading && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
    );

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                onPress={isDisabled ? null : onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                style={[
                    styles.base,
                    sizeStyles[size],
                    variant === 'outline' && styles.outline,
                    variant === 'ghost' && styles.ghost,
                    variant === 'secondary' && styles.secondary,
                    isDisabled && styles.disabled,
                    style,
                ]}
            >
                {(variant === 'primary' || gradient) ? (
                    <LinearGradient
                        colors={gradient || Colors.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.gradient, sizeStyles[size]]}
                    >
                        {getContent()}
                    </LinearGradient>
                ) : (
                    getContent()
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.primary,
    },
    gradient: {
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outline: {
        backgroundColor: Colors.transparent,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ghost: {
        backgroundColor: Colors.transparent,
        alignItems: 'center',
        justifyContent: 'center',
        ...{ shadowOpacity: 0, elevation: 0 },
    },
    secondary: {
        backgroundColor: Colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: Colors.white,
        letterSpacing: 0.3,
    },
    iconLeft: { marginRight: Spacing.sm },
    iconRight: { marginLeft: Spacing.sm },
});

export default AppButton;
