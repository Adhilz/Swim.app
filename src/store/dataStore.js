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
            minOrder: row.min_order,
            distance: row.distance,
            rating: row.rating,
            reviewCount: row.review_count,
            isFeatured: row.is_featured,
            isOpen: row.is_open,
            offer: row.offer,
            image: imageResolved, // URL or local mapped require
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
            image: row.image,
            rating: row.rating,
            isBestseller: row.is_bestseller,
            category: row.category,
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

export const useDataStore = create((set) => ({
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
            // Concurrent fetching for fastest load!
            const [storesRes, productsRes, categoriesRes] = await Promise.all([
                supabase.from('stores').select('*'),
                supabase.from('products').select('*'),
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
}));
