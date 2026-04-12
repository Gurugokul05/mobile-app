import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/config";
import { useCart } from "../../context/CartContext";
import { useAppAlert } from "../../context/AlertContext";
import ScreenSurface from "../../components/ScreenSurface";
import Button from "../../components/Button";

const STEPS = ["Cart", "Address", "Payment", "Confirm"];

const CartCheckoutScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems, cartTotal, removeFromCart, clearCart } = useCart();
  const { showAlert } = useAppAlert();

  const directProduct = route?.params?.product;
  const isDirectCheckout = !!directProduct;

  const activeCartItems = isDirectCheckout
    ? [{ ...directProduct, quantity: 1 }]
    : cartItems;

  const activeTotal = isDirectCheckout
    ? Number(String(directProduct?.price || 0).replace(/,/g, ""))
    : cartTotal;

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const estimatedDelivery = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const currentStep = city && address ? 2 : 1;

  const validate = () => {
    const next = {};
    if (!address.trim()) next.address = "Street address is required";
    if (!city.trim()) next.city = "City is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCheckout = async () => {
    if (activeCartItems.length === 0) {
      showAlert({
        title: "Empty Cart",
        message: "Please add items first",
        type: "warning",
      });
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      const first = activeCartItems[0];
      const payload = {
        productId: first._id,
        quantity: first.quantity || 1,
        shippingAddress: {
          street: address.trim(),
          city: city.trim(),
          state: "State",
          pincode: "000000",
        },
      };

      const { data } = await api.post("/orders", payload);
      if (!isDirectCheckout) clearCart();

      navigation.navigate("UpiPayment", {
        orderId: data?.order?._id,
        orderReference: data?.paymentSession?.orderReference,
        sellerName: data?.paymentSession?.sellerName,
        sellerUpiId: data?.paymentSession?.sellerUpiId,
        amount: data?.paymentSession?.amount,
        currency: data?.paymentSession?.currency || "INR",
        expiresAt: data?.paymentSession?.expiresAt,
      });
    } catch (error) {
      showAlert({
        title: "Checkout Failed",
        message: error?.response?.data?.message || "Could not create order",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRightAction = (item) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => removeFromCart(item._id)}
    >
      <Ionicons name="trash" size={18} color={colors.white} />
      <Text style={styles.deleteActionText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }) => (
    <Swipeable
      enabled={!isDirectCheckout}
      renderRightActions={() => renderRightAction(item)}
    >
      <View style={styles.cartItemCard}>
        <Image
          source={{
            uri: item.images?.[0] || "https://via.placeholder.com/150",
          }}
          style={styles.cartItemImage}
        />
        <View style={styles.cartItemInfo}>
          <Text style={styles.cartItemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cartItemMeta}>Qty: {item.quantity}</Text>
          <Text style={styles.cartItemPrice}>
            Rs {Number(item.price || 0).toLocaleString()}
          </Text>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <ScreenSurface style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>
            {isDirectCheckout ? "Checkout" : "Cart & Checkout"}
          </Text>
          <View style={styles.stepperRow}>
            {STEPS.map((step, idx) => {
              const stepIndex = idx + 1;
              const active = stepIndex <= currentStep;
              return (
                <View key={step} style={styles.stepItem}>
                  <View
                    style={[styles.stepDot, active && styles.stepDotActive]}
                  />
                  <Text
                    style={[styles.stepText, active && styles.stepTextActive]}
                  >
                    {step}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 84 + insets.bottom,
            paddingTop: 14,
          }}
        >
          {activeCartItems.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyArt}>:-)</Text>
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Button
                title="Start Shopping"
                onPress={() => navigation.navigate("Home")}
              />
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Items</Text>
              <FlatList
                data={activeCartItems}
                renderItem={renderCartItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 12 }}
              />

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    Rs {activeTotal.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping</Text>
                  <Text style={styles.summaryValue}>Free</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    Rs {activeTotal.toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.deliveryEta}>
                  Estimated delivery: {estimatedDelivery}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <TextInput
                style={[styles.input, errors.address && styles.inputError]}
                placeholder="Full street address"
                placeholderTextColor={colors.textSecondary}
                value={address}
                onChangeText={(value) => {
                  setAddress(value);
                  if (errors.address)
                    setErrors((prev) => ({ ...prev, address: undefined }));
                }}
              />
              {errors.address ? (
                <Text style={styles.errorText}>{errors.address}</Text>
              ) : null}

              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
                value={city}
                onChangeText={(value) => {
                  setCity(value);
                  if (errors.city)
                    setErrors((prev) => ({ ...prev, city: undefined }));
                }}
              />
              {errors.city ? (
                <Text style={styles.errorText}>{errors.city}</Text>
              ) : null}

              <Button
                title={
                  loading
                    ? "Processing..."
                    : `Pay Rs ${activeTotal.toLocaleString()}`
                }
                onPress={handleCheckout}
                disabled={loading}
                style={{ marginTop: 16 }}
              />
            </>
          )}
        </ScrollView>
      </View>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: colors.textPrimary },
  stepperRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepItem: { alignItems: "center", flex: 1 },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#C9D6E3",
    marginBottom: 5,
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepText: { fontSize: 11, color: colors.textSecondary, fontWeight: "700" },
  stepTextActive: { color: colors.primary },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  cartItemCard: {
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  cartItemImage: { width: 70, height: 70, borderRadius: 10, marginRight: 10 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  cartItemMeta: { marginTop: 4, fontSize: 12, color: colors.textSecondary },
  cartItemPrice: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
  },
  deleteAction: {
    width: 86,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  deleteActionText: {
    color: colors.white,
    marginLeft: 5,
    fontWeight: "700",
    fontSize: 12,
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { color: colors.textSecondary, fontSize: 13 },
  summaryValue: { color: colors.textPrimary, fontWeight: "700", fontSize: 13 },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 2,
  },
  totalLabel: { color: colors.textPrimary, fontWeight: "800" },
  totalValue: { color: colors.primary, fontWeight: "800" },
  deliveryEta: { marginTop: 6, fontSize: 12, color: colors.textSecondary },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 12, marginBottom: 10 },
  emptyWrap: { alignItems: "center", paddingTop: 14 },
  emptyArt: { fontSize: 40 },
  emptyTitle: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});

export default CartCheckoutScreen;
