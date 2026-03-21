import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const localImages = {
    'paragon': require('../../assets/images/paragon_biryani.png'),
    'grand_hotel': require('../../assets/images/grand_hotel_meals.png'),
    'kashi_art_cafe': require('../../assets/images/kashi_art_cafe.png'),
};

// Helper to map DB snake_case columns to camelCase expected by the app
const mapDbToApp = (table, row) => {
    if (table === 'store') {
        const imageResolved = row.image === 'local_img' ? localImages[row.id] : row.image;
        return {
            id: row.id,
            name: row.name,
            location: row.location,
            fullAddress: row.full_address,
            cuisine: row.cuisine,
            deliveryTime: row.delivery_time,
            deliveryFee: row.delivery_fee,
            minOrder: row.min_order_value,
            distance: row.distance,
            rating: row.rating,
            reviewCount: row.review_count,
            isFeatured: row.is_featured,
            isOpen: row.is_open,
            offer: row.offer,
            image: imageResolved,
            tags: row.tags,
            operatingHours: row.operating_hours,
            phone: row.phone,
            lat: row.lat,
            lng: row.lng,
            category: row.category_id,
        };
    }
    if (table === 'product') {
        return {
            id: row.id,
            storeId: row.store_id,
            name: row.name,
            description: row.description,
            price: row.price,
            image: row.image_url || row.image,
            rating: row.rating,
            isBestseller: row.is_bestseller,
            isAvailable: row.is_available,
            isVeg: row.is_veg,
            category: row.category,
            sortOrder: row.sort_order,
        };
    }
    if (table === 'category') {
        return {
            id: row.id,
            name: row.name,
            icon: row.icon,
            color: row.color,
            gradient: [row.gradient_start, row.gradient_end],
        };
    }
    return row;
};

// Track realtime subscriptions
let realtimeChannels = [];

export const useDataStore = create((set, get) => ({
    stores: [],
    products: [],
    serviceCategories: [],
    orders: [],
    isLoading: false,
    error: null,
    ordersLoading: false,
    ordersError: null,

    fetchAppData: async () => {
        set({ isLoading: true, error: null });
        try {
            const [storesRes, productsRes, categoriesRes] = await Promise.all([
                supabase.from('stores').select('*'),
                supabase.from('products').select('*').eq('is_available', true),
                supabase.from('service_categories').select('*'),
            ]);

            if (storesRes.error) throw storesRes.error;
            if (productsRes.error) throw productsRes.error;
            if (categoriesRes.error) throw categoriesRes.error;

            set({
                stores: storesRes.data.map(r => mapDbToApp('store', r)),
                products: productsRes.data.map(r => mapDbToApp('product', r)),
                serviceCategories: categoriesRes.data.map(r => mapDbToApp('category', r)),
                isLoading: false,
            });
        } catch (error) {
            console.error('Error fetching Supabase data:', error.message);
            set({ error: error.message, isLoading: false });
        }
    },

    fetchUserOrders: async (userId) => {
        if (!userId) return;
        set({ ordersLoading: true, ordersError: null });
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            set({
                orders: data || [],
                ordersLoading: false,
            });
        } catch (error) {
            console.error('Error fetching user orders:', error.message);
            set({ ordersError: error.message, ordersLoading: false });
        }
    },

    // ─── Realtime Subscriptions ───
    // When items are added/changed on Swim Portal, they appear here instantly
    subscribeRealtime: () => {
        // Clean up existing
        realtimeChannels.forEach(ch => supabase.removeChannel(ch));
        realtimeChannels = [];

        // Products table realtime
        const productsChannel = supabase
            .channel('products-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
                const currentProducts = get().products;

                if (payload.eventType === 'INSERT') {
                    const mapped = mapDbToApp('product', payload.new);
                    if (mapped.isAvailable !== false) {
                        set({ products: [...currentProducts, mapped] });
                    }
                } else if (payload.eventType === 'UPDATE') {
                    const mapped = mapDbToApp('product', payload.new);
                    const updated = currentProducts.map(p =>
                        p.id === mapped.id ? mapped : p
                    );
                    // Remove if no longer available
                    set({ products: updated.filter(p => p.isAvailable !== false) });
                } else if (payload.eventType === 'DELETE') {
                    set({ products: currentProducts.filter(p => p.id !== payload.old.id) });
                }
            })
            .subscribe();

        // Stores table realtime
        const storesChannel = supabase
            .channel('stores-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, (payload) => {
                const currentStores = get().stores;

                if (payload.eventType === 'INSERT') {
                    const mapped = mapDbToApp('store', payload.new);
                    set({ stores: [...currentStores, mapped] });
                } else if (payload.eventType === 'UPDATE') {
                    const mapped = mapDbToApp('store', payload.new);
                    set({ stores: currentStores.map(s => s.id === mapped.id ? mapped : s) });
                } else if (payload.eventType === 'DELETE') {
                    set({ stores: currentStores.filter(s => s.id !== payload.old.id) });
                }
            })
            .subscribe();

        // Service categories realtime
        const categoriesChannel = supabase
            .channel('categories-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'service_categories' }, (payload) => {
                // Just refetch all categories for simplicity
                get().fetchAppData();
            })
            .subscribe();

        realtimeChannels = [productsChannel, storesChannel, categoriesChannel];
    },

    unsubscribeRealtime: () => {
        realtimeChannels.forEach(ch => supabase.removeChannel(ch));
        realtimeChannels = [];
    },
}));
