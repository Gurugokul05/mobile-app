import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/buyer/HomeScreen";
import TrendingScreen from "../screens/buyer/TrendingScreen";
import PlacesScreen from "../screens/buyer/PlacesScreen";
import PlaceScreen from "../screens/buyer/PlaceScreen";
import ProductScreen from "../screens/buyer/ProductScreen";
import CartCheckoutScreen from "../screens/buyer/CartCheckoutScreen";
import UpiPaymentScreen from "../screens/buyer/UpiPaymentScreen";
import OrderTrackingScreen from "../screens/buyer/OrderTrackingScreen";
import ProfileScreen from "../screens/buyer/ProfileScreen";
import BuyerSellerProfileScreen from "../screens/buyer/SellerProfileScreen";
import RefundScreen from "../screens/buyer/RefundScreen";
import DashboardScreen from "../screens/seller/DashboardScreen";
import SellerOnboardingScreen from "../screens/seller/OnboardingScreen";
import ProductUploadScreen from "../screens/seller/ProductUploadScreen";
import OrdersScreen from "../screens/seller/OrdersScreen";
import ProductsScreen from "../screens/seller/ProductsScreen";
import InsightsScreen from "../screens/seller/InsightsScreen";
import SellerProfileScreen from "../screens/seller/SellerProfileScreen";
import SellerPublicStorePreviewScreen from "../screens/seller/SellerPublicStorePreviewScreen";
import SellerLowStockScreen from "../screens/seller/SellerLowStockScreen";
import SellerTransactionsScreen from "../screens/seller/SellerTransactionsScreen";
import SellerSecurityScreen from "../screens/seller/SellerSecurityScreen";
import SellerComplianceScreen from "../screens/seller/SellerComplianceScreen";
import SellerComplianceUploadScreen from "../screens/seller/SellerComplianceUploadScreen";
import SellerOrderDetailScreen from "../screens/seller/SellerOrderDetailScreen";
import SellerRefundRequestsScreen from "../screens/seller/SellerRefundRequestsScreen";
import SellerEvidencePlayerScreen from "../screens/seller/SellerEvidencePlayerScreen";
import AddressesScreen from "../screens/buyer/AddressesScreen";
import PaymentMethodsScreen from "../screens/buyer/PaymentMethodsScreen";
import BillingHistoryScreen from "../screens/buyer/BillingHistoryScreen";
import InfoScreen from "../screens/buyer/InfoScreen";
import WishlistScreen from "../screens/buyer/WishlistScreen";
import PrivacyPolicyScreen from "../screens/buyer/PrivacyPolicyScreen";
import TermsScreen from "../screens/buyer/TermsScreen";
import HelpCenterScreen from "../screens/buyer/HelpCenterScreen";

const Stack = createNativeStackNavigator();
const BuyerTab = createBottomTabNavigator();
const SellerTab = createBottomTabNavigator();

const BuyerTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <BuyerTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Trending") {
            iconName = focused ? "flame" : "flame-outline";
          } else if (route.name === "Cart") {
            iconName = focused ? "cart" : "cart-outline";
          } else if (route.name === "Orders") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          elevation: 0,
          shadowColor: "transparent",
          shadowOffset: { height: 0, width: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
      })}
    >
      <BuyerTab.Screen name="Home" component={HomeScreen} />
      <BuyerTab.Screen name="Trending" component={TrendingScreen} />
      <BuyerTab.Screen name="Cart" component={CartCheckoutScreen} />
      <BuyerTab.Screen name="Orders" component={OrderTrackingScreen} />
      <BuyerTab.Screen name="Profile" component={ProfileScreen} />
    </BuyerTab.Navigator>
  );
};

const SellerTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <SellerTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = "grid-outline";

          if (route.name === "Dashboard") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "Orders") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "Products") {
            iconName = focused ? "cube" : "cube-outline";
          } else if (route.name === "Insights") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else if (route.name === "SellerProfile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          elevation: 0,
          shadowColor: "transparent",
          shadowOffset: { height: 0, width: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 4,
        },
      })}
    >
      <SellerTab.Screen name="Dashboard" component={DashboardScreen} />
      <SellerTab.Screen name="Orders" component={OrdersScreen} />
      <SellerTab.Screen name="Products" component={ProductsScreen} />
      <SellerTab.Screen name="Insights" component={InsightsScreen} />
      <SellerTab.Screen
        name="SellerProfile"
        component={SellerProfileScreen}
        options={{ title: "Profile" }}
      />
    </SellerTab.Navigator>
  );
};

export default function AppNavigator() {
  const { user, userToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surface,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isAuthenticated = Boolean(userToken);
  const isSeller = user?.role === "seller";

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationEnabled: true,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name={isSeller ? "SellerHome" : "BuyerHome"}
              component={isSeller ? SellerTabs : BuyerTabs}
            />
          </>
        )}

        {/* Buyer Modals / Deep Pages */}
        <Stack.Screen name="Places" component={PlacesScreen} />
        <Stack.Screen name="PlaceScreen" component={PlaceScreen} />
        <Stack.Screen name="ProductScreen" component={ProductScreen} />
        <Stack.Screen
          name="BuyerSellerProfile"
          component={BuyerSellerProfileScreen}
        />
        <Stack.Screen name="Checkout" component={CartCheckoutScreen} />
        <Stack.Screen name="UpiPayment" component={UpiPaymentScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="Refunds" component={RefundScreen} />
        <Stack.Screen
          name="SellerOnboarding"
          component={SellerOnboardingScreen}
        />
        <Stack.Screen name="ProductUpload" component={ProductUploadScreen} />
        <Stack.Screen
          name="SellerOrderDetail"
          component={SellerOrderDetailScreen}
        />
        <Stack.Screen
          name="SellerRefundRequests"
          component={SellerRefundRequestsScreen}
        />
        <Stack.Screen
          name="SellerEvidencePlayer"
          component={SellerEvidencePlayerScreen}
        />
        <Stack.Screen
          name="SellerPublicStorePreview"
          component={SellerPublicStorePreviewScreen}
        />
        <Stack.Screen name="SellerLowStock" component={SellerLowStockScreen} />
        <Stack.Screen
          name="SellerTransactions"
          component={SellerTransactionsScreen}
        />
        <Stack.Screen name="SellerSecurity" component={SellerSecurityScreen} />
        <Stack.Screen
          name="SellerCompliance"
          component={SellerComplianceScreen}
        />
        <Stack.Screen
          name="SellerComplianceUpload"
          component={SellerComplianceUploadScreen}
        />

        {/* Profile Extension Screens */}
        <Stack.Screen name="Addresses" component={AddressesScreen} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
        <Stack.Screen name="BillingHistory" component={BillingHistoryScreen} />
        <Stack.Screen name="Info" component={InfoScreen} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
