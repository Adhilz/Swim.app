import { create } from 'zustand';

export const useToastStore = create(set => ({
    toasts: [],
    /**
     * Show a new toast.
     * type: 'success' | 'error' | 'info'
     */
    showToast: ({ type = 'info', title, message, duration = 3000 }) => {
        const id = Date.now().toString();
        const toast = { id, type, title, message, duration };
        set(state => ({ toasts: [...state.toasts, toast] }));
        return id;
    },
    hideToast: (id) =>
        set(state => ({
            toasts: state.toasts.filter(t => t.id !== id),
        })),
    clearToasts: () => set({ toasts: [] }),
}));

