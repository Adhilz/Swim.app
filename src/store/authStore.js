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

    continueWithGoogle: async () => {
        set({ isLoading: true });
        try {
            const { makeRedirectUri } = require('expo-auth-session');
            const WebBrowser = require('expo-web-browser');
            const QueryParams = require('expo-auth-session/build/QueryParams');
            
            WebBrowser.maybeCompleteAuthSession();
            
            const redirectUrl = makeRedirectUri();
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: redirectUrl }
            });

            if (error || !data.url) throw error || new Error('Google Auth URL failed');
            
            const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            if (res.type === 'success') {
                const { params, errorCode } = QueryParams.getQueryParams(res.url);
                if (errorCode) throw new Error(errorCode);
                
                if (params.access_token) {
                    const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
                        access_token: params.access_token,
                        refresh_token: params.refresh_token,
                    });
                    
                    if (sessionErr) throw sessionErr;
                    
                    if (sessionData && sessionData.user) {
                        const userId = sessionData.user.id;
                        
                        // Check if profile exists, otherwise complete profile
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', userId)
                            .single();

                        const isProfileComplete = !!(profile && profile.name);
                        
                        set({
                            user: {
                                id: userId,
                                name: profile?.name || sessionData.user.user_metadata?.full_name || '',
                                phone: profile?.phone || '',
                                email: profile?.email || sessionData.user.email,
                                loyaltyPoints: 0,
                                totalOrders: 0,
                            },
                            isAuthenticated: true,
                            isProfileComplete,
                            token: sessionData.session.access_token,
                        });
                        return { success: true };
                    }
                }
            } else if (res.type === 'cancel') {
                set({ isLoading: false });
                return { success: false, error: 'User cancelled login.' };
            }
        } catch (error) {
            console.error('Google Auth Error:', error.message);
            set({ isLoading: false });
            return { success: false, error: error.message };
        }
        
        set({ isLoading: false });
        return { success: false, error: 'Failed to complete Google authentication.' };
    },

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

        // 2. If the user doesn't exist (invalid login) or somehow 'Email not confirmed', fix them invisibly
        if (error && (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed'))) {
            const { error: signUpErr } = await supabase.auth.signUp({
                email: dummyEmail,
                password: dummyPassword,
                options: {
                    data: { phone: `+91${phone}` }
                }
            });
            
            // Re-attempt sign in to fetch session since trigger confirms them instantly
            const r = await supabase.auth.signInWithPassword({
                email: dummyEmail,
                password: dummyPassword,
            });
            data = r.data;
            error = r.error;
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
