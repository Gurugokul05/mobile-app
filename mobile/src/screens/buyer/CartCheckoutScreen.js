import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import Button from "../../components/Button";
import api from "../../api/config";
import { useCart } from "../../context/CartContext";
import { useAppAlert } from "../../context/AlertContext";
import { Ionicons } from "@expo/vector-icons";
import ScreenSurface from "../../components/ScreenSurface";

let RazorpayCheckout = null;
try {
  RazorpayCheckout = require("react-native-razorpay");
} catch (_err) {
  RazorpayCheckout = null;
}

const CartCheckoutScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems, cartTotal, removeFromCart, clearCart } = useCart();
  const { showAlert } = useAppAlert();

  // Optional: If "Buy Now" provides a direct product, we mock it as a 1-item cart
  const directProduct = route.params?.product;
  const isDirectCheckout = !!directProduct;

  const activeCartItems = isDirectCheckout
    ? [{ ...directProduct, quantity: 1 }]
    : cartItems;

  const activeTotal = isDirectCheckout
    ? typeof directProduct.price === "string"
      ? parseFloat(directProduct.price.replace(/,/g, ""))
      : directProduct.price
    : cartTotal;

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (activeCartItems.length === 0) {
      showAlert({
        title: "Empty Cart",
        message: "Please add items to your cart first.",
        type: "warning",
      });
      return;
    }
    if (!address || !city) {
      showAlert({
        title: "Error",
        message: "Please enter full shipping address",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      // Create order for the first item (MOCK logic expects 1 product normally, we will just send the first)
      const mockProductId = activeCartItems[0]._id;
      const quantity = activeCartItems[0].quantity || 1;

      const orderPayload = {
        productId: mockProductId,
        quantity: quantity,
        shippingAddress: {
          street: address,
          city: city,
          state: "State",
          pincode: "000000",
        },
      };

      console.log("Creating order with payload:", orderPayload);

      const { data } = await api.post("/orders", orderPayload);

      console.log("Order created:", data);

      const isTestModePayment =
        data?.paymentMode === "test" ||
        data?.paymentMode === "mock" ||
        String(data?.rpOrderId || "").startsWith("mock_rp_");

      if (isTestModePayment) {
        await api.post(`/orders/${data.order._id}/verify-payment`, {
          razorpay_order_id: data.rpOrderId,
          razorpay_payment_id: "mock_payment_id",
          razorpay_signature: "mock_sig",
        });
      } else {
        if (!RazorpayCheckout?.open) {
          throw new Error(
            "Razorpay SDK is unavailable in Expo Go. Run backend in test/mock payment mode or use a development build.",
          );
        }

        const options = {
          description: "Payment for your Roots order",
          image:
            activeCartItems[0]?.images?.[0] ||
            "https://via.placeholder.com/150",
          currency: "INR",
          key:
            data?.razorpayKeyId ||
            process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
            "",
          amount: Number(data?.amount || Math.round(activeTotal * 100)),
          name: "Roots",
          order_id: data?.rpOrderId,
          theme: { color: colors.primary },
        };

        if (!options.key || !options.order_id) {
          throw new Error(
            "Razorpay setup is incomplete. Missing key or order id.",
          );
        }

        const paymentResult = await RazorpayCheckout.open(options);

        await api.post(`/orders/${data.order._id}/verify-payment`, {
          razorpay_order_id: paymentResult?.razorpay_order_id,
          razorpay_payment_id: paymentResult?.razorpay_payment_id,
          razorpay_signature: paymentResult?.razorpay_signature,
        });
      }

      if (!isDirectCheckout) clearCart();

      showAlert({
        title: "Success",
        message: "Payment successful! Order placed.",
        type: "success",
        onConfirm: () => navigation.navigate("BuyerHome"),
      });
    } catch (error) {
      console.error("Checkout error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      showAlert({
        title: "Checkout Failed",
        message:
          error?.description ||
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItemCard}>
      <Image
        source={{ uri: item.images?.[0] || "https://via.placeholder.com/150" }}
        style={styles.cartItemImage}
      />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cartItemPrice}>
          ₹{item.price} <Text style={styles.qtyText}>x {item.quantity}</Text>
        </Text>
      </View>
      {!isDirectCheckout && (
        <TouchableOpacity
          onPress={() => removeFromCart(item._id)}
          style={styles.removeBtn}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScreenSurface style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerTitle}>
            {isDirectCheckout ? "Checkout" : "Your Cart"}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 80 + insets.bottom },
          ]}
        >
          {activeCartItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="cart-outline"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>Your cart is empty</Text>
              <Button
                title="Start Shopping"
                onPress={() => navigation.navigate("Home")}
              />
            </View>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Items</Text>
              </View>

              <FlatList
                data={activeCartItems}
                renderItem={renderCartItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                contentContainerStyle={styles.listContainer}
              />

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryText}>Subtotal</Text>
                  <Text style={styles.summaryText}>
                    ₹{activeTotal.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryText}>Standard Shipping</Text>
                  <Text style={styles.summaryText}>Free</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalText}>Total</Text>
                  <Text style={styles.totalAmount}>
                    ₹{activeTotal.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Shipping Details</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Full Street Address"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="City"
                value={city}
                onChangeText={setCity}
                placeholderTextColor={colors.textSecondary}
              />

              {loading ? (
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                  style={{ marginTop: 24, marginBottom: 40 }}
                />
              ) : (
                <Button
                  title={`Pay ₹${activeTotal.toLocaleString()}`}
                  onPress={handleCheckout}
                  style={{ marginTop: 24, marginBottom: 40 }}
                />
              )}
            </>
          )}
        </ScrollView>
      </View>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginVertical: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  listContainer: {
    marginBottom: 24,
  },
  cartItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(232, 121, 249, 0.2)", // subtle violet hint
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.primary,
  },
  qtyText: {
    color: colors.textSecondary,
    fontWeight: "500",
  },
  removeBtn: {
    padding: 8,
    backgroundColor: colors.errorLight,
    borderRadius: 8,
  },
  summaryCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(232, 121, 249, 0.3)",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginTop: 4,
    marginBottom: 0,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
});

export default CartCheckoutScreen;
