// ─────────────────────────────────────────────
//  Component: PromoBanner – Auto-scrolling carousel
// ─────────────────────────────────────────────
import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { MOCK_BANNERS } from '../../data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - Spacing.base * 2;

const BANNER_ICONS = {
    food: 'restaurant',
    grocery: 'cart',
    pharmacy: 'medical',
};

const PromoBanner = ({ onPress }) => {
    const flatListRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setActiveIndex(prev => {
                const next = (prev + 1) % MOCK_BANNERS.length;
                flatListRef.current?.scrollToIndex({ index: next, animated: true });
                return next;
            });
        }, 3000);
        return () => clearInterval(timerRef.current);
    }, []);

    const handleScroll = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / BANNER_WIDTH);
        setActiveIndex(index);
    };

    const renderBanner = ({ item }) => (
        <TouchableOpacity
            onPress={() => onPress && onPress(item)}
            activeOpacity={0.9}
            style={styles.banner}
        >
            <LinearGradient
                colors={[item.bgColor, `${item.bgColor}CC`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.subtitle}>{item.subtitle}</Text>
                        <View style={styles.cta}>
                            <Text style={styles.ctaText}>Order Now</Text>
                            <Ionicons name="arrow-forward" size={14} color={Colors.white} />
                        </View>
                    </View>
                    <View style={styles.iconCircle}>
                        <Ionicons name={BANNER_ICONS[item.category] || 'gift'} size={36} color={Colors.white} />
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View>
            <FlatList
                ref={flatListRef}
                data={MOCK_BANNERS}
                renderItem={renderBanner}
                keyExtractor={i => i.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                snapToInterval={BANNER_WIDTH + Spacing.sm}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: Spacing.base }}
                ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
                getItemLayout={(_, index) => ({
                    length: BANNER_WIDTH + Spacing.sm,
                    offset: (BANNER_WIDTH + Spacing.sm) * index,
                    index,
                })}
            />
            {/* Dot Indicators */}
            <View style={styles.dots}>
                {MOCK_BANNERS.map((_, i) => (
                    <View
                        key={i}
                        style={[styles.dot, i === activeIndex && styles.dotActive]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        width: BANNER_WIDTH,
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
    },
    gradient: {
        padding: Spacing.xl,
        minHeight: 120,
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        ...Typography.h3,
        color: Colors.white,
        marginBottom: 4,
    },
    subtitle: {
        ...Typography.bodySmall,
        color: 'rgba(255,255,255,0.85)',
        marginBottom: Spacing.sm,
    },
    cta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ctaText: {
        ...Typography.labelMedium,
        color: Colors.white,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: Spacing.sm,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.border,
    },
    dotActive: {
        width: 20,
        backgroundColor: Colors.primary,
    },
});

export default PromoBanner;
