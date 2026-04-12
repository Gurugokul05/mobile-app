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
import { useAppAlert } from "../../context/AlertContext";

const statusColor = {
  Pending: colors.warning,
  Accepted: "#2563EB",
  Packed: colors.accent,
  Shipped: colors.secondary,
  Delivered: colors.success,
  Rejected: colors.error,
};

const normalizeOrderStatus = (status) => {
  if (status === "Ordered") return "Pending";
  if (status === "Cancelled") return "Rejected";
  return status || "Pending";
};

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const insets = useSafeAreaInsets();
  const { showAlert } = useAppAlert();

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

  const getAddressText = (address) => {
    if (!address) return "No address provided";

    return [address.street, address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(", ");
  };

  const handlePendingDecision = async (orderId, action) => {
    const actionKey = `${orderId}:${action}`;

    try {
      setActionLoading(actionKey);
      await api.put(`/orders/${orderId}/${action}`);
      await fetchOrders();
      showAlert({
        title: "Updated",
        message: `Order ${action}ed successfully`,
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Action Failed",
        message:
          error?.response?.data?.message ||
          `Unable to ${action} this order right now`,
        type: "error",
      });
    } finally {
      setActionLoading("");
    }
  };

  const renderItem = ({ item }) => {
    const status = normalizeOrderStatus(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.orderId}>
            Order #{String(item._id || "").slice(-6)}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: statusColor[status] || colors.textSecondary,
              },
            ]}
          >
            <Text style={styles.badgeText}>{status}</Text>
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

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            navigation.navigate("SellerOrderDetail", { orderId: item._id })
          }
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPendingOrder = ({ item }) => {
    const isAcceptLoading = actionLoading === `${item._id}:accept`;
    const isRejectLoading = actionLoading === `${item._id}:reject`;
    const pendingActionLoading = isAcceptLoading || isRejectLoading;

    return (
      <View style={styles.pendingCard}>
        <Text style={styles.productName}>
          {item.productId?.name || "Product"}
        </Text>
        <Text style={styles.meta}>Quantity: {item.quantity || 1}</Text>
        <Text style={styles.meta}>Buyer: {item.buyerId?.name || "N/A"}</Text>
        <Text style={styles.meta}>
          Address: {getAddressText(item.shippingAddress)}
        </Text>

        <View style={styles.pendingActionsRow}>
          <TouchableOpacity
            style={styles.acceptButton}
            disabled={pendingActionLoading}
            onPress={() => handlePendingDecision(item._id, "accept")}
          >
            {isAcceptLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.pendingButtonText}>Accept</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectButton}
            disabled={pendingActionLoading}
            onPress={() => handlePendingDecision(item._id, "reject")}
          >
            {isRejectLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.pendingButtonText}>Reject</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

  const pendingOrders = orders.filter(
    (order) => normalizeOrderStatus(order.status) === "Pending",
  );

  const nonPendingOrders = orders.filter(
    (order) => normalizeOrderStatus(order.status) !== "Pending",
  );

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

        <TouchableOpacity
          style={styles.refundRequestsBtn}
          onPress={() => navigation.navigate("SellerRefundRequests")}
        >
          <Ionicons name="warning-outline" size={16} color={colors.white} />
          <Text style={styles.refundRequestsBtnText}>Refund Requests</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Pending Orders</Text>
        <FlatList
          data={pendingOrders}
          keyExtractor={(item) => `pending-${item._id}`}
          style={styles.pendingList}
          contentContainerStyle={styles.pendingListContent}
          renderItem={renderPendingOrder}
          ListEmptyComponent={
            <Text style={styles.pendingEmptyText}>No pending orders</Text>
          }
          horizontal
          showsHorizontalScrollIndicator={false}
        />

        <FlatList
          data={nonPendingOrders}
          keyExtractor={(item) => item._id}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 32 + insets.bottom },
            nonPendingOrders.length === 0 && styles.listContentEmpty,
          ]}
          renderItem={renderItem}
          ListEmptyComponent={
            pendingOrders.length === 0 ? renderEmptyState : null
          }
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  pendingList: {
    marginBottom: 12,
    maxHeight: 220,
  },
  pendingListContent: {
    paddingRight: 12,
  },
  pendingEmptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 10,
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
  refundRequestsBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1D4ED8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  refundRequestsBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
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
  pendingCard: {
    width: 300,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#FCD34D",
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
  detailsButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },
  detailsButtonText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 12,
  },
  pendingActionsRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
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
