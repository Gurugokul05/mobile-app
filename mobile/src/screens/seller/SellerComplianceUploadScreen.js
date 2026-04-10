import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import Button from "../../components/Button";
import { colors } from "../../theme/colors";
import api, { getApiDebugInfo } from "../../api/config";
import { useAppAlert } from "../../context/AlertContext";

const SellerComplianceUploadScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAppAlert();
  const targetDocType =
    route?.params?.docType === "businessLicense"
      ? "businessLicense"
      : route?.params?.docType === "gstCertificate"
        ? "gstCertificate"
        : "all";
  const isSingleDocMode = targetDocType !== "all";
  const targetTitle =
    targetDocType === "gstCertificate"
      ? "GST Certificate"
      : targetDocType === "businessLicense"
        ? "Business License"
        : "GST & Business License";
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [complianceDocs, setComplianceDocs] = useState(null);
  const [files, setFiles] = useState({
    gstCertificate: null,
    businessLicense: null,
  });

  const mapDocState = (rawDoc) => {
    const rawStatus = String(rawDoc?.status || "not_verified")
      .trim()
      .toLowerCase();
    const hasUrl = Boolean(String(rawDoc?.url || "").trim());
    const normalizedStatus =
      rawStatus === "verified"
        ? "verified"
        : rawStatus === "rejected"
          ? "rejected"
          : rawStatus === "uploaded" || (hasUrl && rawStatus === "not_verified")
            ? "uploaded"
            : "not_verified";

    return {
      normalizedStatus,
      label:
        normalizedStatus === "verified"
          ? "Verified"
          : normalizedStatus === "uploaded"
            ? "Under Review"
            : normalizedStatus === "rejected"
              ? "Rejected"
              : "Not Verified",
      canUpload:
        normalizedStatus === "not_verified" || normalizedStatus === "rejected",
      uploaded: hasUrl,
      rejectionReason: rawDoc?.rejectionReason || "",
    };
  };

  useEffect(() => {
    let active = true;

    const loadComplianceDocs = async () => {
      try {
        setInitialLoading(true);
        const { data } = await api.get("/seller/me/compliance");
        if (active) {
          setComplianceDocs(data?.complianceDocs || null);
        }
      } catch {
        if (active) {
          setComplianceDocs(null);
        }
      } finally {
        if (active) {
          setInitialLoading(false);
        }
      }
    };

    loadComplianceDocs();

    return () => {
      active = false;
    };
  }, [targetDocType]);

  const pickImage = async (fieldName) => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert({
          title: "Permission Required",
          message:
            "Please allow gallery access to upload your compliance documents.",
          type: "warning",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType?.Images
          ? [ImagePicker.MediaType.Images]
          : "images",
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];
        setFiles((prev) => ({
          ...prev,
          [fieldName]: {
            uri: file.uri,
            type: file.mimeType || "image/jpeg",
            name:
              file.fileName || `${fieldName}_${Date.now().toString(10)}.jpg`,
          },
        }));
      }
    } catch (error) {
      showAlert({
        title: "Picker Error",
        message: error?.message || "Unable to pick the file right now.",
        type: "error",
      });
    }
  };

  const gstDocState = mapDocState(complianceDocs?.gstCertificate);
  const businessDocState = mapDocState(complianceDocs?.businessLicense);

  const renderStatusCard = ({ title, state, icon }) => (
    <View style={styles.statusCard}>
      <View style={styles.uploadCardLeft}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color="#007AFF" />
        </View>
        <View>
          <Text style={styles.uploadTitle}>{title}</Text>
          <Text style={styles.uploadSubtitle}>{state.label}</Text>
        </View>
      </View>
      <View
        style={[
          styles.statusBadge,
          state.normalizedStatus === "verified"
            ? styles.verifiedBadge
            : state.normalizedStatus === "uploaded"
              ? styles.pendingBadge
              : styles.rejectedBadge,
        ]}
      >
        <Ionicons
          name={
            state.normalizedStatus === "verified"
              ? "checkmark-circle"
              : state.normalizedStatus === "uploaded"
                ? "time"
                : "close-circle"
          }
          size={16}
          color={
            state.normalizedStatus === "verified"
              ? "#16A34A"
              : state.normalizedStatus === "uploaded"
                ? "#D97706"
                : "#DC2626"
          }
        />
        <Text
          style={[
            styles.statusBadgeText,
            state.normalizedStatus === "verified"
              ? styles.verifiedBadgeText
              : state.normalizedStatus === "uploaded"
                ? styles.pendingBadgeText
                : styles.rejectedBadgeText,
          ]}
        >
          {state.label}
        </Text>
      </View>
    </View>
  );

  const renderUploadCard = ({ title, keyName, icon, state }) => {
    const selected = Boolean(files[keyName]);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => pickImage(keyName)}
        style={styles.uploadCard}
      >
        <View style={styles.uploadCardLeft}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={18} color="#007AFF" />
          </View>
          <View>
            <Text style={styles.uploadTitle}>{title}</Text>
            <Text style={styles.uploadSubtitle}>
              {selected
                ? "Selected"
                : state.normalizedStatus === "rejected"
                  ? "Tap to re-upload"
                  : "Tap to upload"}
            </Text>
            {state.rejectionReason ? (
              <Text style={styles.rejectionText}>{state.rejectionReason}</Text>
            ) : null}
          </View>
        </View>
        <Ionicons
          name={selected ? "checkmark-circle" : "cloud-upload-outline"}
          size={20}
          color={selected ? "#16A34A" : "#007AFF"}
        />
      </TouchableOpacity>
    );
  };

  const complianceSections =
    targetDocType === "all"
      ? [
          {
            title: "GST Certificate",
            keyName: "gstCertificate",
            icon: "document-attach-outline",
            state: gstDocState,
          },
          {
            title: "Business License",
            keyName: "businessLicense",
            icon: "briefcase-outline",
            state: businessDocState,
          },
        ]
      : [
          {
            title:
              targetDocType === "gstCertificate"
                ? "GST Certificate"
                : "Business License",
            keyName: targetDocType,
            icon:
              targetDocType === "gstCertificate"
                ? "document-attach-outline"
                : "briefcase-outline",
            state:
              targetDocType === "gstCertificate"
                ? gstDocState
                : businessDocState,
          },
        ];

  const hasEditableDocs = complianceSections.some((doc) => doc.state.canUpload);

  const submitDocs = async () => {
    if (isSingleDocMode && !files[targetDocType]) {
      const docLabel =
        targetDocType === "gstCertificate"
          ? "GST Certificate"
          : "Business License";

      showAlert({
        title: "Missing Document",
        message: `Please upload ${docLabel} before submitting.`,
        type: "warning",
      });
      return;
    }

    if (!isSingleDocMode && !files.gstCertificate && !files.businessLicense) {
      showAlert({
        title: "Missing Documents",
        message: "Please upload at least one document before submitting.",
        type: "warning",
      });
      return;
    }

    let timeoutId;
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("userToken");
      const debugInfo = getApiDebugInfo();
      const baseUrl = debugInfo.activeBaseUrl || api.defaults.baseURL;

      const formData = new FormData();
      if (files.gstCertificate) {
        formData.append("gstCertificate", files.gstCertificate);
      }
      if (files.businessLicense) {
        formData.append("businessLicense", files.businessLicense);
      }

      const uploadPromise = fetch(`${baseUrl}/seller/me/compliance/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("UPLOAD_TIMEOUT")),
          90000,
        );
      });

      const response = await Promise.race([uploadPromise, timeoutPromise]);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.message || "Upload failed");
      }

      showAlert({
        title: "Submitted",
        message: isSingleDocMode
          ? `${targetTitle} uploaded successfully and sent to admin for approval.`
          : "Documents uploaded successfully and sent to admin for approval.",
        type: "success",
        onConfirm: () => navigation.goBack(),
      });
    } catch (error) {
      showAlert({
        title: "Upload Failed",
        message:
          error?.message === "UPLOAD_TIMEOUT"
            ? "Upload timed out. Please try again on a better network."
            : error?.message || "Unable to upload documents.",
        type: "error",
      });
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const UploadCard = ({ title, keyName, icon }) => {
    const selected = Boolean(files[keyName]);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => pickImage(keyName)}
        style={styles.uploadCard}
      >
        <View style={styles.uploadCardLeft}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={18} color="#007AFF" />
          </View>
          <View>
            <Text style={styles.uploadTitle}>{title}</Text>
            <Text style={styles.uploadSubtitle}>
              {selected ? "Selected" : "Tap to upload"}
            </Text>
          </View>
        </View>
        <Ionicons
          name={selected ? "checkmark-circle" : "cloud-upload-outline"}
          size={20}
          color={selected ? "#16A34A" : "#007AFF"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenSurface style={styles.container}>
      <ScreenHeader title="Compliance Upload" navigation={navigation} />

      <View style={styles.content}>
        <Text style={styles.title}>{targetTitle}</Text>
        <Text style={styles.subtitle}>
          {isSingleDocMode
            ? `Track and update your ${targetTitle}. Verified documents stay read-only; rejected ones can be re-uploaded.`
            : "Track your compliance documents. Verified or under-review documents are shown below, and rejected ones can be re-uploaded."}
        </Text>

        {initialLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginTop: 18, marginBottom: 10 }}
          />
        ) : (
          complianceSections.map(({ title, keyName, icon, state }) =>
            state.normalizedStatus === "verified" ||
            state.normalizedStatus === "uploaded" ? (
              <View key={keyName} style={styles.sectionWrap}>
                {renderStatusCard({ title, state, icon })}
                {state.rejectionReason ? (
                  <Text style={styles.rejectionText}>
                    {state.rejectionReason}
                  </Text>
                ) : null}
              </View>
            ) : (
              <View key={keyName} style={styles.sectionWrap}>
                {renderStatusCard({ title, state, icon })}
                {renderUploadCard({ title, keyName, icon, state })}
              </View>
            ),
          )
        )}

        {!initialLoading && !hasEditableDocs ? (
          <View style={styles.completeNotice}>
            <Ionicons name="shield-checkmark" size={18} color="#166534" />
            <Text style={styles.completeNoticeText}>
              All selected compliance documents are already submitted or
              verified.
            </Text>
          </View>
        ) : null}

        <Button
          title={loading ? "Submitting..." : "Submit For Admin Approval"}
          onPress={submitDocs}
          disabled={loading || initialLoading || !hasEditableDocs}
          style={{ marginTop: 18 }}
        />

        {loading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginTop: 12 }}
          />
        ) : null}

        <View style={{ height: insets.bottom + 8 }} />
      </View>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
  },
  sectionWrap: {
    marginBottom: 6,
  },
  uploadCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    minHeight: 68,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    minHeight: 68,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  uploadCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  uploadTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  uploadSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  rejectionText: {
    marginTop: 3,
    color: "#B91C1C",
    fontSize: 11,
    lineHeight: 15,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  verifiedBadge: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  pendingBadge: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
  },
  rejectedBadge: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  statusBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  verifiedBadgeText: {
    color: "#15803D",
  },
  pendingBadgeText: {
    color: "#B45309",
  },
  rejectedBadgeText: {
    color: "#B91C1C",
  },
  completeNotice: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  completeNoticeText: {
    flex: 1,
    marginLeft: 8,
    color: "#166534",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default SellerComplianceUploadScreen;
