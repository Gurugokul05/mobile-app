import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ScreenSurface from "../../components/ScreenSurface";
import api, { getApiDebugInfo } from "../../api/config";
import { colors } from "../../theme/colors";
import { useAppAlert } from "../../context/AlertContext";

const statusColor = {
  Pending: colors.warning,
  Approved: colors.success,
  Rejected: colors.error,
};

const normalizeEvidenceUrl = (url) => {
  const raw = String(url || "").trim();
  if (!raw) return "";

  const debugInfo = getApiDebugInfo();
  const activeBaseUrl = String(debugInfo?.activeBaseUrl || "").trim();

  if (raw.startsWith("/")) {
    if (!activeBaseUrl) return raw;

    try {
      const apiUrl = new URL(activeBaseUrl);
      return `${apiUrl.protocol}//${apiUrl.host}${raw}`;
    } catch (_error) {
      return raw;
    }
  }

  let parsed;
  try {
    parsed = new URL(raw);
  } catch (_error) {
    return raw;
  }

  const isLocalOnlyHost = ["localhost", "127.0.0.1", "10.0.2.2"].includes(
    parsed.hostname,
  );

  if (!isLocalOnlyHost) {
    return raw;
  }

  if (!activeBaseUrl) return raw;

  try {
    const apiUrl = new URL(activeBaseUrl);
    parsed.protocol = apiUrl.protocol;
    parsed.hostname = apiUrl.hostname;
    parsed.port = apiUrl.port;
    return parsed.toString();
  } catch (_error) {
    return raw;
  }
};

const inferEvidenceType = (url, fallback = "video") => {
  const raw = String(url || "").toLowerCase();
  if (!raw) return fallback;

  if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/.test(raw)) {
    return "image";
  }

  if (/\.(mp4|mov|m4v|webm|m3u8)(\?|$)/.test(raw)) {
    return "video";
  }

  return fallback;
};

const SellerRefundRequestsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAppAlert();

  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState("");

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/refunds/seller");
      setRefunds(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert({
        title: "Error",
        message:
          error?.response?.data?.message ||
          "Failed to load seller refund requests",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const openEvidence = async (url, title = "Evidence", fallbackType = "video") => {
    if (!url) return;

    const resolvedUrl = normalizeEvidenceUrl(url);
    if (!resolvedUrl) {
      showAlert({
        title: "Invalid Evidence URL",
        message: "Evidence file URL is missing or invalid.",
        type: "warning",
      });
      return;
    }

    navigation.navigate("SellerEvidencePlayer", {
      url: resolvedUrl,
      title,
      mediaType: inferEvidenceType(resolvedUrl, fallbackType),
    });
  };

  const submitSellerResponse = async () => {
    if (!selectedRefund?._id) return;
    if (!responseText.trim()) {
      showAlert({
        title: "Validation",
        message: "Add a response before submitting",
        type: "warning",
      });
      return;
    }

    try {
      setResponding(true);
      await api.put(`/refunds/${selectedRefund._id}/respond`, {
        sellerResponse: responseText.trim(),
      });
      showAlert({
        title: "Submitted",
        message: "Seller response submitted successfully",
        type: "success",
      });
      setSelectedRefund(null);
      setResponseText("");
      await fetchRefunds();
    } catch (error) {
      showAlert({
        title: "Failed",
        message: error?.response?.data?.message || "Failed to submit response",
        type: "error",
      });
    } finally {
      setResponding(false);
    }
  };

  const submitSellerDecision = async (status) => {
    if (!selectedRefund?._id) return;

    try {
      setDecisionLoading(status);
      await api.put(`/refunds/${selectedRefund._id}/seller-decision`, {
        status,
        sellerResponse: responseText.trim(),
      });
      showAlert({
        title: "Updated",
        message: `Refund marked as ${status} by seller`,
        type: "success",
      });
      setSelectedRefund(null);
      setResponseText("");
      await fetchRefunds();
    } catch (error) {
      showAlert({
        title: "Failed",
        message: error?.response?.data?.message || "Failed to submit decision",
        type: "error",
      });
    } finally {
      setDecisionLoading("");
    }
  };

  const renderRefundCard = ({ item }) => {
    const order = item.order || {};
    const product = order.product || {};

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedRefund(item);
          setResponseText(item.sellerResponse || "");
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderCode}>
            Order #{String(order?._id || "").slice(-6)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusColor[item.status] || colors.textSecondary,
              },
            ]}
          >
            <Text style={styles.statusText}>{item.status || "Pending"}</Text>
          </View>
        </View>
        <Text style={styles.productName}>{product?.name || "Product"}</Text>
        <Text style={styles.meta}>Buyer reason: {item.reason || "N/A"}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenSurface style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenSurface>
    );
  }

  return (
    <ScreenSurface style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 8 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Refund Requests</Text>
          <TouchableOpacity onPress={fetchRefunds}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={refunds}
          keyExtractor={(item) => item._id}
          contentContainerStyle={
            refunds.length === 0 ? styles.emptyListWrap : styles.listWrap
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No refund disputes assigned</Text>
          }
          renderItem={renderRefundCard}
        />
      </View>

      <Modal
        visible={Boolean(selectedRefund)}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refund Evidence</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedRefund(null);
                  setResponseText("");
                }}
              >
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedRefund ? (
              <View>
                <Text style={styles.modalMeta}>
                  Reason: {selectedRefund.reason || "N/A"}
                </Text>
                <Text style={styles.modalMeta}>
                  Status: {selectedRefund.status || "Pending"}
                </Text>

                <View style={styles.evidenceRow}>
                  <TouchableOpacity
                    style={styles.evidenceButton}
                    onPress={() =>
                      openEvidence(
                        selectedRefund.unboxingVideoUrl,
                        "Buyer Unboxing Video",
                        "video",
                      )
                    }
                  >
                    <Text style={styles.evidenceText}>
                      Open Buyer Unboxing Video
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.evidenceButton}
                    onPress={() =>
                      openEvidence(
                        selectedRefund.order?.packingProofUrl,
                        "Packing Proof",
                        "image",
                      )
                    }
                  >
                    <Text style={styles.evidenceText}>Open Packing Proof</Text>
                  </TouchableOpacity>
                </View>

                {selectedRefund.status === "Pending" ? (
                  <>
                    <Text style={styles.modalMeta}>
                      Seller decision:{" "}
                      {selectedRefund.sellerDecision?.status || "Not decided"}
                    </Text>
                    <TextInput
                      style={styles.responseInput}
                      placeholder="Add response for admin review"
                      value={responseText}
                      onChangeText={setResponseText}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                    <TouchableOpacity
                      style={styles.submitButton}
                      disabled={responding}
                      onPress={submitSellerResponse}
                    >
                      {responding ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <Text style={styles.submitText}>Submit Response</Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.decisionRow}>
                      <TouchableOpacity
                        style={styles.acceptDecisionBtn}
                        disabled={Boolean(decisionLoading)}
                        onPress={() => submitSellerDecision("Accepted")}
                      >
                        {decisionLoading === "Accepted" ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.white}
                          />
                        ) : (
                          <Text style={styles.decisionText}>Accept Refund</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.rejectDecisionBtn}
                        disabled={Boolean(decisionLoading)}
                        onPress={() => submitSellerDecision("Rejected")}
                      >
                        {decisionLoading === "Rejected" ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.white}
                          />
                        ) : (
                          <Text style={styles.decisionText}>Reject Refund</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={styles.readOnlyWrap}>
                    <Text style={styles.readOnlyTitle}>Seller Response</Text>
                    <Text style={styles.readOnlyText}>
                      {selectedRefund.sellerResponse ||
                        "No seller response submitted"}
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listWrap: {
    paddingBottom: 24,
  },
  emptyListWrap: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderCode: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 11,
  },
  productName: {
    marginTop: 8,
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  meta: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
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
  modalMeta: {
    color: colors.textSecondary,
    marginBottom: 6,
  },
  evidenceRow: {
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  evidenceButton: {
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  evidenceText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 12,
  },
  responseInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
    color: colors.textPrimary,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  submitText: {
    color: colors.white,
    fontWeight: "700",
  },
  decisionRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  acceptDecisionBtn: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  rejectDecisionBtn: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  decisionText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
  },
  readOnlyWrap: {
    marginTop: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
  },
  readOnlyTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: 4,
  },
  readOnlyText: {
    color: colors.textSecondary,
  },
});

export default SellerRefundRequestsScreen;
