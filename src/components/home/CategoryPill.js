// ─────────────────────────────────────────────
//  Component: CategoryPill
// ─────────────────────────────────────────────
import React, { useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

const CategoryPill = ({ category, isSelected, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start(() => onPress(category));
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.wrapper}>
                <LinearGradient
                    colors={isSelected ? category.gradient : ['transparent', 'transparent']}
                    style={[
                        styles.iconContainer,
                        !isSelected && { borderWidth: 1.5, borderColor: Colors.border },
                    ]}
                >
                    <Ionicons
                        name={category.icon}
                        size={24}
                        color={isSelected ? Colors.white : category.color}
                    />
                </LinearGradient>
                <Text
                    style={[
                        styles.label,
                        { color: isSelected ? category.color : Colors.textSecondary },
                    ]}
                >
                    {category.name}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        marginRight: Spacing.base,
        width: 64,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    label: {
        ...Typography.labelSmall,
        textAlign: 'center',
    },
});

export default CategoryPill;
