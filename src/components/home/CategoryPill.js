// ─────────────────────────────────────────────
//  Component: CategoryPill (Swim.ai Premium)
// ─────────────────────────────────────────────
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

const CategoryPill = ({ category, isSelected, onPress }) => {
    return (
        <TouchableOpacity
            onPress={() => onPress(category)}
            activeOpacity={0.8}
            style={styles.wrapper}
        >
            <View
                style={[
                    styles.iconContainer,
                    isSelected && { borderColor: category.color, backgroundColor: `${category.color}15` }
                ]}
            >
                {isSelected && (
                    <LinearGradient
                        colors={category.gradient}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                )}
                <Ionicons
                    name={category.icon}
                    size={28}
                    color={isSelected ? Colors.white : Colors.textSecondary}
                />
            </View>
            <Text
                style={[
                    styles.label,
                    { color: isSelected ? Colors.white : Colors.textMuted },
                    isSelected && { fontWeight: '700' }
                ]}
            >
                {category.name}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        marginRight: Spacing.xl,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        backgroundColor: Colors.surface,
        borderWidth: 1.5,
        borderColor: Colors.glassBorder,
        overflow: 'hidden',
    },
    label: {
        ...Typography.labelSmall,
        textAlign: 'center',
        fontSize: 12,
    },
});

export default CategoryPill;
