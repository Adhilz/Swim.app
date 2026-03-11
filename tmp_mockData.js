// ─────────────────────────────────────────────
//  Centralized Data – Swim.ai
//  Real store data from Ernakulam / Kochi, Kerala
//  Sources:
//   • Lulu Mall Kochi — kochi.lulumall.in/stores
//   • Kayees Rahmathulla — restaurant-guru.in
//   • Jayalakshmi Silks — jayalakshmisilks.com
// ─────────────────────────────────────────────

// ── Service Categories ───────────────────────

const SERVICE_CATEGORIES = [
    {
        id: 'food',
        name: 'Fine Dining',
        icon: 'restaurant',
        color: '#F47B25',
        gradient: ['#F47B25', '#E55A00'],
        description: 'Elite Kerala Cuisine',
        deliveryTime: '20-45 min',
    },
    {
        id: 'shopping',
        name: 'Boutiques',
        icon: 'bag',
        color: '#A855F7',
        gradient: ['#A855F7', '#7C3AED'],
        description: 'Designer Ethnic Wear',
        deliveryTime: 'Same Day',
    },
    {
        id: 'lifestyle',
        name: 'Lifestyle',
        icon: 'star',
        color: '#FFD700',
        gradient: ['#FFD700', '#B8860B'],
        description: 'Premium Collections',
        deliveryTime: 'Concierge',
    },
    {
        id: 'pharmacy',
        name: 'Wellness',
        icon: 'medical',
        color: '#22C55E',
        gradient: ['#22C55E', '#16A34A'],
        description: 'Ayurveda & Healthcare',
        deliveryTime: '30-60 min',
    },
];

// ══════════════════════════════════════════════
//  10 REAL STORES FROM ERNAKULAM / KOCHI
// ══════════════════════════════════════════════

const STORES = [
    // ── 1. Paragon Restaurant ────────────────
    {
        id: 'paragon',
        name: 'Calicut Paragon',
        location: 'Lulu Mall, Edapally',
        fullAddress: 'Lulu International Shopping Mall, NH 66 Bypass, Edapally, Kochi 682024',
        category: 'food',
        cuisine: 'Malabar · Arabian · Seafood',
        rating: 4.9,
        reviewCount: 4520,
        deliveryTime: '30-45 min',
        deliveryFee: 0,
        minOrder: 250,
        distance: '2.4 km',
        isFeatured: true,
        isOpen: true,
        offer: 'Complimentary Dessert on ₹1000+',
        image: 'local:paragon_biryani.png',
        tags: ['Iconic', 'Legendary Biryani'],
        operatingHours: '11:00 AM – 11:00 PM',
        phone: '+91 484 272 0772',
        lat: 10.0274,
        lng: 76.3083,
    },

    // ── 2. Grand Hotel ───────────────────────
    {
        id: 'grand_hotel',
        name: 'Grand Hotel',
        location: 'MG Road, Ernakulam',
        fullAddress: 'MG Road, Near GCDA Complex, Ernakulam 682011',
        category: 'food',
        cuisine: 'Kerala Meals · Fish Curry · Biryani',
        rating: 4.7,
        reviewCount: 6830,
        deliveryTime: '25-40 min',
        deliveryFee: 30,
        minOrder: 150,
        distance: '1.2 km',
        isFeatured: false,
        isOpen: true,
        offer: 'Unlimited Meals ₹199',
        image: 'local:grand_hotel_meals.png',
        tags: ['Heritage', 'Since 1958'],
        operatingHours: '7:00 AM – 10:30 PM',
        phone: '+91 484 238 2061',
        lat: 9.9716,
        lng: 76.2886,
    },

    // ── 3. Kashi Art Cafe ────────────────────
    {
        id: 'kashi_art_cafe',
        name: 'Kashi Art Cafe',
        location: 'Burgher Street, Fort Kochi',
        fullAddress: 'Burgher Street, Near Santa Cruz Basilica, Fort Kochi 682001',
        category: 'food',
        cuisine: 'Continental · Cafe · Fusion',
        rating: 4.6,
        reviewCount: 3240,
        deliveryTime: '35-50 min',
        deliveryFee: 49,
        minOrder: 300,
        distance: '5.8 km',
        isFeatured: true,
        isOpen: true,
        offer: 'Art Gallery + Brunch Combo',
        image: 'local:kashi_art_cafe.png',
        tags: ['Artsy', 'Fort Kochi Vibe'],
        operatingHours: '8:30 AM – 10:00 PM',
        phone: '+91 484 221 5769',
        lat: 9.9639,
        lng: 76.2429,
    },

    // ── 4. Kayees Rahmathulla Cafe ───────────
    // Source: restaurant-guru.in — Google 4.0/5 (10,173 reviews)
    // Menu items: biryani, chicken curry, beef, fried fish, rice
    {
        id: 'kayees',
        name: 'Kayees Rahmathulla Cafe',
        location: 'Durbar Hall Road, Ernakulam',
        fullAddress: 'Durbar Hall Road, Near Law College Junction, Ernakulam 682016',
        category: 'food',
        cuisine: 'Biryani · Kerala Muslim Cuisine',
        rating: 4.0,
        reviewCount: 10173,
        deliveryTime: '20-35 min',
        deliveryFee: 25,
        minOrder: 200,
        distance: '1.5 km',
        isFeatured: false,
        isOpen: true,
        offer: 'Legendary Biryani Since 1948',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600',
        tags: ['Heritage', 'Famous Biryani'],
        operatingHours: '12:00 PM – 10:00 PM',
        phone: '+91 9150 654 321',
        lat: 9.9716,
        lng: 76.2886,
    },

    // ── 5. Jayalakshmi Silks ─────────────────
    // Source: jayalakshmisilks.com — Saree collections
    // Categories: Kanjivaram, Banarasi, Kasavu, Fancy, Silk
    {
        id: 'jayalakshmi',
        name: 'Jayalakshmi Silks',
        location: 'MG Road, Ernakulam',
        fullAddress: 'MG Road, Ravipuram, Ernakulam 682016',
        category: 'shopping',
        cuisine: 'Sarees · Bridal · Ethnic Wear',
        rating: 4.8,
        reviewCount: 2840,
        deliveryTime: 'Same Day',
        deliveryFee: 0,
        minOrder: 1500,
        distance: '1.5 km',
        isFeatured: true,
        isOpen: true,
        offer: 'Bridal Collection – Up to 30% Off',
        image: 'https://jayalakshmisilks.com/storage/1060/Jaylakshmi-Silks_11839_FIV.jpg',
        tags: ['Premium', 'Since 1947'],
        operatingHours: '9:30 AM – 9:00 PM',
        phone: '+91 484 237 0444',
        lat: 9.9707,
        lng: 76.2882,
    },

    // ── 6. Pranaah by Poornima Indrajith ─────
    {
        id: 'pranaah',
        name: 'Pranaah by Poornima Indrajith',
        location: 'Panampilly Nagar, Kochi',
        fullAddress: 'SS Kovil Road, Panampilly Nagar, Kochi 682036',
        category: 'shopping',
        cuisine: 'Designer · Women\'s Ethnic Wear',
        rating: 4.7,
        reviewCount: 980,
        deliveryTime: 'Express 2hr',
        deliveryFee: 100,
        minOrder: 2000,
        distance: '3.2 km',
        isFeatured: false,
        isOpen: true,
        offer: 'New Handloom Collection Out',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600',
        tags: ['Celebrity Designer', 'Handloom'],
        operatingHours: '10:00 AM – 8:00 PM',
        phone: '+91 484 401 2345',
        lat: 9.9657,
        lng: 76.3027,
    },

    // ── 7. FabIndia — also at Lulu Mall ──────
    // Source: kochi.lulumall.in (listed under Women's Fashion)
    {
        id: 'fabindia',
        name: 'FabIndia',
        location: 'Lulu Mall, Edapally',
        fullAddress: 'Lulu International Shopping Mall, NH 66 Bypass, Edapally, Kochi 682024',
        category: 'shopping',
        cuisine: 'Handloom · Organic · Ethnic',
        rating: 4.5,
        reviewCount: 1520,
        deliveryTime: 'Same Day',
        deliveryFee: 50,
        minOrder: 800,
        distance: '2.4 km',
        isFeatured: false,
        isOpen: true,
        offer: 'Festive Organic Cotton Range',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600',
        tags: ['Sustainable', 'Organic Cotton'],
        operatingHours: '10:00 AM – 10:00 PM',
        phone: '+91 484 408 1234',
        lat: 10.0274,
        lng: 76.3083,
    },

    // ── 8. Kottakkal Arya Vaidya Sala ────────
    {
        id: 'kottakkal',
        name: 'Kottakkal Arya Vaidya Sala',
        location: 'MG Road, Ernakulam',
        fullAddress: 'MG Road, Near Padma Theatre, Ernakulam 682011',
        category: 'pharmacy',
        cuisine: 'Ayurvedic · Traditional Medicine',
        rating: 4.9,
        reviewCount: 3200,
        deliveryTime: '45-60 min',
        deliveryFee: 0,
        minOrder: 300,
        distance: '1.3 km',
        isFeatured: true,
        isOpen: true,
        offer: 'Free Ayurvedic Consultation',
        image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600',
        tags: ['Heritage', 'Authentic Ayurveda'],
        operatingHours: '8:30 AM – 7:30 PM',
        phone: '+91 484 236 8600',
        lat: 9.9721,
        lng: 76.2890,
    },

    // ── 9. Himalaya Wellness Store ───────────
    {
        id: 'himalaya',
        name: 'Himalaya Wellness Store',
        location: 'Marine Drive, Kochi',
        fullAddress: 'Marine Drive, Near High Court, Ernakulam 682031',
        category: 'pharmacy',
        cuisine: 'Herbal · Wellness · Natural Products',
        rating: 4.5,
        reviewCount: 1450,
        deliveryTime: '30-45 min',
        deliveryFee: 25,
        minOrder: 200,
        distance: '0.9 km',
        isFeatured: false,
        isOpen: true,
        offer: 'Buy 2 Get 1 Free on Supplements',
        image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600',
        tags: ['Trusted', 'Herbal Remedies'],
        operatingHours: '9:00 AM – 9:00 PM',
        phone: '+91 484 237 9800',
        lat: 9.9723,
        lng: 76.2731,
    },

    // ── 10. Lulu Mall (Marketplace) ──────────
    // Source: kochi.lulumall.in — 300+ stores
    // Real brands: Starbucks, Burger King, Levi's, Apple, Malabar Gold,
    //              Arrow, Bose, Crocs, Forest Essentials, Kama Ayurveda
    {
        id: 'lulu_mall',
        name: 'Lulu Mall Kochi',
        location: 'Edapally, Kochi',
        fullAddress: 'NH 66 Bypass, Edapally Junction, Kochi 682024',
        category: 'lifestyle',
        cuisine: 'Multi-brand · Fashion · Electronics',
        rating: 4.6,
        reviewCount: 12500,
        deliveryTime: 'Concierge 1hr',
        deliveryFee: 0,
        minOrder: 500,
        distance: '2.4 km',
        isFeatured: true,
        isOpen: true,
        offer: 'Weekend Mega Sale – Up to 60% Off',
        image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=600',
        tags: ['Premium', 'Largest Mall in Kerala'],
        operatingHours: '10:00 AM – 10:00 PM',
        phone: '+91 484 272 7776',
        lat: 10.0274,
        lng: 76.3083,
    },
];

// ══════════════════════════════════════════════
//  PRODUCTS (real menu/product data)
// ══════════════════════════════════════════════

const PRODUCTS = [

    // ─── Calicut Paragon ─────────────────────

    {
        id: 'p1',
        storeId: 'paragon',
        name: 'Mutton Dum Biryani',
        description: 'The legendary Paragon Biryani — slow-cooked aromatic basmati with tender mutton and Malabar secret spices.',
        price: 360,
        originalPrice: 400,
        category: 'Legendary Biryanis',
        isVeg: false,
        isBestseller: true,
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
        customizable: true,
        tags: ['Award Winning', 'Must Try'],
        addons: ['Extra Raitha', 'Double Ghee', 'Boiled Egg'],
    },
    {
        id: 'p2',
        storeId: 'paragon',
        name: 'Fish Mango Curry',
        description: 'Traditional Kerala fish curry in coconut milk with tangy raw mangoes — the quintessential Malabar dish.',
        price: 450,
        originalPrice: null,
        category: 'Kerala Specialties',
        isVeg: false,
        isBestseller: true,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1626509135522-532252c4033e?w=400',
        customizable: false,
        tags: ['Authentic', 'Spicy'],
        addons: ['Appam (2 pcs)', 'Kerala Porotta (2 pcs)'],
    },

    // ─── Grand Hotel ─────────────────────────

    {
        id: 'p3',
        storeId: 'grand_hotel',
        name: 'Kerala Fish Meals',
        description: 'The iconic Grand Hotel fish meals — rice, sambar, rasam, avial, thoran, fish curry, and payasam.',
        price: 199,
        originalPrice: null,
        category: 'Unlimited Meals',
        isVeg: false,
        isBestseller: true,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
        customizable: false,
        tags: ['Heritage', 'Unlimited'],
        addons: ['Extra Fish Fry', 'Beef Fry'],
    },
    {
        id: 'p4',
        storeId: 'grand_hotel',
        name: 'Beef Ularthiyathu',
        description: 'Slow-roasted Kerala beef dry fry with coconut slivers and curry leaves — a true Ernakulam speciality.',
        price: 280,
        originalPrice: 320,
        category: 'Signature Dishes',
        isVeg: false,
        isBestseller: true,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
        customizable: false,
        tags: ['Must Try', 'Spicy'],
        addons: ['Kerala Porotta (2 pcs)', 'Pathiri'],
    },

    // ─── Kashi Art Cafe ──────────────────────

    {
        id: 'p5',
        storeId: 'kashi_art_cafe',
        name: 'Mediterranean Mezze Platter',
        description: 'Hummus, falafel, pita, tzatziki, and roasted veggies — global flavours in the heart of Fort Kochi.',
        price: 520,
        originalPrice: 580,
        category: 'Global Bites',
        isVeg: true,
        isBestseller: true,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
        customizable: true,
        tags: ['Healthy', 'Vegetarian'],
        addons: ['Extra Hummus', 'Grilled Halloumi'],
    },
    {
        id: 'p6',
        storeId: 'kashi_art_cafe',
        name: 'Artisan Cold Brew Coffee',
        description: 'Slow-steeped 18-hour cold brew from Wayanad single-origin beans — served with house-made oat milk.',
        price: 280,
        originalPrice: null,
        category: 'Artisan Beverages',
        isVeg: true,
        isBestseller: false,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        customizable: true,
        tags: ['Single Origin', 'Wayanad'],
        addons: ['Oat Milk Shot', 'Vanilla Syrup', 'Caramel Drizzle'],
    },

    // ─── Kayees Rahmathulla ──────────────────
    // Source: restaurant-guru.in menu — real dishes

    {
        id: 'p7',
        storeId: 'kayees',
        name: 'Kayees Special Chicken Biryani',
        description: 'The legendary Mattancherry biryani — fragrant basmati layered with spiced chicken, slow-cooked since 1948.',
        price: 220,
        originalPrice: null,
        category: 'Biryani Specials',
        isVeg: false,
        isBestseller: true,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
        customizable: false,
        tags: ['Legendary', 'Since 1948'],
        addons: ['Extra Raitha', 'Egg Masala'],
    },
    {
        id: 'p7b',
        storeId: 'kayees',
        name: 'Beef Roast',
        description: 'Slow-cooked Kerala-style beef roast with coconut slivers and aromatic spices — a Kayees customer favourite.',
        price: 180,
        originalPrice: null,
        category: 'Kerala Non-Veg',
        isVeg: false,
        isBestseller: true,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
        customizable: false,
        tags: ['Spicy', 'Popular'],
        addons: ['Porotta (2)', 'Pathiri'],
    },
    {
        id: 'p7c',
        storeId: 'kayees',
        name: 'Fried Fish (Karimeen)',
        description: 'Crispy golden fried pearl spot fish marinated in Kerala spices — fresh catch served daily.',
        price: 260,
        originalPrice: null,
        category: 'Seafood',
        isVeg: false,
        isBestseller: false,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1626509135522-532252c4033e?w=400',
        customizable: false,
        tags: ['Fresh Catch', 'Crispy'],
        addons: ['Lemon Rice', 'Fish Curry'],
    },
    {
        id: 'p7d',
        storeId: 'kayees',
        name: 'Chicken Curry with Rice',
        description: 'Aromatic Kerala-style chicken curry served with fluffy steamed Palakkadan Matta rice.',
        price: 160,
        originalPrice: null,
        category: 'Kerala Non-Veg',
        isVeg: false,
        isBestseller: false,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
        customizable: false,
        tags: ['Comfort Food'],
        addons: ['Extra Rice', 'Papadam'],
    },

    // ─── Jayalakshmi Silks ───────────────────
    // Source: jayalakshmisilks.com — real product images from their CDN

    {
        id: 'p8',
        storeId: 'jayalakshmi',
        name: 'Kanjivaram Silk Saree',
        description: 'GI-tagged handwoven Kanchipuram pure silk saree with intricate golden zari border — temple art motifs woven since the Pallava dynasty.',
        price: 12500,
        originalPrice: 15000,
        category: 'Kanjivaram Collection',
        isVeg: null,
        isBestseller: true,
        rating: 4.9,
        image: 'https://jayalakshmisilks.com/storage/1060/Jaylakshmi-Silks_11839_FIV.jpg',
        customizable: true,
        tags: ['GI Tagged', 'Handwoven'],
        addons: ['Blouse Stitching', 'Fall & Pico'],
    },
    {
        id: 'p8b',
        storeId: 'jayalakshmi',
        name: 'Kanjivaram Bridal Saree',
        description: 'Grand bridal Kanjivaram with heavy zari work — pure mulberry silk with gold and silver threads.',
        price: 18500,
        originalPrice: 22000,
        category: 'Kanjivaram Collection',
        isVeg: null,
        isBestseller: true,
        rating: 5.0,
        image: 'https://jayalakshmisilks.com/storage/1064/JAYALAKSHMI5232-(1).jpg',
        customizable: true,
        tags: ['Bridal', 'Pure Silk'],
        addons: ['Designer Blouse', 'Gift Box'],
    },
    {
        id: 'p8c',
        storeId: 'jayalakshmi',
        name: 'Banarasi Silk Saree',
        description: 'Premium Banarasi silk with Mughal-era floral patterns and real zari — 2000+ years of Varanasi weaving heritage.',
        price: 9800,
        originalPrice: 12000,
        category: 'Banarasi Collection',
        isVeg: null,
        isBestseller: true,
        rating: 4.8,
        image: 'https://jayalakshmisilks.com/storage/1061/JAYALAKSHMI5487-copy-(2).jpg',
        customizable: true,
        tags: ['Mughal Heritage', 'Real Zari'],
        addons: ['Blouse Stitching', 'Fall & Pico'],
    },
    {
        id: 'p9',
        storeId: 'jayalakshmi',
        name: 'Kerala Kasavu Saree',
        description: 'Traditional Kerala cream and gold kasavu saree — the iconic mundu-neriyathu set for Onam, Vishu, and temple visits.',
        price: 3800,
        originalPrice: 4500,
        category: 'Kasavu Collection',
        isVeg: null,
        isBestseller: false,
        rating: 4.7,
        image: 'https://jayalakshmisilks.com/storage/1065/JAYALAKSHMI5136.jpg',
        customizable: true,
        tags: ['Festive', 'Kerala Heritage'],
        addons: ['Custom Tailoring', 'Gift Wrap'],
    },
    {
        id: 'p9b',
        storeId: 'jayalakshmi',
        name: 'Fancy Designer Saree',
        description: 'Contemporary fancy saree with intricate embroidery — elegant draping for parties, festivals, and special occasions.',
        price: 5200,
        originalPrice: 6500,
        category: 'Fancy Collection',
        isVeg: null,
        isBestseller: false,
        rating: 4.6,
        image: 'https://jayalakshmisilks.com/storage/1059/Saree-(1).jpg',
        customizable: true,
        tags: ['Party Wear', 'Designer'],
        addons: ['Blouse Material', 'Gift Packaging'],
    },
    {
        id: 'p9c',
        storeId: 'jayalakshmi',
        name: 'Silk Saree — Classic',
        description: 'Pure silk saree with elegant golden border — timeless design from the Jayalakshmi Silks premium range.',
        price: 7500,
        originalPrice: 8500,
        category: 'Silk Collection',
        isVeg: null,
        isBestseller: false,
        rating: 4.7,
        image: 'https://jayalakshmisilks.com/storage/1066/JAYALAKSHMI5523-copy.jpg',
        customizable: true,
        tags: ['Classic', 'Pure Silk'],
        addons: ['Blouse Stitching', 'Fall & Pico'],
    },

    // ─── Pranaah ─────────────────────────────

    {
        id: 'p10',
        storeId: 'pranaah',
        name: 'Handloom Kurta Set',
        description: 'Designed by Poornima Indrajith — handloom cotton kurta with contrast dupatta, blending traditional and modern aesthetics.',
        price: 4200,
        originalPrice: 5000,
        category: 'Signature Collection',
        isVeg: null,
        isBestseller: true,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
        customizable: true,
        tags: ['Celebrity Designer', 'Limited Edition'],
        addons: ['Custom Sizing', 'Gift Packaging'],
    },

    // ─── FabIndia ────────────────────────────

    {
        id: 'p11',
        storeId: 'fabindia',
        name: 'Block Print Cotton Kurta',
        description: 'Hand block-printed organic cotton kurta from Rajasthan artisans — brought to Kochi by FabIndia at Lulu Mall.',
        price: 1890,
        originalPrice: 2200,
        category: 'Organic Cotton',
        isVeg: null,
        isBestseller: true,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
        customizable: false,
        tags: ['Artisan Made', 'Eco Friendly'],
        addons: ['Matching Pants', 'Dupatta'],
    },

    // ─── Kottakkal Arya Vaidya Sala ──────────

    {
        id: 'p12',
        storeId: 'kottakkal',
        name: 'Chyawanprash (500g)',
        description: 'Traditional Ayurvedic immunity booster prepared with 40+ herbs — made by the 122-year-old Kottakkal AVS.',
        price: 340,
        originalPrice: 380,
        category: 'Immunity & Vitality',
        isVeg: true,
        isBestseller: true,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400',
        customizable: false,
        tags: ['Authentic', 'Heritage'],
        addons: ['Ashwagandha Tablets', 'Brahmi Ghritam'],
    },
    {
        id: 'p13',
        storeId: 'kottakkal',
        name: 'Dhanwantharam Thailam',
        description: 'Renowned Ayurvedic oil for joint health and prenatal care — pure and authentic from Kottakkal AVS.',
        price: 290,
        originalPrice: null,
        category: 'Ayurvedic Oils',
        isVeg: true,
        isBestseller: false,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
        customizable: false,
        tags: ['Classical', 'Therapeutic'],
        addons: ['Karpooradi Thailam', 'Eladi Coconut Oil'],
    },

    // ─── Himalaya Wellness ───────────────────

    {
        id: 'p14',
        storeId: 'himalaya',
        name: 'Himalaya Ashvagandha Tablets',
        description: 'Natural stress reliever and energy booster — pure Ashwagandha extract from Himalaya Herbals.',
        price: 250,
        originalPrice: 290,
        category: 'Herbal Supplements',
        isVeg: true,
        isBestseller: true,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
        customizable: false,
        tags: ['Bestseller', 'Natural'],
        addons: ['Liv.52 Tablets', 'Triphala Capsules'],
    },

    // ─── Lulu Mall ───────────────────────────
    // Source: kochi.lulumall.in — real brand names

    {
        id: 'p15',
        storeId: 'lulu_mall',
        name: 'Starbucks Coffee Experience',
        description: 'Premium handcrafted beverages at the Starbucks outlet inside Lulu Mall Kochi — lattes, frappuccinos, and cold brews.',
        price: 450,
        originalPrice: null,
        category: 'Cafe & Restaurants',
        isVeg: true,
        isBestseller: true,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        customizable: true,
        tags: ['Starbucks', 'Premium Coffee'],
        addons: ['Extra Shot', 'Oat Milk', 'Caramel Drizzle'],
    },
    {
        id: 'p15b',
        storeId: 'lulu_mall',
        name: "Levi's 511 Slim Fit Jeans",
        description: "Original Levi's 511 slim fit jeans from the Levi's store at Lulu Mall — comfort stretch denim.",
        price: 3299,
        originalPrice: 4499,
        category: "Men's Fashion",
        isVeg: null,
        isBestseller: true,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400',
        customizable: false,
        tags: ["Levi's", 'Slim Fit'],
        addons: ['Belt', 'T-Shirt Combo'],
    },
    {
        id: 'p15c',
        storeId: 'lulu_mall',
        name: 'Apple AirPods Pro (2nd Gen)',
        description: 'Apple AirPods Pro with USB-C — available at Apple Imagine Store, Lulu Mall Kochi.',
        price: 24900,
        originalPrice: 26900,
        category: 'Mobile & Electronics',
        isVeg: null,
        isBestseller: true,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
        customizable: false,
        tags: ['Apple', 'Bestseller'],
        addons: ['AppleCare+', 'Silicone Case'],
    },
    {
        id: 'p15d',
        storeId: 'lulu_mall',
        name: 'Malabar Gold Necklace',
        description: 'Handcrafted 22K gold necklace from Malabar Gold & Diamonds — traditional Kerala design at Lulu Mall.',
        price: 85000,
        originalPrice: null,
        category: 'Jewellery',
        isVeg: null,
        isBestseller: false,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6e5?w=400',
        customizable: true,
        tags: ['Malabar Gold', '22K'],
        addons: ['Earrings Set', 'Gift Box'],
    },
    {
        id: 'p15e',
        storeId: 'lulu_mall',
        name: 'Forest Essentials Night Cream',
        description: 'Luxury Ayurveda night cream from Forest Essentials — available at the Beauty & Wellness zone, Lulu Mall.',
        price: 2475,
        originalPrice: 2750,
        category: 'Beauty & Wellness',
        isVeg: true,
        isBestseller: false,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
        customizable: false,
        tags: ['Forest Essentials', 'Luxury Ayurveda'],
        addons: ['Face Serum', 'Under Eye Cream'],
    },
    {
        id: 'p15f',
        storeId: 'lulu_mall',
        name: 'Burger King Whopper Meal',
        description: 'The classic flame-grilled Whopper meal with fries and a drink — Burger King at Lulu Mall Food Court.',
        price: 299,
        originalPrice: 349,
        category: 'Cafe & Restaurants',
        isVeg: false,
        isBestseller: true,
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        customizable: true,
        tags: ['Burger King', 'Value Meal'],
        addons: ['Onion Rings', 'Ice Cream Sundae'],
    },
    {
        id: 'p15g',
        storeId: 'lulu_mall',
        name: 'Crocs Classic Clog',
        description: 'The iconic Crocs Classic Clog — lightweight, comfortable, and available in all colours at Lulu Mall.',
        price: 2995,
        originalPrice: 3495,
        category: 'Footwear & Bags',
        isVeg: null,
        isBestseller: false,
        rating: 4.4,
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400',
        customizable: false,
        tags: ['Crocs', 'Comfort'],
        addons: ['Jibbitz Charms'],
    },
    {
        id: 'p15h',
        storeId: 'lulu_mall',
        name: 'Bose QuietComfort Headphones',
        description: 'Premium noise-cancelling headphones from the Bose store at Lulu Mall — immersive audio experience.',
        price: 26900,
        originalPrice: 29900,
        category: 'Mobile & Electronics',
        isVeg: null,
        isBestseller: false,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        customizable: false,
        tags: ['Bose', 'Noise Cancelling'],
        addons: ['Carrying Case', 'Extra Earpads'],
    },
];

// ── Promotional Banners ──────────────────────

const BANNERS = [
    {
        id: '1',
        title: 'Lulu Mall Kochi',
        subtitle: '300+ brands. One destination.',
        bgColor: '#0F0F1A',
        category: 'lifestyle',
        image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800',
        storeId: 'lulu_mall',
    },
    {
        id: '2',
        title: 'Jayalakshmi Bridal Sale',
        subtitle: 'Kanjivaram & Banarasi Collection – 30% Off',
        bgColor: '#5D3FD3',
        category: 'shopping',
        storeId: 'jayalakshmi',
    },
    {
        id: '3',
        title: 'Kashi Art Cafe',
        subtitle: 'Art, Coffee & Global Flavours in Fort Kochi',
        bgColor: '#1B4332',
        category: 'food',
        storeId: 'kashi_art_cafe',
    },
    {
        id: '4',
        title: 'Ayurveda Week at Kottakkal',
        subtitle: 'Free Consultation + Flat 20% on Products',
        bgColor: '#1A472A',
        category: 'pharmacy',
        storeId: 'kottakkal',
    },
];

// ── Orders ───────────────────────────────────

const ORDERS = [
    {
        id: 'ORD101',
        storeId: 'paragon',
        storeName: 'Calicut Paragon',
        storeImage: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=100',
        items: [
            { name: 'Mutton Dum Biryani', qty: 1, price: 360 },
            { name: 'Fish Mango Curry', qty: 1, price: 450 },
        ],
        totalAmount: 810,
        status: 'Preparing',
        date: '2026-03-11',
        deliveryAddress: '32, Marine Drive, Kochi',
        deliveryTime: 'Active',
        paymentMethod: 'Swim.ai Wallet',
        rating: null,
    },
    {
        id: 'ORD099',
        storeId: 'kayees',
        storeName: 'Kayees Rahmathulla Cafe',
        storeImage: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=100',
        items: [
            { name: 'Kayees Special Chicken Biryani', qty: 2, price: 220 },
            { name: 'Beef Roast', qty: 1, price: 180 },
        ],
        totalAmount: 620,
        status: 'Delivered',
        date: '2026-03-09',
        deliveryAddress: 'Infopark Phase 1, Kakkanad',
        deliveryTime: '28 min',
        paymentMethod: 'UPI',
        rating: 5,
    },
];

// ── Addresses ────────────────────────────────

const ADDRESSES = [
    {
        id: 'addr1',
        type: 'Home',
        icon: 'home',
        addressLine1: '32, Marine Drive',
        addressLine2: 'Ernakulam, Kochi',
        pincode: '682031',
        isDefault: true,
        lat: 9.9723,
        lng: 76.2731,
    },
    {
        id: 'addr2',
        type: 'Office',
        icon: 'briefcase',
        addressLine1: 'Infopark Phase 1',
        addressLine2: 'Kakkanad, Kochi',
        pincode: '682030',
        isDefault: false,
        lat: 10.0104,
        lng: 76.3503,
    },
];

// ── Notifications ────────────────────────────

const NOTIFICATIONS = [
    {
        id: 'n1',
        type: 'order',
        title: 'Chef is preparing! 👨‍🍳',
        message: 'Your order from Calicut Paragon is being prepared with fresh ingredients.',
        time: 'Just now',
        isRead: false,
        orderId: 'ORD101',
    },
    {
        id: 'n2',
        type: 'offer',
        title: 'Jayalakshmi Bridal Sale 🎉',
        message: 'Flat 30% off on Kanjivaram Silk Sarees — this weekend only at Jayalakshmi Silks, MG Road.',
        time: '2 hours ago',
        isRead: false,
        orderId: null,
    },
    {
        id: 'n3',
        type: 'promo',
        title: 'Free Ayurveda Consultation 🌿',
        message: 'Kottakkal Arya Vaidya Sala is offering free online consultations. Book yours now!',
        time: '5 hours ago',
        isRead: true,
        orderId: null,
    },
];

// ── Trending & Search ────────────────────────

const RECENT_SEARCHES = ['Biryani', 'Kanjivaram Saree', 'Ashwagandha', 'Kerala Meals'];
const TRENDING_SEARCHES = ['Kayees Biryani 🍛', 'Kashi Art Cafe ☕', 'Silk Sarees 🧵', 'Ayurveda 🌿', 'Lulu Mall 🛍️'];

// ── Sort & Filter ────────────────────────────

const SORT_OPTIONS = ['Relevance', 'Rating', 'Delivery Time', 'Price (Low to High)'];

// ── Payment Methods ──────────────────────────

const PAYMENT_METHODS = [
    { id: 'upi', name: 'UPI', icon: 'phone-portrait', desc: 'Pay via any UPI app' },
    { id: 'card', name: 'Card', icon: 'card', desc: 'Credit / Debit Card' },
    { id: 'wallet', name: 'Wallet', icon: 'wallet', desc: 'Swim.ai Wallet • ₹120' },
    { id: 'cod', name: 'Cash', icon: 'cash', desc: 'Pay on Delivery' },
];

// ── Order Tracking ───────────────────────────

const ORDER_STATUS_STEPS = [
    { id: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle', desc: 'Order accepted' },
    { id: 'preparing', label: 'Preparing', icon: 'restaurant', desc: 'Kitchen at work' },
    { id: 'pickup', label: 'Picked Up', icon: 'bicycle', desc: 'On the way' },
    { id: 'delivered', label: 'Delivered', icon: 'home', desc: 'At your door' },
];

// ── Delivery Partner ─────────────────────────

const DELIVERY_PARTNER = {
    name: 'Rajan Kumar',
    rating: 4.9,
    vehicle: 'Electric Scooter',
    phone: '+91 9876543210',
    totalDeliveries: 1240,
};

// ── Profile Menu ─────────────────────────────

const PROFILE_MENU_SECTIONS = [
    {
        title: 'Orders & Wallet',
        items: [
            { id: 'orders', label: 'My Orders', icon: 'receipt-outline', badge: '2', route: 'OrderHistory' },
            { id: 'wallet', label: 'Swim.ai Wallet', icon: 'wallet-outline', value: '₹120', route: 'Wallet' },
            { id: 'coupons', label: 'Offers & Coupons', icon: 'pricetag-outline', badge: 'NEW', route: 'Coupons' },
        ],
    },
    {
        title: 'Account',
        items: [
            { id: 'addresses', label: 'Saved Addresses', icon: 'location-outline', route: 'AddressSelect' },
            { id: 'payments', label: 'Payment Methods', icon: 'card-outline', route: 'Payments' },
            { id: 'notifications', label: 'Notifications', icon: 'notifications-outline', route: 'Notifications' },
        ],
    },
    {
        title: 'Support',
        items: [
            { id: 'help', label: 'Help & Support', icon: 'help-circle-outline', route: 'Support' },
            { id: 'rate', label: 'Rate the App', icon: 'star-outline', route: null },
            { id: 'about', label: 'About Swim.ai', icon: 'information-circle-outline', route: null },
        ],
    },
];

// ── Promo Codes ──────────────────────────────

const PROMO_CODES = {
    FIRST50: { discount: 0.5, maxDiscount: 100 },
    SAVE20: { discount: 0.2, maxDiscount: 60 },
    FREE: { discount: 0, maxDiscount: 0, freeDelivery: true },
    KOCHI10: { discount: 0.1, maxDiscount: 150 },
};

// ── Icon Maps ────────────────────────────────

const NOTIFICATION_ICONS = {
    order: { icon: 'receipt', color: '#0096C7' },
    offer: { icon: 'pricetag', color: '#D29922' },
    promo: { icon: 'gift', color: '#3FB950' },
};

const BANNER_ICONS = {
    food: 'restaurant',
    grocery: 'cart',
    pharmacy: 'medical',
    shopping: 'bag',
    lifestyle: 'star',
};

// ── App Config ───────────────────────────────

const APP_CONFIG = {
    defaultLocation: {
        title: 'Marine Drive, Kochi',
        lat: 9.9723,
        lng: 76.2731,
    },
    heroTitle: 'Discover the Best of\nErnakulam',
    searchPlaceholder: 'Search stores or dishes...',
    nearbyLabel: 'Around Marine Drive',
    featuredLabel: 'Legendary Stores',
    currency: '₹',
    appName: 'Swim.ai',
};

// ── Legacy Aliases ───────────────────────────
const MOCK_STORES = STORES;
const MOCK_PRODUCTS = PRODUCTS;
const MOCK_BANNERS = BANNERS;
const MOCK_ORDERS = ORDERS;
const MOCK_ADDRESSES = ADDRESSES;
const MOCK_NOTIFICATIONS = NOTIFICATIONS;

module.exports = { SERVICE_CATEGORIES, BANNERS, STORES, PRODUCTS, ADDRESSES, ORDERS, NOTIFICATIONS, SEARCH_TERMS, PAYMENT_METHODS, ORDER_STATUS_STEPS, DELIVERY_PARTNER, PROFILE_MENU_SECTIONS, NOTIFICATION_ICONS, BANNER_ICONS, APP_CONFIG, RECENT_SEARCHES, TRENDING_SEARCHES, SORT_OPTIONS, PROMO_CODES };