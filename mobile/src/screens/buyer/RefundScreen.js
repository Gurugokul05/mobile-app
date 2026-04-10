import React, { useState, useEffect } from "react";
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
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/config";
import { useAppAlert } from "../../context/AlertContext";
import CustomButton from "../../components/Button";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

const RefundScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showAlert } = useAppAlert();
  const { userToken } = useAuth();
  const insets = useSafeAreaInsets();

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
      // Filter only delivered orders eligible for refund
      const eligibleOrders =
        data?.filter((order) => order.status === "Delivered") || [];
      setOrders(eligibleOrders);
    } catch (error) {
      if (error?.response?.status === 401) {
        setOrders([]);
        return;
      }
      showAlert({
        title: "Error",
        message: "Failed to load orders",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefundRequest = async () => {
    if (!reason.trim()) {
      showAlert({
        title: "Validation Error",
        message: "Please provide a refund reason",
        type: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      // In a real app, you would upload video proof here
      // For now, we'll just submit the refund request
      await api.post("/refunds", {
        orderId: selectedOrder._id,
        reason: reason,
      });

      showAlert({
        title: "Success",
        message:
          "Refund request submitted! Please upload unboxing video proof.",
        type: "success",
      });

      setModalVisible(false);
      setReason("");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      showAlert({
        title: "Error",
        message: error.response?.data?.message || "Failed to submit refund",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle} numberOfLines={1}>
          {item.productId?.name || "Product"}
        </Text>
        <View style={styles.statusBadge}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={colors.success}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.detailText}>
          Quantity: <Text style={styles.detailValue}>{item.quantity}</Text>
        </Text>
        <Text style={styles.detailText}>
          Amount: <Text style={styles.detailValue}>₹{item.totalPrice}</Text>
        </Text>
        <Text style={styles.detailText}>
          From:{" "}
          <Text style={styles.detailValue}>
            {item.sellerId?.name || "Seller"}
          </Text>
        </Text>
      </View>

      <TouchableOpacity
        style={styles.refundButton}
        onPress={() => {
          setSelectedOrder(item);
          setModalVisible(true);
        }}
      >
        <Ionicons name="arrow-redo" size={16} color={colors.primary} />
        <Text style={styles.refundButtonText}>Request Refund</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenSurface style={styles.container}>
      <ScreenHeader title="Request Refund" navigation={navigation} />
      <View style={styles.headerCopy}>
        <Text style={styles.headerSubtitle}>
          You can request refunds for delivered items within 7 days
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 32 + insets.bottom },
          ]}
        >
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                No eligible orders for refund yet
              </Text>
              <Text style={styles.emptySubtext}>
                Only delivered orders can be refunded
              </Text>
            </View>
          ) : (
            <FlatList
              data={orders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          )}

          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.primary}
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Refund Policy</Text>
              <Text style={styles.infoText}>
                • Unboxing video proof is mandatory{"\n"}• Refunds processed
                within 7 days{"\n"}• Items must be in original condition
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Refund Request Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Refund</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setReason("");
                }}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedOrder && (
                <View style={styles.selectedOrderInfo}>
                  <Text style={styles.selectedOrderTitle}>
                    {selectedOrder.productId?.name}
                  </Text>
                  <Text style={styles.selectedOrderPrice}>
                    ₹{selectedOrder.totalPrice}
                  </Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Reason for Refund*</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Please provide the reason for your refund request..."
                  placeholderTextColor={colors.textSecondary}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.uploadNote}>
                <Ionicons
                  name="videocam-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.uploadNoteText}>
                  You will need to upload an unboxing video as proof for your
                  refund request
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    setReason("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <CustomButton
                  title={submitting ? "Submitting..." : "Submit Request"}
                  onPress={handleRefundRequest}
                  style={{ flex: 1, marginLeft: 12 }}
                  disabled={submitting}
                />
              </View>
            </ScrollView>
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
  headerCopy: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.success,
  },
  orderDetails: {
    marginVertical: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: "600",
    color: colors.textPrimary,
  },
  refundButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  refundButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(232, 121, 249, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  selectedOrderInfo: {
    backgroundColor: "rgba(232, 121, 249, 0.1)",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  selectedOrderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  selectedOrderPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  formGroup: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 100,
  },
  uploadNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  uploadNoteText: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});

export default RefundScreen;
