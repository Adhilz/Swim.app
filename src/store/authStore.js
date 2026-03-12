// ─────────────────────────────────────────────
//  Zustand Store – Auth
// ─────────────────────────────────────────────
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isProfileComplete: false,
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
        console.log(`[MOCK SMS] OTP sent to ${phone}. Enter 123456 to verify.`);
        return { success: true };
    },

    verifyOtp: async (phone, otpCode) => {
        set({ isLoading: true });
        
        // Hardcode the OTP to `123456`
        if (otpCode !== '123456') {
            set({ isLoading: false });
            return { success: false, error: 'Invalid OTP code. Please use 123456.' };
        }

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
                    data: { phone: `+91${phone}` }
                }
            });
            data = res.data;
            error = res.error;
        }

        if (error) {
            set({ isLoading: false });
            console.error('OTP Verify Error:', error.message);
            return { success: false, error: error.message };
        }

        if (data && data.session) {
            const userId = data.user.id;
            
            // 3. Fetch user profile from database
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            const isProfileComplete = !!(profile && profile.name);

            const userAttr = {
                id: userId,
                name: profile?.name || '',
                phone: profile?.phone || `+91${phone}`,
                email: profile?.email || dummyEmail,
                loyaltyPoints: 0,
                totalOrders: 0,
            };
            
            set({
                user: userAttr,
                isAuthenticated: true,
                isProfileComplete,
                token: data.session.access_token,
                isLoading: false,
            });
            return { success: true };
        }
        
        set({ isLoading: false });
        return { success: false, error: 'Session could not be established' };
    },

    completeProfile: async (name, email) => {
        set({ isLoading: true });
        const state = get();
        if (!state.user) return { success: false, error: 'No user authenticated' };

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: state.user.id,
                phone: state.user.phone,
                name: name,
                email: email
            });

        set({ isLoading: false });

        if (error) {
            console.error('Profile complete error:', error.message);
            return { success: false, error: error.message };
        }

        set({
            isProfileComplete: true,
            user: { ...state.user, name, email }
        });

        return { success: true };
    },

    logout: () => set({
        user: null,
        isAuthenticated: false,
        isProfileComplete: false,
        token: null,
        selectedAddress: null,
    }),

    setSelectedAddress: (address) => set({ selectedAddress: address }),

    addAddress: (address) => set(state => ({
        addresses: [...state.addresses, { ...address, id: Date.now().toString() }],
    })),

    updateProfile: async (updates) => {
        const state = get();
        if (state.user) {
            await supabase.from('profiles').update(updates).eq('id', state.user.id);
            set(state => ({
                user: { ...state.user, ...updates },
            }));
        }
    },

    setLoading: (isLoading) => set({ isLoading }),
}));
