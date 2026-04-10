import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/config";
import { useAppAlert } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import ScreenSurface from "../../components/ScreenSurface";

const OrderTrackingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { showAlert } = useAppAlert();
  const { userToken } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [userToken]);

  const fetchOrders = async () => {
    if (!userToken) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get("/orders/my-orders");
      setOrders(data || []);
    } catch (error) {
      if (error?.response?.status === 401) {
        setOrders([]);
        return;
      }
      showAlert({
        title: "Error",
        message: "Failed to fetch orders",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return colors.success;
      case "shipped":
        return colors.primary;
      case "packed":
        return colors.warning;
      case "ordered":
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "checkmark-done-circle";
      case "shipped":
        return "rocket-outline";
      case "packed":
        return "package-outline";
      case "ordered":
        return "bag-handle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.rowTop}>
        <Image
          source={{
            uri:
              item.productId?.images?.[0] ||
              item.productId?.image ||
              "https://via.placeholder.com/100",
          }}
          style={styles.productThumb}
        />
        <View style={styles.productMeta}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.productId?.name || "Product"}
          </Text>
          <Text style={styles.productPrice}>
            ₹{Number(item.totalPrice || item.totalAmount || 0).toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.rowMiddle}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Ionicons
            name={getStatusIcon(item.status)}
            size={16}
            color={colors.white}
          />
          <Text style={styles.statusBadgeText}>{item.status || "pending"}</Text>
        </View>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>

      <View style={styles.rowActions}>
        <TouchableOpacity style={styles.trackBtn}>
          <Text style={styles.trackBtnText}>Track</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const FilterChip = ({ label, value, selected }) => (
    <TouchableOpacity
      style={[styles.filterChip, selected && styles.filterChipActive]}
      onPress={() => setSelectedFilter(value)}
    >
      <Text
        style={[styles.filterChipText, selected && styles.filterChipTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === "all") return true;
    return order.status?.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <ScreenSurface style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topContainer}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Filters */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
            data={[
              { label: "All", value: "all" },
              { label: "Ordered", value: "ordered" },
              { label: "Packed", value: "packed" },
              { label: "Shipped", value: "shipped" },
              { label: "Delivered", value: "delivered" },
            ]}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <FilterChip
                label={item.label}
                value={item.value}
                selected={selectedFilter === item.value}
              />
            )}
          />
        </View>

        {/* Orders List */}
        <View style={styles.contentArea}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filteredOrders.length > 0 ? (
            <FlatList
              data={filteredOrders}
              renderItem={renderOrder}
              keyExtractor={(item) => item._id}
              contentContainerStyle={[
                styles.listContainer,
                { paddingBottom: 80 + insets.bottom },
              ]}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyCenterContainer}>
              <Ionicons
                name="bag-outline"
                size={50}
                color={colors.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptyText}>
                You don't have any{" "}
                {selectedFilter !== "all" ? selectedFilter : ""} orders yet
              </Text>
              <TouchableOpacity
                style={styles.startShoppingBtn}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={styles.startShoppingText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  topContainer: {
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    minHeight: 54,
  },
  backBtn: {
    width: 28,
    alignItems: "flex-start",
  },
  headerSpacer: {
    width: 28,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111827",
  },
  filterContainer: {
    backgroundColor: "#F9FAFB",
    marginTop: 8,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    alignSelf: "flex-start",
  },
  filterChipActive: {
    backgroundColor: "#007AFF",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 32,
  },
  contentArea: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  productMeta: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
    textTransform: "capitalize",
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
  },
  rowMiddle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 12,
  },
  rowActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  trackBtn: {
    backgroundColor: "#EFF6FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  trackBtnText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "600",
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  secondaryBtnText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    width: "100%",
  },
  emptyCenterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%",
    transform: [{ translateY: -30 }],
  },
  emptyIcon: {
    opacity: 0.3,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  startShoppingBtn: {
    marginTop: 14,
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  startShoppingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default OrderTrackingScreen;
