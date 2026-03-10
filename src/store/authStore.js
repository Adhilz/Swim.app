// ─────────────────────────────────────────────
//  Zustand Store – Auth
// ─────────────────────────────────────────────
import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null,
    selectedAddress: null,
    addresses: [],

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    login: async (phone, otp) => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        const mockUser = {
            id: 'u1',
            name: 'Adhil Khan',
            phone,
            email: 'adhil@example.com',
            avatar: null,
            loyaltyPoints: 450,
            totalOrders: 23,
        };
        set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            token: 'mock_jwt_token_abc123',
        });
        return { success: true };
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
