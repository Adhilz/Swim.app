// ─────────────────────────────────────────────
//  Navigation: Root Navigator (React Navigation v7 + SDK 54)
// ─────────────────────────────────────────────
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../theme';
import { useAuthStore } from '../store/authStore';

// Screens
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import StoreDetailScreen from '../screens/store/StoreDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

// Cart badge
import { useCartStore } from '../store/cartStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Bottom Tab Navigator ───────────────────────────────
const MainTabs = () => {
    const totalItems = useCartStore(s => s.getTotalItems());

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    const icons = {
                        Home: focused ? 'home' : 'home-outline',
                        Search: focused ? 'search' : 'search-outline',
                        Cart: focused ? 'cart' : 'cart-outline',
                        Profile: focused ? 'person' : 'person-outline',
                    };
                    return (
                        <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name={icons[route.name]} size={size} color={color} />
                            {route.name === 'Cart' && totalItems > 0 && (
                                <View style={styles.tabBadge}>
                                    <Text style={styles.tabBadgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
                                </View>
                            )}
                        </View>
                    );
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    borderTopWidth: 1,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 68,
                },
                tabBarLabelStyle: {
                    ...Typography.caption,
                    fontWeight: '600',
                    marginTop: 2,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Cart" component={CartScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

// ── Root Stack Navigator ──────────────────────────────
const RootNavigator = () => {
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);

    return (
        <NavigationContainer
            theme={{
                dark: true,
                colors: {
                    primary: Colors.primary,
                    background: Colors.background,
                    card: Colors.surface,
                    text: Colors.textPrimary,
                    border: Colors.border,
                    notification: Colors.primary,
                },
                fonts: {
                    regular: { fontFamily: 'System', fontWeight: '400' },
                    medium: { fontFamily: 'System', fontWeight: '500' },
                    bold: { fontFamily: 'System', fontWeight: '700' },
                    heavy: { fontFamily: 'System', fontWeight: '900' },
                },
            }}
        >
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="StoreDetail" component={StoreDetailScreen} />
                        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ animation: 'slide_from_bottom' }} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} />
                        <Stack.Screen name="SearchModal" component={SearchScreen} options={{ animation: 'slide_from_bottom' }} />
                        <Stack.Screen name="AddressSelect" component={ProfileScreen} options={{ animation: 'slide_from_bottom' }} />
                        <Stack.Screen name="OrderHistory" component={ProfileScreen} />
                        <Stack.Screen name="StoreList" component={HomeScreen} />
                        <Stack.Screen name="Support" component={ProfileScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabBadge: {
        position: 'absolute',
        top: -6,
        right: -10,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: Colors.surface,
    },
    tabBadgeText: {
        ...Typography.caption,
        color: Colors.white,
        fontWeight: '700',
        fontSize: 9,
    },
});

export default RootNavigator;
