import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { AlertProvider } from "./src/context/AlertContext";
import { WishlistProvider } from "./src/context/WishlistContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AlertProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <AppNavigator />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </AlertProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
