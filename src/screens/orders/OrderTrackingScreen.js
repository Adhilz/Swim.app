import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    StatusBar,
    Linking,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import AppButton from '../../components/common/AppButton';
import { DELIVERY_PARTNER, ORDERS, STORES } from '../../data/mockData';
import { supabase } from '../../lib/supabase';
import { buildGeoapifyStaticMapUrl, GEOAPIFY_API_KEY } from '../../lib/geoapify';
import { useDataStore } from '../../store/dataStore';

const STATUS_INDEX = {
    pending: 0.25,
    confirmed: 0.33,
    preparing: 0.55,
    accepted: 0.55,
    pickup: 0.72,
    pickedup: 0.72,
    ontheway: 0.72,
    delivered: 1,
};

const getProgressFromStatus = status => {
    const normalized = String(status || '').toLowerCase().replace(/[\s_-]/g, '');
    return STATUS_INDEX[normalized] ?? 0.55;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = value => UUID_PATTERN.test(String(value || '').trim());
const ERNAKULAM_CENTER = {
    latitude: 9.9816,
    longitude: 76.2999,
};

const OrderTrackingScreen = ({ route, navigation }) => {
    const { orderId } = route.params || {};
    const stores = useDataStore(state => state.stores);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapLoadError, setMapLoadError] = useState(null);
    const bobAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let isMounted = true;

        const fetchOrder = async () => {
            if (!orderId) {
                setLoading(false);
                return;
            }

            if (!isUuid(orderId)) {
                const localOrder = ORDERS.find(item => String(item.id) === String(orderId));

                if (isMounted) {
                    setOrder(localOrder || null);
                    setError(localOrder ? null : 'Latest live update unavailable for this sample order.');
                    setLoading(false);
                }
                return;
            }

            try {
                const { data, error: queryError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (queryError) {
                    throw queryError;
                }

                if (isMounted) {
                    setOrder(data);
                }
            } catch (fetchError) {
                if (isMounted) {
                    setError(fetchError.message || 'Unable to load this order.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchOrder();

        return () => {
            isMounted = false;
        };
    }, [orderId]);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(bobAnim, { toValue: -10, duration: 1200, useNativeDriver: true }),
                Animated.timing(bobAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [bobAnim]);

    const progress = useMemo(() => getProgressFromStatus(order?.status), [order?.status]);
    const progressWidth = `${Math.round(progress * 100)}%`;
    const relatedStore = useMemo(() => {
        const storeId = order?.store_id || order?.storeId;
        return stores.find(item => item.id === storeId)
            || STORES.find(item => item.id === storeId)
            || null;
    }, [order?.storeId, order?.store_id, stores]);
    const deliveryCoords = order?.delivery_address?.lat != null && order?.delivery_address?.lng != null
        ? {
            latitude: order.delivery_address.lat,
            longitude: order.delivery_address.lng,
            color: Colors.textPrimary,
        }
        : null;
    const storeCoords = relatedStore?.lat != null && relatedStore?.lng != null
        ? {
            latitude: relatedStore.lat,
            longitude: relatedStore.lng,
            color: Colors.primary,
        }
        : null;
    const mapUrl = useMemo(() => {
        const markers = [storeCoords, deliveryCoords].filter(Boolean);
        const center = deliveryCoords || storeCoords || ERNAKULAM_CENTER;
        return buildGeoapifyStaticMapUrl({
            latitude: center.latitude,
            longitude: center.longitude,
            zoom: deliveryCoords && storeCoords ? 14 : markers.length > 0 ? 15 : 13,
            width: 1200,
            height: 900,
            markers,
        });
    }, [deliveryCoords, storeCoords]);
    const mapIssue = !GEOAPIFY_API_KEY
        ? 'Geoapify API key is not loaded in the app runtime.'
        : mapLoadError
            ? 'The map image could not be loaded from Geoapify.'
            : null;
    const displayOrderId = String(order?.id || orderId || '88219').slice(0, 8).toUpperCase();
    const address = order?.delivery_address
        ? `${order.delivery_address.addressLine1 || ''}${order.delivery_address.addressLine2 ? `, ${order.delivery_address.addressLine2}` : ''}`
        : order?.deliveryAddress || 'Your saved address';
    const statusText = order?.status || 'Picking up your item';

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingScreen}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <SafeAreaView edges={['top']} style={styles.headerArea}>
                <View style={styles.headerCard}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerEyebrow}>Live Tracking</Text>
                        <Text style={styles.headerTitle}>Order #{displayOrderId}</Text>
                    </View>
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Support')}>
                        <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={styles.mapArea}>
                {mapUrl ? (
                    <Image
                        source={{ uri: mapUrl }}
                        style={styles.mapImage}
                        resizeMode="cover"
                        onError={() => setMapLoadError('image')}
                        onLoad={() => setMapLoadError(null)}
                    />
                ) : (
                    <View style={styles.mapFallback}>
                        <Ionicons name="map-outline" size={42} color={Colors.textMuted} />
                        <Text style={styles.mapFallbackText}>Map preview unavailable for this order.</Text>
                    </View>
                )}
                <View style={styles.mapTint} />

                <Animated.View style={[styles.riderMarkerWrap, { transform: [{ translateY: bobAnim }] }]}>
                    <View style={styles.riderMarker}>
                        <Ionicons name="bicycle" size={30} color={Colors.white} />
                    </View>
                    <View style={styles.markerShadow} />
                </Animated.View>

                <View style={styles.destinationMarker}>
                    <Ionicons name="home" size={16} color={Colors.white} />
                </View>

                <View style={styles.mapControls}>
                    <TouchableOpacity style={styles.mapControlBtn}>
                        <Ionicons name="add" size={18} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mapControlBtn}>
                        <Ionicons name="remove" size={18} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.mapControlBtn, styles.mapControlBtnAccent]}>
                        <Ionicons name="navigate" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                {mapIssue ? (
                    <View style={styles.mapStatusPill}>
                        <Text style={styles.mapStatusText}>{mapIssue}</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.bottomSheet}>
                <View style={styles.pullBar} />
                <View style={styles.statusRow}>
                    <View style={styles.statusIcon}>
                        <Ionicons name="cube-outline" size={30} color={Colors.primary} />
                    </View>
                    <View style={styles.statusCopy}>
                        <Text style={styles.statusTitle}>{statusText}</Text>
                        <Text style={styles.statusSubtitle}>{address}</Text>
                    </View>
                </View>

                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: progressWidth }]} />
                </View>

                {error ? (
                    <Text style={styles.errorText}>Latest live update unavailable: {error}</Text>
                ) : null}

                <View style={styles.partnerCard}>
                    <View style={styles.partnerLeft}>
                        <View style={styles.partnerAvatar}>
                            <Text style={styles.partnerInitial}>{DELIVERY_PARTNER.name.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text style={styles.partnerName}>{DELIVERY_PARTNER.name}</Text>
                            <View style={styles.partnerMetaRow}>
                                <Ionicons name="star" size={12} color={Colors.star} />
                                <Text style={styles.partnerMeta}>{DELIVERY_PARTNER.rating} (1.2k reviews)</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.partnerActions}>
                        <TouchableOpacity style={styles.partnerActionSecondary} onPress={() => navigation.navigate('Support')}>
                            <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.partnerActionPrimary}
                            onPress={() => Linking.openURL(`tel:${DELIVERY_PARTNER.phone}`)}
                        >
                            <Ionicons name="call" size={18} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                <AppButton
                    title="Contact Partner"
                    onPress={() => Linking.openURL(`tel:${DELIVERY_PARTNER.phone}`)}
                    style={styles.contactButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
    },
    headerArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.sm,
    },
    headerCard: {
        backgroundColor: 'rgba(255,255,255,0.76)',
        borderRadius: BorderRadius.xl,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
        elevation: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerEyebrow: {
        ...Typography.labelSmall,
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerTitle: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
        marginTop: 2,
    },
    mapArea: {
        flex: 1,
        backgroundColor: '#EDE5DD',
        overflow: 'hidden',
    },
    mapImage: {
        ...StyleSheet.absoluteFillObject,
    },
    mapTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(248,247,245,0.1)',
    },
    mapFallback: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: '#E8E1D8',
    },
    mapFallbackText: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
    },
    riderMarkerWrap: {
        position: 'absolute',
        top: '42%',
        left: '42%',
        alignItems: 'center',
    },
    riderMarker: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: Colors.card,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.32,
        shadowRadius: 18,
        elevation: 14,
    },
    markerShadow: {
        width: 20,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(36,26,18,0.16)',
        marginTop: 10,
    },
    destinationMarker: {
        position: 'absolute',
        top: '30%',
        right: '23%',
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.textPrimary,
        borderWidth: 2,
        borderColor: Colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapControls: {
        position: 'absolute',
        right: Spacing.base,
        top: '36%',
        gap: Spacing.sm,
    },
    mapControlBtn: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.76)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapControlBtnAccent: {
        marginTop: Spacing.base,
    },
    mapStatusPill: {
        position: 'absolute',
        left: Spacing.base,
        right: Spacing.base,
        bottom: Spacing.base,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    mapStatusText: {
        ...Typography.caption,
        color: Colors.error,
        textAlign: 'center',
    },
    bottomSheet: {
        backgroundColor: Colors.card,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: Spacing.base,
        paddingTop: Spacing.base,
        paddingBottom: Spacing.xl,
        shadowColor: '#BFAE9D',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.14,
        shadowRadius: 18,
        elevation: 12,
    },
    pullBar: {
        width: 48,
        height: 5,
        borderRadius: 3,
        backgroundColor: Colors.border,
        alignSelf: 'center',
        marginBottom: Spacing.base,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        width: 62,
        height: 62,
        borderRadius: 20,
        backgroundColor: '#FDF0E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusCopy: {
        flex: 1,
        marginLeft: Spacing.base,
    },
    statusTitle: {
        ...Typography.h2,
        color: Colors.textPrimary,
    },
    statusSubtitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    progressTrack: {
        height: 10,
        borderRadius: 999,
        backgroundColor: Colors.surfaceLight,
        marginTop: Spacing.xl,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: Colors.primary,
    },
    errorText: {
        ...Typography.bodySmall,
        color: Colors.error,
        marginTop: Spacing.sm,
    },
    partnerCard: {
        marginTop: Spacing.xl,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 8,
    },
    partnerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    partnerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: '#F7E1CA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    partnerInitial: {
        ...Typography.h3,
        color: Colors.primaryDark,
    },
    partnerName: {
        ...Typography.labelLarge,
        color: Colors.textPrimary,
        marginLeft: Spacing.sm,
    },
    partnerMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Spacing.sm,
        marginTop: 4,
        gap: 4,
    },
    partnerMeta: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    partnerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    partnerActionSecondary: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: '#FDF0E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    partnerActionPrimary: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactButton: {
        marginTop: Spacing.xl,
    },
});

export default OrderTrackingScreen;
