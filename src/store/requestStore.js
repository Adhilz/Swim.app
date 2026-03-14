import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useRequestStore = create(
    persist(
        (set) => ({
            requests: [],
            addRequest: (request) =>
                set((state) => ({
                    requests: [
                        {
                            id: `REQ${Date.now()}`,
                            status: 'Pending',
                            createdAt: new Date().toISOString(),
                            ...request,
                        },
                        ...state.requests,
                    ],
                })),
            clearRequests: () => set({ requests: [] }),
        }),
        {
            name: 'request-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
