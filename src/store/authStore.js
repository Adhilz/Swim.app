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
        // Simulate sending SMS
        await new Promise(r => setTimeout(r, 800));
        set({ isLoading: false });
        console.log(`[MOCK SMS] OTP sent to ${phone}. Enter any 6 digits to verify.`);
        return { success: true };
    },

    verifyOtp: async (phone, otpCode) => {
        set({ isLoading: true });

        // Simulate verifying SMS code
        await new Promise(r => setTimeout(r, 800));

        // Use a dummy email derived from the phone number to use Supabase's free Email Auth natively!
        const dummyEmail = `${phone}@swim.ai`;
        const dummyPassword = `swim_secure_${phone}`;

        // 1. Try to sign in the user
        let { data, error } = await supabase.auth.signInWithPassword({
            email: dummyEmail,
            password: dummyPassword,
        });

        // 2. If the user doesn't exist, sign them up invisibly
        if (error && error.message.includes('Invalid login credentials')) {
            const res = await supabase.auth.signUp({
                email: dummyEmail,
                password: dummyPassword,
                options: {
                    data: { phone: `+91${phone}`, name: 'Swim.ai User' }
                }
            });
            data = res.data;
            error = res.error;
        }

        set({ isLoading: false });

        if (error) {
            console.error('OTP Verify Error:', error.message);
            return { success: false, error: error.message };
        }

        if (data && data.session) {
            const userAttr = {
                id: data.user.id,
                name: data.user.user_metadata?.name || 'Swim.ai User',
                phone: `+91${phone}`,
                email: dummyEmail,
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
