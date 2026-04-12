import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenSurface from "../../components/ScreenSurface";
import { colors } from "../../theme/colors";
import { useAppAlert } from "../../context/AlertContext";
import api from "../../api/config";

const formatAmount = (value) => Number(value || 0).toFixed(2);

const buildUpiDeepLink = ({ upiId, sellerName, amount, orderReference }) => {
  const params = [
    `pa=${encodeURIComponent(String(upiId || "").trim())}`,
    `pn=${encodeURIComponent(String(sellerName || "Seller").trim())}`,
    `am=${encodeURIComponent(formatAmount(amount))}`,
    "cu=INR",
    `tn=${encodeURIComponent(String(orderReference || "").trim())}`,
  ];

  return `upi://pay?${params.join("&")}`;
};

const uploadProofMultipart = async ({
  orderId,
  screenshot,
  claimedTransactionId,
}) => {
  const token = await AsyncStorage.getItem("userToken");
  const endpoint = `${api.defaults.baseURL}/orders/${orderId}/submit-upi-proof`;

  const formData = new FormData();
  formData.append("paymentProof", {
    uri: screenshot.uri,
    name: screenshot.name,
    type: screenshot.type,
  });

  formData.append("claimedTransactionId", claimedTransactionId);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const responseText = await response.text();
  let responseJson = null;

  try {
    responseJson = responseText ? JSON.parse(responseText) : null;
  } catch (_error) {
    responseJson = null;
  }

  if (!response.ok) {
    throw new Error(
      responseJson?.message ||
        responseText ||
        `Payment proof upload failed (status ${response.status})`,
    );
  }

  return responseJson;
};

const UpiPaymentScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAppAlert();

  const orderId = route.params?.orderId;
  const orderReference = route.params?.orderReference;
  const sellerName = route.params?.sellerName;
  const sellerUpiId = route.params?.sellerUpiId;
  const amount = route.params?.amount;
  const expiresAt = route.params?.expiresAt;

  const [paying, setPaying] = useState(false);
  const [returnedFromUpi, setReturnedFromUpi] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [claimedTxnId, setClaimedTxnId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const expiryLabel = useMemo(() => {
    if (!expiresAt) return "";
    try {
      return new Date(expiresAt).toLocaleString();
    } catch (_error) {
      return "";
    }
  }, [expiresAt]);

  const upiDeepLink = useMemo(
    () =>
      buildUpiDeepLink({
        upiId: sellerUpiId,
        sellerName,
        amount,
        orderReference,
      }),
    [sellerUpiId, sellerName, amount, orderReference],
  );

  const handleOpenUpi = async () => {
    try {
      setPaying(true);
      const canOpen = await Linking.canOpenURL(upiDeepLink);
      if (!canOpen) {
        throw new Error("No UPI app found on this device");
      }
      await Linking.openURL(upiDeepLink);
      setReturnedFromUpi(true);
    } catch (error) {
      showAlert({
        title: "UPI Launch Failed",
        message: error?.message || "Unable to open UPI app",
        type: "error",
      });
    } finally {
      setPaying(false);
    }
  };

  const pickScreenshot = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert({
        title: "Permission Required",
        message: "Allow media access to upload payment screenshot",
        type: "warning",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    setProofImage({
      uri: asset.uri,
      name:
        asset.fileName ||
        `upi_payment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`,
      type: asset.mimeType || "image/jpeg",
    });
  };

  const handleSubmitPaymentProof = async () => {
    if (!proofImage) {
      showAlert({
        title: "Screenshot Required",
        message: "Upload your payment confirmation screenshot",
        type: "warning",
      });
      return;
    }

    if (!claimedTxnId.trim()) {
      showAlert({
        title: "Transaction ID Required",
        message: "Enter the UPI transaction ID before submitting payment proof",
        type: "warning",
      });
      return;
    }

    try {
      setSubmitting(true);
      await uploadProofMultipart({
        orderId,
        screenshot: proofImage,
        claimedTransactionId: claimedTxnId.trim(),
      });

      showAlert({
        title: "Submitted",
        message: "Payment submitted for manual verification",
        type: "success",
        onConfirm: () => navigation.navigate("OrderTracking"),
      });
    } catch (error) {
      showAlert({
        title: "Submission Failed",
        message: error?.message || "Unable to submit payment proof",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenSurface style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <Text style={styles.title}>UPI Payment</Text>
        <Text style={styles.subtitle}>
          Review details before opening your UPI app
        </Text>

        <View style={styles.card}>
          <DetailRow label="Seller Name" value={sellerName || "Seller"} />
          <DetailRow label="UPI ID" value={sellerUpiId || "N/A"} />
          <DetailRow label="Exact Amount" value={`₹${formatAmount(amount)}`} />
          <DetailRow
            label="Order ID"
            value={orderReference || orderId || "N/A"}
          />
          {expiryLabel ? (
            <DetailRow label="Expires At" value={expiryLabel} />
          ) : null}
        </View>

        <View style={styles.warningWrap}>
          <Ionicons name="warning-outline" size={18} color="#92400E" />
          <Text style={styles.warningText}>
            You must complete the payment in your UPI app. We will verify
            manually.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleOpenUpi}
          disabled={paying}
        >
          {paying ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryBtnText}>Pay Now</Text>
          )}
        </TouchableOpacity>

        {returnedFromUpi ? (
          <View style={styles.proofWrap}>
            <Text style={styles.proofTitle}>I Have Paid</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickScreenshot}>
              <Ionicons name="image-outline" size={18} color={colors.primary} />
              <Text style={styles.uploadBtnText}>
                {proofImage ? "Change Screenshot" : "Upload Payment Screenshot"}
              </Text>
            </TouchableOpacity>

            {proofImage ? (
              <Text style={styles.fileText} numberOfLines={1}>
                {proofImage.name}
              </Text>
            ) : null}

            <TextInput
              style={styles.input}
              value={claimedTxnId}
              onChangeText={setClaimedTxnId}
              placeholder="UPI Transaction ID"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitPaymentProof}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Submit Payment Proof</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ScreenSurface>
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 6,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 10,
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "700",
  },
  warningWrap: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 10,
  },
  warningText: {
    flex: 1,
    color: "#92400E",
    fontSize: 13,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  proofWrap: {
    marginTop: 10,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 10,
  },
  proofTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  uploadBtnText: {
    color: colors.primary,
    fontWeight: "700",
  },
  fileText: {
    fontSize: 12,
    color: "#6B7280",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
});

export default UpiPaymentScreen;
