import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../theme/colors";
import Button from "../../components/Button";
import api, { getApiDebugInfo } from "../../api/config";
import { useAppAlert } from "../../context/AlertContext";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getMediaTypeForField = (fieldName) => {
  if (ImagePicker.MediaType?.Images && ImagePicker.MediaType?.Videos) {
    if (fieldName === "makingProof") {
      return [ImagePicker.MediaType.Videos];
    }
    return [ImagePicker.MediaType.Images];
  }

  // String fallback keeps compatibility with older SDKs without using deprecated constants.
  if (fieldName === "makingProof") {
    return "videos";
  }
  return "images";
};

const SellerOnboardingScreen = ({ navigation }) => {
  const { showAlert } = useAppAlert();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [docs, setDocs] = useState({
    idProof: null,
    locationProof: null,
    makingProof: null,
  });
  const insets = useSafeAreaInsets();

  const isSubmissionLocked = useMemo(() => {
    const status = String(verificationStatus?.status || "")
      .trim()
      .toLowerCase();
    return status === "pending" || status === "approved";
  }, [verificationStatus]);

  const fetchVerificationStatus = async () => {
    try {
      setStatusLoading(true);
      const { data } = await api.get("/seller/me/verification-status");
      setVerificationStatus(data || null);
    } catch (_error) {
      setVerificationStatus(null);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const pickDoc = async (fieldName) => {
    if (isSubmissionLocked) {
      showAlert({
        title: "Submission Locked",
        message:
          verificationStatus?.message ||
          "Your documents are already submitted. Please wait for the review result before uploading again.",
        type: "warning",
      });
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert({
          title: "Permission Required",
          message:
            "Please allow gallery access to upload verification documents.",
          type: "warning",
        });
        return;
      }

      let result;
      const pickerOptions = {
        mediaTypes: getMediaTypeForField(fieldName),
        quality: fieldName === "makingProof" ? 1 : 0.8,
      };

      result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];
        setDocs((prev) => ({
          ...prev,
          [fieldName]: {
            uri: file.uri,
            type:
              file.mimeType ||
              (fieldName === "makingProof" ? "video/mp4" : "image/jpeg"),
            name:
              file.fileName ||
              `${fieldName}_${Date.now()}.${fieldName === "makingProof" ? "mp4" : "jpg"}`,
          },
        }));
      }
    } catch (error) {
      showAlert({
        title: "Picker Error",
        message:
          error?.message ||
          "Unable to select document right now. Please try a different file.",
        type: "error",
      });
    }
  };

  const submitDocs = async () => {
    let hardTimeoutId;

    if (loading) {
      return;
    }

    if (isSubmissionLocked) {
      showAlert({
        title: "Already Submitted",
        message:
          verificationStatus?.message ||
          "Your verification is already in progress. Please wait for approval or rejection.",
        type: "warning",
      });
      return;
    }

    if (!docs.idProof || !docs.locationProof || !docs.makingProof) {
      showAlert({
        title: "Missing Documents",
        message:
          "Please upload ID, location, and making proof before submitting.",
        type: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      console.log("📤 [SELLER SUBMIT] Building FormData...");
      console.log("📤 [SELLER SUBMIT] idProof:", docs.idProof);
      console.log("📤 [SELLER SUBMIT] locationProof:", docs.locationProof);
      console.log("📤 [SELLER SUBMIT] makingProof:", docs.makingProof);

      const formData = new FormData();

      // Append files with proper React Native FormData format
      // Each file is an object with {uri, type, name}
      formData.append("idProof", {
        uri: docs.idProof.uri,
        type: docs.idProof.type,
        name: docs.idProof.name,
      });
      formData.append("locationProof", {
        uri: docs.locationProof.uri,
        type: docs.locationProof.type,
        name: docs.locationProof.name,
      });
      formData.append("makingProof", {
        uri: docs.makingProof.uri,
        type: docs.makingProof.type,
        name: docs.makingProof.name,
      });

      console.log("📤 [SELLER SUBMIT] FormData constructed with files");

      // Get token
      const token = await AsyncStorage.getItem("userToken");
      console.log("📤 [SELLER SUBMIT] Token:", token ? "present" : "missing");

      // Get the API base URL
      const debugInfo = getApiDebugInfo();
      const baseUrl = debugInfo.activeBaseUrl || "http://localhost:5000/api";
      const uploadUrl = `${baseUrl}/seller/verify`;

      console.log("📤 [SELLER SUBMIT] Submitting to:", uploadUrl);

      // Use fetch instead of axios for FormData with file:// URIs
      // Fetch handles file URIs better than axios
      const uploadPromise = fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT set Content-Type - let fetch handle it with proper boundaries
        },
        body: formData,
      });

      const hardTimeoutPromise = new Promise((_, reject) => {
        hardTimeoutId = setTimeout(() => {
          reject(new Error("UPLOAD_HARD_TIMEOUT"));
        }, 130000);
      });

      const response = await Promise.race([uploadPromise, hardTimeoutPromise]);

      console.log("📤 [SELLER SUBMIT] Response status:", response?.status);

      if (!response.ok) {
        let errorMsg = "Upload failed";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
          console.log("❌ [SELLER SUBMIT] Server error:", errorData);
        } catch (e) {
          console.log("❌ [SELLER SUBMIT] Error parsing response:", e);
        }
        throw new Error(errorMsg);
      }

      const responseData = await response.json();
      console.log("✅ [SELLER SUBMIT] Success! Response:", responseData);

      showAlert({
        title: "Submitted",
        message:
          "Documents received. Our team is reviewing them now. We will notify you once a decision is made.",
        type: "success",
        onConfirm: () => {
          fetchVerificationStatus();
          navigation.goBack();
        },
      });
    } catch (error) {
      const isHardTimeout = error?.message === "UPLOAD_HARD_TIMEOUT";
      const serverErrorMsg = error?.message;

      console.log("❌ [SELLER SUBMIT] Error:", {
        message: error?.message,
        isTimeout: isHardTimeout,
      });

      showAlert({
        title: "Submission Failed",
        message:
          (isHardTimeout
            ? "Upload timed out. Please try a shorter video or a stronger network."
            : null) ||
          serverErrorMsg ||
          "Failed to submit verification documents.",
        type: "error",
      });
    } finally {
      if (hardTimeoutId) {
        clearTimeout(hardTimeoutId);
      }
      setLoading(false);
    }
  };

  const DocTile = ({ title, field }) => (
    <TouchableOpacity style={styles.docTile} onPress={() => pickDoc(field)}>
      <Text style={styles.docTitle}>{title}</Text>
      <Text style={styles.docStatus}>
        {docs[field] ? "Selected" : "Tap to upload"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenSurface style={styles.container}>
      <ScreenHeader title="Verification" navigation={navigation} />
      {statusLoading ? (
        <View style={[styles.statusCard, styles.statusCardNeutral]}>
          <Text style={styles.statusTitle}>
            Checking verification status...
          </Text>
        </View>
      ) : verificationStatus ? (
        <View
          style={[
            styles.statusCard,
            verificationStatus.status === "approved"
              ? styles.statusCardApproved
              : verificationStatus.status === "rejected"
                ? styles.statusCardRejected
                : verificationStatus.status === "pending"
                  ? styles.statusCardPending
                  : styles.statusCardNeutral,
          ]}
        >
          <Text style={styles.statusTitle}>{verificationStatus.label}</Text>
          <Text style={styles.statusMessage}>{verificationStatus.message}</Text>
          {verificationStatus.rejectionReason ? (
            <Text style={styles.statusReason}>
              Last rejection note: {verificationStatus.rejectionReason}
            </Text>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.description}>
        Upload your ID proof, location proof, and a video showing the making of
        your authentic products.
      </Text>

      <DocTile title="Upload ID Proof" field="idProof" />
      <DocTile title="Upload Location Proof" field="locationProof" />
      <DocTile title="Upload Making Proof (Video)" field="makingProof" />

      <Button
        title={
          loading
            ? "Submitting..."
            : isSubmissionLocked
              ? "Waiting for Review"
              : "Submit for Approval"
        }
        onPress={submitDocs}
        disabled={loading || statusLoading || isSubmissionLocked}
        style={{ marginTop: 24, marginBottom: 24 + insets.bottom }}
      />
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 18,
    lineHeight: 24,
  },
  statusCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  statusCardNeutral: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
  },
  statusCardPending: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FCD34D",
  },
  statusCardApproved: {
    backgroundColor: "#DCFCE7",
    borderColor: "#4ADE80",
  },
  statusCardRejected: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  statusTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
  statusMessage: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  statusReason: {
    marginTop: 8,
    color: colors.error,
    fontSize: 12,
    fontWeight: "600",
  },
  docTile: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  docTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  docStatus: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 13,
  },
});

export default SellerOnboardingScreen;
