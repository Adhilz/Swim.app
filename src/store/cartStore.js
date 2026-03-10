// ─────────────────────────────────────────────
//  Zustand Store – Cart
// ─────────────────────────────────────────────
import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
    items: [],
    storeId: null,
    storeName: null,

    addItem: (product, storeId, storeName) => {
        const { items, storeId: currentStoreId } = get();

        // If adding from a different store, clear cart
        if (currentStoreId && currentStoreId !== storeId) {
            set({
                items: [{ ...product, quantity: 1 }],
                storeId,
                storeName,
            });
            return { storeChanged: true };
        }

        const existingIndex = items.findIndex(i => i.id === product.id);
        if (existingIndex >= 0) {
            const updated = [...items];
            updated[existingIndex] = {
                ...updated[existingIndex],
                quantity: updated[existingIndex].quantity + 1,
            };
            set({ items: updated });
        } else {
            set({
                items: [...items, { ...product, quantity: 1 }],
                storeId: storeId || currentStoreId,
                storeName: storeName || get().storeName,
            });
        }
        return { storeChanged: false };
    },

    removeItem: (productId) => {
        const { items } = get();
        const existingIndex = items.findIndex(i => i.id === productId);
        if (existingIndex >= 0) {
            const updated = [...items];
            if (updated[existingIndex].quantity > 1) {
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity - 1,
                };
            } else {
                updated.splice(existingIndex, 1);
            }
            set({
                items: updated,
                storeId: updated.length === 0 ? null : get().storeId,
                storeName: updated.length === 0 ? null : get().storeName,
            });
        }
    },

    deleteItem: (productId) => {
        const updated = get().items.filter(i => i.id !== productId);
        set({
            items: updated,
            storeId: updated.length === 0 ? null : get().storeId,
            storeName: updated.length === 0 ? null : get().storeName,
        });
    },

    clearCart: () => set({ items: [], storeId: null, storeName: null }),

    getItemQuantity: (productId) => {
        const item = get().items.find(i => i.id === productId);
        return item ? item.quantity : 0;
    },

    getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

    getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

    getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= 500 ? 0 : 49;
    },

    getTaxes: () => Math.round(get().getSubtotal() * 0.05),

    getTotal: () => {
        const subtotal = get().getSubtotal();
        const delivery = get().getDeliveryFee();
        const taxes = get().getTaxes();
        return subtotal + delivery + taxes;
    },

    applyPromo: (code) => {
        const validCodes = {
            FIRST50: { discount: 0.5, maxDiscount: 100 },
            SAVE20: { discount: 0.2, maxDiscount: 60 },
            FREE: { discount: 0, maxDiscount: 0, freeDelivery: true },
        };
        return validCodes[code.toUpperCase()] || null;
    },
}));
