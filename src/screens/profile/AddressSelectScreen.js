import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import AppButton from '../../components/common/AppButton';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import * as Location from 'expo-location';
import { buildGeoapifyAutocompleteUrl, buildGeoapifyStaticMapUrl } from '../../lib/geoapify';

const ERNAKULAM_CENTER = {
    latitude: 9.9816,
    longitude: 76.2999,
};

const normalizeAddress = addr => ({
    id: addr.id,
    type: addr.type,
    addressLine1: addr.address_line1 || addr.addressLine1,
    addressLine2: addr.address_line2 || addr.addressLine2,
    lat: addr.lat,
    lng: addr.lng,
});

const AddressSelectScreen = ({ navigation }) => {
    const user = useAuthStore(state => state.user);
    const selectedAddress = useAuthStore(state => state.selectedAddress);
    const setSelectedAddress = useAuthStore(state => state.setSelectedAddress);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [type, setType] = useState('Home');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [saving, setSaving] = useState(false);
    const [locating, setLocating] = useState(false);
    const [searching, setSearching] = useState(false);
    const [locationQuery, setLocationQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (user) fetchAddresses();
    }, [user]);

    useEffect(() => {
        let isActive = true;

        const runSearch = async () => {
            if (!locationQuery.trim() || locationQuery.trim().length < 3) {
                setSuggestions([]);
                return;
            }

            const url = buildGeoapifyAutocompleteUrl(`${locationQuery.trim()}, Ernakulam, Kerala`);

            if (!url) {
                setSuggestions([]);
                return;
            }

            setSearching(true);
            try {
                const response = await fetch(url);
                const data = await response.json();

                if (!isActive) {
                    return;
                }

                const nextSuggestions = (data.features || []).map(item => ({
                    id: item.properties.place_id || item.properties.formatted,
                    title: item.properties.address_line1 || item.properties.name || item.properties.street || 'Pinned location',
                    subtitle: item.properties.formatted || item.properties.address_line2 || 'Ernakulam, Kerala',
                    lat: item.properties.lat,
                    lng: item.properties.lon,
                }));

                setSuggestions(nextSuggestions);
            } catch {
                if (isActive) {
                    setSuggestions([]);
                }
            } finally {
                if (isActive) {
                    setSearching(false);
                }
            }
        };

        const timeout = setTimeout(runSearch, 350);

        return () => {
            isActive = false;
            clearTimeout(timeout);
        };
    }, [locationQuery]);

    const previewMapUrl = useMemo(() => {
        const lat = latitude ?? selectedAddress?.lat ?? ERNAKULAM_CENTER.latitude;
        const lng = longitude ?? selectedAddress?.lng ?? ERNAKULAM_CENTER.longitude;

        return buildGeoapifyStaticMapUrl({
            latitude: lat,
            longitude: lng,
            zoom: latitude != null || selectedAddress?.lat != null ? 15 : 12,
            width: 1200,
            height: 700,
            markerColor: Colors.primary,
        });
    }, [latitude, longitude, selectedAddress?.lat, selectedAddress?.lng]);

    const fetchAddresses = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setAddresses(data);
            if (!selectedAddress && data.length > 0) {
                const defaultAddr = data.find(a => a.is_default) || data[0];
                setSelectedAddress(normalizeAddress(defaultAddr));
            }
        }
        setLoading(false);
    };

    const handleUseCurrentLocation = async () => {
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Location Permission Needed', 'Please allow location access to use your current location.');
                return;
            }

            const currentPosition = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const reverse = await Location.reverseGeocodeAsync({
                latitude: currentPosition.coords.latitude,
                longitude: currentPosition.coords.longitude,
            });

            const place = reverse[0];
            const line1 = place?.name || place?.street || 'Current Location';
            const line2 = [place?.district || place?.subregion, place?.city || 'Ernakulam', place?.region || 'Kerala']
                .filter(Boolean)
                .join(', ');

            setLatitude(currentPosition.coords.latitude);
            setLongitude(currentPosition.coords.longitude);
            setAddressLine1(line1);
            setAddressLine2(line2);
            setLocationQuery(`${line1}, ${line2}`);
            setIsAdding(true);
            setSuggestions([]);
        } catch (error) {
            Alert.alert('Location Error', error.message || 'Unable to fetch your current location.');
        } finally {
            setLocating(false);
        }
    };

    const applySuggestion = suggestion => {
        setAddressLine1(suggestion.title);
        setAddressLine2(suggestion.subtitle);
        setLatitude(suggestion.lat);
        setLongitude(suggestion.lng);
        setLocationQuery(`${suggestion.title}, ${suggestion.subtitle}`);
        setSuggestions([]);
    };

    const handleSaveAddress = async () => {
        if (!addressLine1.trim() || !addressLine2.trim()) {
            Alert.alert('Incomplete', 'Please fill in both address lines.');
            return;
        }
        
        setSaving(true);
        const baseAddr = {
            user_id: user.id,
            type,
            address_line1: addressLine1,
            address_line2: addressLine2,
            is_default: addresses.length === 0,
        };

        let response = await supabase
            .from('addresses')
            .insert([{
                ...baseAddr,
                lat: latitude,
                lng: longitude,
            }])
            .select()
            .single();

        if (response.error?.message?.includes('lat') || response.error?.message?.includes('lng')) {
            response = await supabase
                .from('addresses')
                .insert([baseAddr])
                .select()
                .single();
        }
            
        setSaving(false);

        const { data, error } = response;

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            const savedAddress = {
                ...data,
                lat: data?.lat ?? latitude,
                lng: data?.lng ?? longitude,
            };
            setAddresses([savedAddress, ...addresses]);
            setSelectedAddress(normalizeAddress(savedAddress));
            setIsAdding(false);
            setAddressLine1('');
            setAddressLine2('');
            setLatitude(null);
            setLongitude(null);
            setLocationQuery('');
            setSuggestions([]);
        }
    };

    const handleDelete = async (id) => {
        setAddresses(addresses.filter(a => a.id !== id));
        if (selectedAddress?.id === id) {
            setSelectedAddress(null);
        }
        await supabase.from('addresses').delete().eq('id', id);
    };

    const handleSelect = (addr) => {
        setSelectedAddress(normalizeAddress(addr));
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Address</Text>
                <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
                    <Ionicons name={isAdding ? 'close' : 'add'} size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.mapCard}>
                    {previewMapUrl ? <Image source={{ uri: previewMapUrl }} style={styles.mapImage} /> : null}
                    <View style={styles.mapOverlay}>
                        <View>
                            <Text style={styles.mapTitle}>Delivery Area</Text>
                            <Text style={styles.mapSubtitle}>Ernakulam, Kerala</Text>
                        </View>
                        <TouchableOpacity style={styles.currentLocationBtn} onPress={handleUseCurrentLocation} disabled={locating}>
                            <Ionicons name="locate" size={18} color={Colors.white} />
                            <Text style={styles.currentLocationText}>{locating ? 'Locating...' : 'Use GPS'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {isAdding ? (
                    <View style={styles.addForm}>
                        <Text style={styles.sectionTitle}>Add New Address</Text>

                        <View style={styles.typeSelector}>
                            {['Home', 'Work', 'Other'].map(t => (
                                <TouchableOpacity 
                                    key={t} 
                                    style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                                    onPress={() => setType(t)}
                                >
                                <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Search area or landmark in Ernakulam"
                            placeholderTextColor={Colors.textMuted}
                            value={locationQuery}
                            onChangeText={setLocationQuery}
                        />

                        {searching ? (
                            <Text style={styles.helperText}>Searching locations...</Text>
                        ) : null}

                        {suggestions.length > 0 ? (
                            <View style={styles.suggestionsCard}>
                                {suggestions.map(item => (
                                    <TouchableOpacity key={item.id} style={styles.suggestionRow} onPress={() => applySuggestion(item)}>
                                        <Ionicons name="location-outline" size={18} color={Colors.primary} />
                                        <View style={styles.suggestionCopy}>
                                            <Text style={styles.suggestionTitle}>{item.title}</Text>
                                            <Text style={styles.suggestionSubtitle}>{item.subtitle}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : null}

                        <TextInput
                            style={styles.input}
                            placeholder="Address Line 1 (Flat, House no., Building)"
                            placeholderTextColor={Colors.textMuted}
                            value={addressLine1}
                            onChangeText={setAddressLine1}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Address Line 2 (Area, Street, Sector)"
                            placeholderTextColor={Colors.textMuted}
                            value={addressLine2}
                            onChangeText={setAddressLine2}
                        />

                        <TouchableOpacity style={styles.secondaryAction} onPress={handleUseCurrentLocation} disabled={locating}>
                            <Ionicons name="navigate-circle-outline" size={18} color={Colors.primary} />
                            <Text style={styles.secondaryActionText}>{locating ? 'Finding your position...' : 'Use current location'}</Text>
                        </TouchableOpacity>

                        <AppButton
                            title="Save Address"
                            onPress={handleSaveAddress}
                            loading={saving}
                            style={{ marginTop: Spacing.md }}
                        />
                    </View>
                ) : (
                    <>
                        {loading ? (
                            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing['3xl'] }} />
                        ) : addresses.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="location-outline" size={48} color={Colors.textMuted} />
                                <Text style={styles.emptyText}>No addresses found.</Text>
                                <AppButton
                                    title="Add New Address"
                                    onPress={() => setIsAdding(true)}
                                    style={{ marginTop: Spacing.xl, width: 220 }}
                                />
                            </View>
                        ) : (
                            addresses.map(addr => {
                                const isSelected = selectedAddress?.id === addr.id;
                                return (
                                    <View key={addr.id} style={[styles.addressCard, isSelected && styles.addressCardSelected]}>
                                        <TouchableOpacity 
                                            style={styles.addressInfo}
                                            onPress={() => handleSelect(addr)}
                                        >
                                            <View style={styles.iconWrap}>
                                                <Ionicons name={addr.type === 'Home' ? 'home' : 'briefcase'} size={20} color={isSelected ? Colors.primary : Colors.textSecondary} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.addressType}>{addr.type}</Text>
                                                <Text style={styles.addressText}>{addr.address_line1}, {addr.address_line2}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(addr.id)} style={styles.deleteBtn}>
                                            <Ionicons name="trash-outline" size={20} color={Colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                )
                            })
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { ...Typography.h4, color: Colors.textPrimary },
    container: {
        padding: Spacing.base,
        paddingBottom: 100,
    },
    mapCard: {
        height: 210,
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
        marginBottom: Spacing.base,
        backgroundColor: Colors.surfaceLight,
        shadowColor: '#D6C9BE',
        shadowOffset: { width: 7, height: 7 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 8,
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: Spacing.base,
        backgroundColor: 'rgba(36,26,18,0.26)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mapTitle: {
        ...Typography.labelLarge,
        color: Colors.white,
    },
    mapSubtitle: {
        ...Typography.caption,
        color: 'rgba(255,255,255,0.86)',
        marginTop: 4,
    },
    currentLocationBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.full,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    currentLocationText: {
        ...Typography.labelSmall,
        color: Colors.white,
    },
    sectionTitle: { ...Typography.h5, color: Colors.textPrimary, marginBottom: Spacing.md },
    addForm: {
        backgroundColor: Colors.surface,
        padding: Spacing.base,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    typeBtnActive: {
        backgroundColor: `${Colors.primary}20`,
        borderColor: Colors.primary,
    },
    typeBtnText: { ...Typography.labelMedium, color: Colors.textSecondary },
    typeBtnTextActive: { color: Colors.primary },
    input: {
        backgroundColor: Colors.background,
        color: Colors.textPrimary,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.md,
    },
    helperText: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: -6,
        marginBottom: Spacing.sm,
    },
    suggestionsCard: {
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    suggestionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    suggestionCopy: {
        flex: 1,
    },
    suggestionTitle: {
        ...Typography.labelMedium,
        color: Colors.textPrimary,
    },
    suggestionSubtitle: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    secondaryAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 48,
        borderRadius: BorderRadius.lg,
        backgroundColor: `${Colors.primary}10`,
        borderWidth: 1,
        borderColor: `${Colors.primary}20`,
        marginTop: 2,
    },
    secondaryActionText: {
        ...Typography.labelMedium,
        color: Colors.primary,
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.base,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    addressCardSelected: {
        borderColor: Colors.primary,
        backgroundColor: `${Colors.primary}10`,
    },
    addressInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    iconWrap: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: Colors.background,
        alignItems: 'center', justifyContent: 'center',
    },
    addressType: { ...Typography.labelLarge, color: Colors.textPrimary },
    addressText: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
    deleteBtn: {
        padding: Spacing.sm,
        marginLeft: Spacing.sm,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing['3xl'],
        gap: Spacing.md,
    },
    emptyText: {
        ...Typography.bodyLarge,
        color: Colors.textSecondary,
    },
});

export default AddressSelectScreen;
