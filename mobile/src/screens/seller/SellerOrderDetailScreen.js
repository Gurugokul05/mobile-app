import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ScreenSurface from "../../components/ScreenSurface";
import api, { getApiDebugInfo } from "../../api/config";
import { colors } from "../../theme/colors";
import { useAppAlert } from "../../context/AlertContext";

const getImageMediaType = () => {
  if (ImagePicker.MediaType?.Images) {
    return [ImagePicker.MediaType.Images];
  }
  return ["images"];
};

const uploadPackingProofWithMultipart = async ({ orderId, formData }) => {
  const token = await AsyncStorage.getItem("userToken");
  const debugInfo = getApiDebugInfo();
  const candidateBaseUrls = Array.isArray(debugInfo?.candidateBaseUrls)
    ? debugInfo.candidateBaseUrls
    : [];
  const activeBaseUrl = String(debugInfo?.activeBaseUrl || "").trim();

  const baseUrls = [activeBaseUrl, ...candidateBaseUrls].filter(
    (url, index, arr) => url && arr.indexOf(url) === index,
  );

  let lastError = null;

  for (const baseUrl of baseUrls) {
    try {
      const endpoint = `${baseUrl}/orders/${orderId}/packing-proof`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const responseText = await response.text();
      let responseJson = null;

      try {
        responseJson = responseText ? JSON.parse(responseText) : null;
      } catch (_parseError) {
        responseJson = null;
      }

      if (!response.ok) {
        const errorMessage =
          responseJson?.message ||
          responseText ||
          `Packing proof upload failed (status ${response.status})`;
        throw new Error(errorMessage);
      }

      return responseJson;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Packing proof upload failed");
};

const normalizeOrderStatus = (status) => {
  if (status === "Ordered") return "Pending";
  if (status === "Cancelled") return "Rejected";
  return status || "Pending";
};

const SellerOrderDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAppAlert();
  const orderId = route?.params?.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [courierName, setCourierName] = useState("");
  const [selectedProofName, setSelectedProofName] = useState("");

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data || null);
      setTrackingId(data?.trackingId || "");
      setCourierName(data?.courierName || "");
    } catch (error) {
      showAlert({
        title: "Error",
        message:
          error?.response?.data?.message || "Failed to load order details",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [orderId, showAlert]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const runOrderAction = async (action, payload = {}) => {
    if (!order?._id) return;

    try {
      setActionLoading(action);
      await api.put(`/orders/${order._id}/${action}`, payload);
      await fetchOrder();
      showAlert({
        title: "Success",
        message: "Order updated successfully",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Action Failed",
        message: error?.response?.data?.message || "Unable to update order",
        type: "error",
      });
    } finally {
      setActionLoading("");
    }
  };

  const uploadPackingProof = async () => {
    if (!order?._id) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert({
        title: "Permission Required",
        message: "Allow media access to upload packing proof",
        type: "warning",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: getImageMediaType(),
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    const proofName =
      asset.fileName ||
      `packing_proof_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
    setSelectedProofName(proofName);

    const formData = new FormData();
    formData.append("packingProof", {
      uri: asset.uri,
      name: proofName,
      type: asset.mimeType || "image/jpeg",
    });

    try {
      setActionLoading("packing-proof");
      await uploadPackingProofWithMultipart({
        orderId: order._id,
        formData,
      });
      await fetchOrder();
      showAlert({
        title: "Success",
        message: "Packing proof uploaded",
        type: "success",
      });
    } catch (error) {
      const errorMessage = String(error?.message || "");
      const isNetworkError =
        !errorMessage ||
        /network|failed to fetch|timeout|load failed/i.test(errorMessage);

      showAlert({
        title: "Upload Failed",
        message: isNetworkError
          ? "Network error while uploading. Check backend reachability and EXPO_PUBLIC_API_URL, then retry."
          : errorMessage || "Failed to upload packing proof",
        type: "error",
      });
    } finally {
      setActionLoading("");
    }
  };

  const handleShip = async () => {
    if (trackingId.trim().length < 8) {
      showAlert({
        title: "Validation",
        message: "Tracking ID must be at least 8 characters",
        type: "warning",
      });
      return;
    }

    if (!courierName.trim()) {
      showAlert({
        title: "Validation",
        message: "Courier name is required",
        type: "warning",
      });
      return;
    }

    await runOrderAction("ship", {
      trackingId: trackingId.trim(),
      courierName: courierName.trim(),
    });
  };

  const status = normalizeOrderStatus(order?.status);
  const shippingAddress = order?.shippingAddress || {};

  if (loading) {
    return (
      <ScreenSurface style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenSurface>
    );
  }

  if (!order) {
    return (
      <ScreenSurface style={styles.container}>
        <View style={styles.loadingWrap}>
          <Text style={styles.meta}>Order not found</Text>
        </View>
      </ScreenSurface>
    );
  }

  return (
    <ScreenSurface style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24 + insets.bottom,
        }}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.orderId}>
            Order #{String(order._id || "").slice(-6)}
          </Text>
          <Text style={styles.productName}>
            {order.productId?.name || "Product"}
          </Text>
          <Text style={styles.meta}>Quantity: {order.quantity || 1}</Text>
          <Text style={styles.meta}>Buyer: {order.buyerId?.name || "N/A"}</Text>
          <Text style={styles.meta}>
            Address:{" "}
            {[
              shippingAddress.street,
              shippingAddress.city,
              shippingAddress.state,
              shippingAddress.pincode,
            ]
              .filter(Boolean)
              .join(", ") || "N/A"}
          </Text>
          <Text style={styles.statusText}>Status: {status}</Text>
        </View>

        {status === "Pending" ? (
          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Seller Decision</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => runOrderAction("accept")}
                disabled={Boolean(actionLoading)}
              >
                {actionLoading === "accept" ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.actionText}>Accept</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => runOrderAction("reject")}
                disabled={Boolean(actionLoading)}
              >
                {actionLoading === "reject" ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.actionText}>Reject</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {status === "Accepted" ? (
          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Packing Proof</Text>
            <Text style={styles.helpText}>
              Upload a clear image of your packed parcel before shipping.
            </Text>

            {selectedProofName ? (
              <View style={styles.fileInfoWrap}>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color="#1D4ED8"
                />
                <Text style={styles.fileInfoText} numberOfLines={1}>
                  {selectedProofName}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={uploadPackingProof}
              disabled={Boolean(actionLoading)}
            >
              {actionLoading === "packing-proof" ? (
                <View style={styles.loadingInline}>
                  <ActivityIndicator size="small" color={colors.white} />
                  <Text style={styles.actionText}>Uploading...</Text>
                </View>
              ) : (
                <Text style={styles.actionText}>Upload Packing Proof</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {status === "Packed" ? (
          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Shipping Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Tracking ID"
              value={trackingId}
              onChangeText={setTrackingId}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="Courier Name"
              value={courierName}
              onChangeText={setCourierName}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleShip}
              disabled={Boolean(actionLoading)}
            >
              {actionLoading === "ship" ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.actionText}>Mark as Shipped</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {status === "Shipped" ? (
          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Tracking Info</Text>
            <Text style={styles.meta}>
              Tracking ID: {order.trackingId || "N/A"}
            </Text>
            <Text style={styles.meta}>
              Courier: {order.courierName || "N/A"}
            </Text>
            <Text style={styles.meta}>
              Tracking URL: {order.trackingUrl || "N/A"}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => runOrderAction("deliver")}
              disabled={Boolean(actionLoading)}
            >
              {actionLoading === "deliver" ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.actionText}>Mark as Delivered</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {status === "Delivered" ? (
          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Completed</Text>
            <Text style={styles.meta}>This order is fully delivered.</Text>
          </View>
        ) : null}

        {status === "Rejected" ? (
          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Rejected</Text>
            <Text style={styles.meta}>
              You rejected this order at pending stage.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  orderId: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: 8,
  },
  statusText: {
    marginTop: 8,
    fontWeight: "700",
    color: colors.primary,
  },
  meta: {
    color: colors.textSecondary,
    marginBottom: 4,
    fontSize: 13,
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: 10,
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: colors.textPrimary,
    backgroundColor: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: colors.white,
    fontWeight: "700",
  },
  loadingInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  helpText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 10,
  },
  fileInfoWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
  },
  fileInfoText: {
    flex: 1,
    color: "#1E3A8A",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default SellerOrderDetailScreen;
