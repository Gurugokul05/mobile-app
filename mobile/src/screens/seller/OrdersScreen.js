import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import api from "../../api/config";
import { colors } from "../../theme/colors";
import ScreenSurface from "../../components/ScreenSurface";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const statusColor = {
  Ordered: colors.warning,
  Packed: colors.accent,
  Shipped: colors.secondary,
  Delivered: colors.success,
};

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/seller/me/orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(
        "Seller orders fetch error:",
        error?.response?.data || error.message,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.orderId}>
          Order #{String(item._id || "").slice(-6)}
        </Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: statusColor[item.status] || colors.textSecondary,
            },
          ]}
        >
          <Text style={styles.badgeText}>{item.status || "Pending"}</Text>
        </View>
      </View>
      <Text style={styles.productName}>
        {item.productId?.name || "Product"}
      </Text>
      <Text style={styles.meta}>Buyer: {item.buyerId?.name || "N/A"}</Text>
      <Text style={styles.meta}>Qty: {item.quantity || 1}</Text>
      <Text style={styles.total}>
        ₹{(item.totalPrice || 0).toLocaleString()}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateWrap}>
      <Ionicons
        name="receipt-outline"
        size={56}
        color={colors.textSecondary}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No orders yet</Text>
      <Text style={styles.emptySubtitle}>
        Orders will appear here once customers place them
      </Text>
      <TouchableOpacity
        style={styles.emptyCtaButton}
        onPress={() => navigation.navigate("ProductUpload")}
      >
        <Text style={styles.emptyCtaText}>Start Selling</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <ScreenSurface style={styles.container}>
        <View
          style={[
            styles.screenContent,
            { paddingTop: insets.top + 8, paddingHorizontal: 16 },
          ]}
        >
          <View style={styles.titleWrap}>
            <Text style={styles.pageTitle}>Orders</Text>
            <Text style={styles.pageSubtitle}>Incoming buyer orders</Text>
          </View>
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </ScreenSurface>
    );
  }

  return (
    <ScreenSurface style={styles.container}>
      <View
        style={[
          styles.screenContent,
          { paddingTop: insets.top + 8, paddingHorizontal: 16 },
        ]}
      >
        <View style={styles.titleWrap}>
          <Text style={styles.pageTitle}>Orders</Text>
          <Text style={styles.pageSubtitle}>Incoming buyer orders</Text>
        </View>

        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 32 + insets.bottom },
            orders.length === 0 && styles.listContentEmpty,
          ]}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  screenContent: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  titleWrap: {
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  pageSubtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 14,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  orderId: {
    fontWeight: "700",
    color: colors.textPrimary,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  productName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  meta: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  total: {
    marginTop: 8,
    color: colors.primary,
    fontWeight: "800",
    fontSize: 18,
  },
  emptyStateWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIcon: {
    opacity: 0.3,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
  },
  emptyCtaButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#007AFF",
  },
  emptyCtaText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default OrdersScreen;
