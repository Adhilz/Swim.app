// ─────────────────────────────────────────────
//  Zustand Store – Auth
// ─────────────────────────────────────────────
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null,
    selectedAddress: null,
    addresses: [],

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    sendOtp: async (phone) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithOtp({
            phone: `+91${phone}`
        });
        set({ isLoading: false });
        if (error) {
            console.error('OTP Send Error:', error.message);
            return { success: false, error: error.message };
        }
        return { success: true };
    },

    verifyOtp: async (phone, otpCode) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.verifyOtp({
            phone: `+91${phone}`,
            token: otpCode,
            type: 'sms',
        });
        set({ isLoading: false });

        if (error) {
            console.error('OTP Verify Error:', error.message);
            return { success: false, error: error.message };
        }

        if (data && data.session) {
            const userAttr = {
                id: data.user.id,
                name: 'Swim.ai User',
                phone: data.user.phone,
                email: data.user.email,
                loyaltyPoints: 0,
                totalOrders: 0,
            };
            set({
                user: userAttr,
                isAuthenticated: true,
                token: data.session.access_token,
            });
            return { success: true };
        }
        return { success: false, error: 'Session could not be established' };
    },

    logout: () => set({
        user: null,
        isAuthenticated: false,
        token: null,
        selectedAddress: null,
    }),

    setSelectedAddress: (address) => set({ selectedAddress: address }),

    addAddress: (address) => set(state => ({
        addresses: [...state.addresses, { ...address, id: Date.now().toString() }],
    })),

    updateProfile: (updates) => set(state => ({
        user: { ...state.user, ...updates },
    })),

    setLoading: (isLoading) => set({ isLoading }),
}));
