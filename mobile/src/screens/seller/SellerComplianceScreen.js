import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import ScreenSurface from "../../components/ScreenSurface";
import api from "../../api/config";

const SellerComplianceScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [complianceDocs, setComplianceDocs] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        try {
          setLoading(true);
          const { data } = await api.get("/seller/me/compliance");
          setComplianceDocs(data?.complianceDocs || null);
        } finally {
          setLoading(false);
        }
      };

      load();
    }, []),
  );

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

  const gstState = mapDocState(complianceDocs?.gstCertificate);
  const businessState = mapDocState(complianceDocs?.businessLicense);

  const docs = [
    {
      id: "gst",
      title: "GST Certificate",
      status: gstState.label,
      normalizedStatus: gstState.normalizedStatus,
      canUpload: gstState.canUpload,
      uploaded: gstState.uploaded,
      rejectionReason: gstState.rejectionReason,
    },
    {
      id: "biz",
      title: "Business License",
      status: businessState.label,
      normalizedStatus: businessState.normalizedStatus,
      canUpload: businessState.canUpload,
      uploaded: businessState.uploaded,
      rejectionReason: businessState.rejectionReason,
    },
  ];
  const allVerified = docs.every((doc) => doc.normalizedStatus === "verified");
  const hasActionableDocs = docs.some((doc) => doc.canUpload);

  return (
    <ScreenSurface style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
      >
        <Text style={styles.title}>Compliance & Documents</Text>
        <Text style={styles.subtitle}>
          Manage verification and expiry status
        </Text>

        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={{ marginVertical: 16 }}
            />
          ) : (
            docs.map((doc, index) => (
              <View
                key={doc.id}
                style={[
                  styles.row,
                  index === docs.length - 1 && styles.rowLast,
                ]}
              >
                <View>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docMeta}>{doc.status}</Text>
                  {doc.rejectionReason ? (
                    <Text style={styles.rejectionText}>
                      {doc.rejectionReason}
                    </Text>
                  ) : null}
                </View>
                {doc.normalizedStatus === "verified" ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#16A34A"
                    />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                ) : doc.normalizedStatus === "uploaded" ? (
                  <View style={styles.pendingBadge}>
                    <Ionicons name="time" size={16} color="#D97706" />
                    <Text style={styles.pendingText}>Under Review</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    disabled={!doc.canUpload}
                    onPress={() =>
                      navigation.navigate("SellerComplianceUpload", {
                        docType:
                          doc.id === "gst"
                            ? "gstCertificate"
                            : "businessLicense",
                      })
                    }
                  >
                    <Ionicons
                      name={
                        doc.uploaded
                          ? "checkmark-circle-outline"
                          : "cloud-upload-outline"
                      }
                      size={16}
                      color="#007AFF"
                    />
                    <Text style={styles.uploadText}>
                      {doc.uploaded ? "Update" : "Upload"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {allVerified ? (
          <View style={styles.allVerifiedWrap}>
            <Text style={styles.allVerifiedText}>
              All compliance documents are verified.
            </Text>
          </View>
        ) : !hasActionableDocs ? (
          <View style={styles.pendingAllWrap}>
            <Text style={styles.pendingAllText}>
              Documents are under admin review.
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() =>
              navigation.navigate("SellerComplianceUpload", {
                docType: "all",
              })
            }
          >
            <Text style={styles.manageButtonText}>Open Upload Center</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 14, color: "#6B7280" },
  card: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLast: { borderBottomWidth: 0 },
  docTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  docMeta: { marginTop: 2, fontSize: 12, color: "#6B7280" },
  rejectionText: { marginTop: 2, fontSize: 11, color: "#B91C1C" },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  uploadText: {
    marginLeft: 4,
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "600",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  verifiedText: {
    marginLeft: 4,
    color: "#15803D",
    fontSize: 12,
    fontWeight: "700",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCD34D",
    backgroundColor: "#FFFBEB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pendingText: {
    marginLeft: 4,
    color: "#B45309",
    fontSize: 12,
    fontWeight: "700",
  },
  manageButton: {
    marginTop: 12,
    borderRadius: 12,
    minHeight: 44,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  manageButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  allVerifiedWrap: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  allVerifiedText: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  pendingAllWrap: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCD34D",
    backgroundColor: "#FFFBEB",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  pendingAllText: {
    color: "#B45309",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default SellerComplianceScreen;
