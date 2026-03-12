import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import AppButton from '../../components/common/AppButton';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

const AddressSelectScreen = ({ navigation }) => {
    const { user, selectedAddress, setSelectedAddress } = useAuthStore();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    // New address state
    const [type, setType] = useState('Home');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) fetchAddresses();
    }, [user]);

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
                // Autoselect the first address if none selected
                const defaultAddr = data.find(a => a.is_default) || data[0];
                setSelectedAddress({
                    id: defaultAddr.id,
                    type: defaultAddr.type,
                    addressLine1: defaultAddr.address_line1,
                    addressLine2: defaultAddr.address_line2,
                });
            }
        }
        setLoading(false);
    };

    const handleSaveAddress = async () => {
        if (!addressLine1.trim() || !addressLine2.trim()) {
            Alert.alert('Incomplete', 'Please fill in both address lines.');
            return;
        }
        
        setSaving(true);
        const newAddr = {
            user_id: user.id,
            type,
            address_line1: addressLine1,
            address_line2: addressLine2,
            is_default: addresses.length === 0,
        };

        const { data, error } = await supabase
            .from('addresses')
            .insert([newAddr])
            .select()
            .single();
            
        setSaving(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            setAddresses([data, ...addresses]);
            setSelectedAddress({
                id: data.id,
                type: data.type,
                addressLine1: data.address_line1,
                addressLine2: data.address_line2,
            });
            setIsAdding(false);
            setAddressLine1('');
            setAddressLine2('');
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
        setSelectedAddress({
            id: addr.id,
            type: addr.type,
            addressLine1: addr.address_line1,
            addressLine2: addr.address_line2,
        });
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
