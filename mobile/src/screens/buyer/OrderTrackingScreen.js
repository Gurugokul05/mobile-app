import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/config";
import { useAppAlert } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import ScreenSurface from "../../components/ScreenSurface";

const STAGES = ["pending", "accepted", "packed", "shipped", "delivered"];

const STATUS_STYLES = {
  pending: { color: colors.warning, icon: "time-outline" },
  accepted: { color: colors.primary, icon: "checkmark-circle-outline" },
  packed: { color: colors.primary, icon: "cube-outline" },
  shipped: { color: "#7C3AED", icon: "airplane-outline" },
  delivered: { color: colors.success, icon: "checkmark-done-circle-outline" },
  rejected: { color: colors.error, icon: "close-circle-outline" },
};

const normalizeStatus = (status) => {
  const s = String(status || "pending").toLowerCase();
  if (s === "ordered") return "pending";
  if (s === "cancelled") return "rejected";
  return s;
};

const formatDate = (value) => {
  if (!value) return "--";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const OrderTrackingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { showAlert } = useAppAlert();
  const { userToken } = useAuth();

  const fetchOrders = async (isRefreshing = false) => {
    if (!userToken) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);
      const { data } = await api.get("/orders/my-orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (_error) {
      showAlert({
        title: "Error",
        message: "Failed to fetch orders",
        type: "error",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userToken]);

  const filteredOrders = useMemo(() => {
    if (selectedFilter === "all") return orders;
    return orders.filter(
      (item) => normalizeStatus(item?.status) === selectedFilter,
    );
  }, [orders, selectedFilter]);

  const renderStage = (order, stage, index) => {
    const orderStatus = normalizeStatus(order?.status);
    const doneIndex = STAGES.indexOf(orderStatus);
    const isRejected = orderStatus === "rejected";

    const styleMeta = STATUS_STYLES[stage] || STATUS_STYLES.pending;
    const active = !isRejected && doneIndex >= index;

    return (
      <View key={`${order?._id}-${stage}`} style={styles.stageRow}>
        <View style={styles.stageLeft}>
          <View
            style={[
              styles.stageDot,
              { borderColor: styleMeta.color },
              active && { backgroundColor: styleMeta.color },
            ]}
          >
            <Ionicons
              name={styleMeta.icon}
              size={12}
              color={active ? colors.white : styleMeta.color}
            />
          </View>
          {index !== STAGES.length - 1 ? (
            <View style={styles.stageLine} />
          ) : null}
        </View>

        <View style={styles.stageContent}>
          <Text
            style={[styles.stageLabel, active && { color: colors.textPrimary }]}
          >
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </Text>
          <Text style={styles.stageTime}>
            {active
              ? formatDate(order?.updatedAt || order?.createdAt)
              : "Pending"}
          </Text>
        </View>
      </View>
    );
  };

  const renderOrder = ({ item }) => {
    const status = normalizeStatus(item?.status);
    const statusMeta = STATUS_STYLES[status] || STATUS_STYLES.pending;

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.94}>
        <View style={styles.cardTop}>
          <Text style={styles.orderName} numberOfLines={1}>
            {item?.productId?.name || "Order"}
          </Text>
          <Text
            style={[
              styles.statusPill,
              {
                backgroundColor: `${statusMeta.color}22`,
                color: statusMeta.color,
              },
            ]}
          >
            {status}
          </Text>
        </View>

        <Text style={styles.orderPrice}>
          Rs{" "}
          {Number(item?.totalPrice || item?.totalAmount || 0).toLocaleString()}
        </Text>

        <View style={styles.timelineWrap}>
          {status === "rejected" ? (
            <View style={styles.stageRow}>
              <View style={styles.stageDotRejected}>
                <Ionicons name="close" size={12} color={colors.white} />
              </View>
              <View style={styles.stageContent}>
                <Text style={[styles.stageLabel, { color: colors.error }]}>
                  Rejected
                </Text>
                <Text style={styles.stageTime}>
                  {formatDate(item?.updatedAt || item?.createdAt)}
                </Text>
              </View>
            </View>
          ) : (
            STAGES.map((stage, idx) => renderStage(item, stage, idx))
          )}
        </View>

        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => {
            if (item?.productId)
              navigation.navigate("ProductScreen", { product: item.productId });
          }}
        >
          <Text style={styles.detailsBtnText}>View product</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const filters = [
    "all",
    "pending",
    "accepted",
    "shipped",
    "delivered",
    "rejected",
  ];

  return (
    <ScreenSurface style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filters}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingTop: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedFilter(item)}
                style={[
                  styles.filterChip,
                  selectedFilter === item && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === item && styles.filterChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyArt}>:-)</Text>
            <Text style={styles.emptyTitle}>No orders found</Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.shopBtnText}>Start shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrder}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchOrders(true)}
                tintColor={colors.primary}
              />
            }
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 84 + insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: colors.textPrimary },
  filterChip: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.lightBackground,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  filterChipTextActive: { color: colors.primary },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 12,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
    marginRight: 8,
  },
  statusPill: {
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  orderPrice: { marginTop: 7, color: colors.primary, fontWeight: "800" },
  timelineWrap: { marginTop: 10, paddingTop: 4 },
  stageRow: { flexDirection: "row", minHeight: 38 },
  stageLeft: { width: 22, alignItems: "center" },
  stageDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  stageDotRejected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stageLine: { width: 2, flex: 1, backgroundColor: "#E3E8EF", marginTop: 2 },
  stageContent: { flex: 1, paddingLeft: 8, paddingBottom: 6 },
  stageLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "capitalize",
  },
  stageTime: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  detailsBtn: {
    marginTop: 6,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsBtnText: { color: colors.primary, fontWeight: "700" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyArt: { fontSize: 42 },
  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  shopBtn: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  shopBtnText: { color: colors.white, fontWeight: "800" },
});

export default OrderTrackingScreen;
