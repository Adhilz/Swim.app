import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../theme';
import { useAuthStore } from '../store/authStore';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import RequestDeliveryScreen from '../screens/request/RequestDeliveryScreen';
import StoreDetailScreen from '../screens/store/StoreDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AddressSelectScreen from '../screens/profile/AddressSelectScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import WalletScreen from '../screens/profile/WalletScreen';
import CouponsScreen from '../screens/profile/CouponsScreen';
import PaymentsScreen from '../screens/profile/PaymentsScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import OrderHistoryScreen from '../screens/profile/OrderHistoryScreen';
import ToastHost from '../components/common/ToastHost';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_META = {
    Home: { icon: 'home', activeIcon: 'home', label: 'Home' },
    Orders: { icon: 'receipt-long', activeIcon: 'receipt-long', label: 'Orders' },
    Ask: { icon: 'add', activeIcon: 'add', label: '' },
    Wallet: { icon: 'account-balance-wallet', activeIcon: 'account-balance-wallet', label: 'Wallet' },
    Profile: { icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
};

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarShowLabel: false,
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarItemStyle: styles.tabItem,
                tabBarIcon: ({ focused }) => {
                    const meta = TAB_META[route.name];
                    const isAsk = route.name === 'Ask';

                    return (
                        <View style={[styles.tabIconWrap, isAsk && styles.tabIconWrapRaised]}>
                            <View
                                style={[
                                    styles.tabIconBubble,
                                    focused && styles.tabIconBubbleActive,
                                    isAsk && styles.tabIconBubbleCenter,
                                ]}
                            >
                                <MaterialIcons
                                    name={focused ? meta.activeIcon : meta.icon}
                                    size={isAsk ? 26 : 22}
                                    color={isAsk ? Colors.white : focused ? Colors.primary : Colors.textSecondary}
                                />
                            </View>
                            {!isAsk ? (
                                <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                                    {meta.label}
                                </Text>
                            ) : null}
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Orders" component={OrderHistoryScreen} />
            <Tab.Screen name="Ask" component={RequestDeliveryScreen} />
            <Tab.Screen name="Wallet" component={WalletScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const RootNavigator = () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const isProfileComplete = useAuthStore(state => state.isProfileComplete);

    return (
        <>
            <NavigationContainer
                theme={{
                    dark: false,
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
                        heavy: { fontFamily: 'System', fontWeight: '800' },
                    },
                }}
            >
                <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                    {!isAuthenticated ? (
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    ) : !isProfileComplete ? (
                        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
                    ) : (
                        <>
                            <Stack.Screen name="Main" component={MainTabs} />
                            <Stack.Screen name="Cart" component={CartScreen} options={{ animation: 'slide_from_bottom' }} />
                            <Stack.Screen name="StoreDetail" component={StoreDetailScreen} />
                            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ animation: 'slide_from_bottom' }} />
                            <Stack.Screen name="Notifications" component={NotificationsScreen} />
                            <Stack.Screen name="Browse" component={SearchScreen} options={{ animation: 'slide_from_right' }} />
                            <Stack.Screen name="SearchModal" component={SearchScreen} options={{ animation: 'slide_from_bottom' }} />
                            <Stack.Screen name="AddressSelect" component={AddressSelectScreen} options={{ animation: 'slide_from_bottom' }} />
                            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
                            <Stack.Screen name="StoreList" component={HomeScreen} />
                            <Stack.Screen name="WalletDetails" component={WalletScreen} />
                            <Stack.Screen name="Coupons" component={CouponsScreen} />
                            <Stack.Screen name="Payments" component={PaymentsScreen} />
                            <Stack.Screen name="Support" component={SupportScreen} />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
            <ToastHost />
        </>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 24,
        height: 84,
        paddingTop: 10,
        paddingBottom: 12,
        paddingHorizontal: 14,
        borderTopWidth: 0,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 24,
        shadowColor: '#D8C0A8',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 20,
        elevation: 18,
    },
    tabItem: {
        paddingTop: 0,
    },
    tabIconWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        minWidth: 56,
    },
    tabIconWrapRaised: {
        marginTop: -32,
    },
    tabIconBubble: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    tabIconBubbleCenter: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        borderWidth: 4,
        borderColor: Colors.background,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 18,
        elevation: 14,
    },
    tabLabel: {
        ...Typography.labelSmall,
        color: Colors.textMuted,
        fontSize: 10,
        fontWeight: '700',
    },
    tabLabelActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
});

export default RootNavigator;
