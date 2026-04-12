import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import api, { getApiDebugInfo } from "../../api/config";
import { colors } from "../../theme/colors";
import { useAppAlert } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";

const getVideoMediaType = () => {
  if (ImagePicker.MediaType?.Videos) {
    return [ImagePicker.MediaType.Videos];
  }
  return ["videos"];
};

const uploadRefundWithMultipart = async ({ formData }) => {
  const token = await AsyncStorage.getItem("userToken");
  const debugInfo = getApiDebugInfo();
  const candidateBaseUrls = Array.isArray(debugInfo?.candidateBaseUrls)
    ? debugInfo.candidateBaseUrls
    : [];
  const activeBaseUrl = String(debugInfo?.activeBaseUrl || "").trim();
  const baseUrls = [activeBaseUrl, ...candidateBaseUrls].filter(
    (url, index, arr) => Boolean(url) && arr.indexOf(url) === index,
  );

  let lastError = null;

  for (const baseUrl of baseUrls) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const endpoint = `${baseUrl}/refunds`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseJson = null;

      try {
        responseJson = responseText ? JSON.parse(responseText) : null;
      } catch (_parseError) {
        responseJson = null;
      }

      if (!response.ok) {
        throw new Error(
          responseJson?.message ||
            responseText ||
            `Refund request failed (status ${response.status})`,
        );
      }

      return responseJson;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
    }
  }

  throw lastError || new Error("Refund request failed");
};

const RefundScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { userToken } = useAuth();
  const { showAlert } = useAppAlert();

  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRefundData = async () => {
    if (!userToken) {
      setOrders([]);
      setRefunds([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [ordersRes, refundsRes] = await Promise.all([
        api.get("/orders/my-orders"),
        api.get("/refunds/my"),
      ]);

      const refundItems = Array.isArray(refundsRes.data) ? refundsRes.data : [];
      const refundedOrderIds = new Set(
        refundItems
          .map((refund) => String(refund?.order?._id || refund?.orderId || "").trim())
          .filter(Boolean),
      );

      const deliveredOrders = (ordersRes.data || []).filter(
        (order) =>
          order.status === "Delivered" &&
          !refundedOrderIds.has(String(order?._id || "").trim()),
      );

      setOrders(deliveredOrders);
      setRefunds(refundItems);
    } catch (error) {
      if (error?.response?.status === 401) {
        setOrders([]);
        setRefunds([]);
      } else {
        showAlert({
          title: "Error",
          message: error?.response?.data?.message || "Failed to load refunds",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundData();
  }, [userToken]);

  const pickUnboxingVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert({
        title: "Permission Required",
        message: "Allow gallery access to attach unboxing video",
        type: "warning",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: getVideoMediaType(),
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    setSelectedVideo({
      uri: asset.uri,
      fileName: asset.fileName || `unboxing_${Date.now()}.mp4`,
      mimeType: asset.mimeType || "video/mp4",
    });
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
    setReason("");
    setSelectedVideo(null);
  };

  const submitRefundRequest = async () => {
    if (!selectedOrder?._id) {
      return;
    }

    if (!reason.trim()) {
      showAlert({
        title: "Validation",
        message: "Please provide refund reason",
        type: "warning",
      });
      return;
    }

    if (!selectedVideo?.uri) {
      showAlert({
        title: "Validation",
        message: "Unboxing video is mandatory",
        type: "warning",
      });
      return;
    }

    const formData = new FormData();
    formData.append("orderId", selectedOrder._id);
    formData.append("reason", reason.trim());
    formData.append("unboxingVideo", {
      uri: selectedVideo.uri,
      name: selectedVideo.fileName,
      type: selectedVideo.mimeType,
    });

    try {
      setSubmitting(true);
      await uploadRefundWithMultipart({ formData });
      showAlert({
        title: "Success",
        message: "Refund dispute submitted successfully",
        type: "success",
      });
      closeModal();
      await fetchRefundData();
    } catch (error) {
      const message = String(error?.message || "");
      const networkError = /network|fetch|timeout|load failed/i.test(message);
      const timedOut = error?.name === "AbortError";
      showAlert({
        title: "Upload Failed",
        message: networkError || timedOut
          ? "Network error while uploading video. Check backend reachability and retry."
          : message || "Failed to submit refund",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.productId?.name || "Product"}</Text>
      <Text style={styles.cardMeta}>Order #{String(item._id || "").slice(-6)}</Text>
      <Text style={styles.cardMeta}>Amount: ₹{item.totalPrice || 0}</Text>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => {
          setSelectedOrder(item);
          setModalVisible(true);
        }}
      >
        <Text style={styles.actionBtnText}>Raise Dispute</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRefundStatus = ({ item }) => (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusOrderCode}>
          Order #{String(item.order?._id || item.orderId?._id || "").slice(-6)}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "Approved"
                  ? colors.success
                  : item.status === "Rejected"
                    ? colors.error
                    : colors.warning,
            },
          ]}
        >
          <Text style={styles.statusBadgeText}>{item.status || "Pending"}</Text>
        </View>
      </View>
      <Text style={styles.cardMeta}>Reason: {item.reason || "N/A"}</Text>
      <Text style={styles.cardMeta}>
        Product: {item.order?.product?.name || item.orderId?.productId?.name || "N/A"}
      </Text>
    </View>
  );

  return (
    <ScreenSurface style={styles.container}>
      <ScreenHeader title="Refund Disputes" navigation={navigation} />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 32 + insets.bottom,
          }}
        >
          <Text style={styles.sectionTitle}>Delivered Orders</Text>
          {orders.length === 0 ? (
            <Text style={styles.emptyText}>No delivered orders available for disputes</Text>
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item) => item._id}
              renderItem={renderOrderItem}
              scrollEnabled={false}
            />
          )}

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>My Refund Status</Text>
          {refunds.length === 0 ? (
            <Text style={styles.emptyText}>No refund disputes submitted yet</Text>
          ) : (
            <FlatList
              data={refunds}
              keyExtractor={(item) => item._id}
              renderItem={renderRefundStatus}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Refund Dispute</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.cardMeta}>
              Product: {selectedOrder?.productId?.name || "N/A"}
            </Text>

            <TextInput
              style={styles.reasonInput}
              placeholder="Explain the issue"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.pickBtn} onPress={pickUnboxingVideo}>
              <Ionicons name="videocam-outline" size={18} color={colors.primary} />
              <Text style={styles.pickBtnText}>
                {selectedVideo?.fileName || "Attach Unboxing Video"}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  submitting ? styles.submitBtnDisabled : null,
                ]}
                onPress={submitRefundRequest}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  emptyText: {
    color: colors.textSecondary,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  actionBtn: {
    marginTop: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  actionBtnText: {
    color: "#1D4ED8",
    fontWeight: "700",
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statusOrderCode: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
    color: colors.textPrimary,
    backgroundColor: "#FFFFFF",
    marginTop: 6,
  },
  pickBtn: {
    marginTop: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pickBtnText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 12,
    flex: 1,
  },
  modalActions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  submitBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: colors.white,
    fontWeight: "700",
  },
});

export default RefundScreen;
