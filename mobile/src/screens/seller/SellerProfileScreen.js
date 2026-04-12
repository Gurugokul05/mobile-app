import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";
import api from "../../api/config";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenSurface from "../../components/ScreenSurface";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppAlert } from "../../context/AlertContext";

const SellerProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const { showAlert } = useAppAlert();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [profileSnapshot, setProfileSnapshot] = useState({});
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    responseTime: "< 2 hours",
    workingHours: "09:00 AM - 06:00 PM",
    description: "",
    upiId: "",
  });
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [vacationMode, setVacationMode] = useState(false);
  const insets = useSafeAreaInsets();

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        api.get("/auth/profile"),
        api.get("/seller/me/stats"),
      ]);
      const data = profileRes?.data || {};
      setForm({
        name: data?.name || user?.name || "",
        phone: data?.phone || "",
        address: data?.address || "",
        responseTime: data?.responseTime || "< 2 hours",
        workingHours: data?.workingHours || "09:00 AM - 06:00 PM",
        description: data?.description || "",
        upiId: data?.upiId || "",
      });
      setProfileSnapshot(data);
      setStats(statsRes?.data || null);
      setAcceptingOrders(data?.acceptingOrders !== false);
      setVacationMode(Boolean(data?.vacationMode));
    } catch (error) {
      console.log("Seller profile fetch failed:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, [user?.name]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!String(form.name || "").trim()) nextErrors.name = "Name is required";
    if (!String(form.phone || "").trim()) {
      nextErrors.phone = "Phone is required";
    }
    if (!String(form.address || "").trim()) {
      nextErrors.address = "Address is required";
    }
    if (!String(form.responseTime || "").trim()) {
      nextErrors.responseTime = "Response time is required";
    }

    if (!String(form.description || "").trim()) {
      nextErrors.description = "Short description is required";
    }

    const normalizedUpiId = String(form.upiId || "")
      .trim()
      .toLowerCase();
    if (!normalizedUpiId) {
      nextErrors.upiId = "UPI ID is required";
    } else if (
      !/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(normalizedUpiId)
    ) {
      nextErrors.upiId = "UPI ID format is invalid (example: name@bank)";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    const name = String(form.name || "").trim();
    const phone = String(form.phone || "").trim();
    const address = String(form.address || "").trim();

    const payload = {
      ...profileSnapshot,
      name,
      phone,
      address,
      responseTime: String(form.responseTime || "").trim(),
      workingHours: String(form.workingHours || "").trim(),
      description: String(form.description || "").trim(),
      upiId: String(form.upiId || "")
        .trim()
        .toLowerCase(),
      acceptingOrders,
      vacationMode,
    };

    try {
      setSaving(true);
      const { data } = await api.put("/auth/profile", payload);
      await updateUser(data);
      showAlert({
        title: "Profile Updated",
        message: "Profile updated successfully.",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Update Failed",
        message: error?.response?.data?.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const rating = Number(
    stats?.averageRating ?? profileSnapshot?.averageRating ?? 0,
  );
  const reviewCount = Number(
    stats?.reviewCount ?? profileSnapshot?.totalReviews ?? 0,
  );
  const onTimeDelivery = Number(stats?.onTimeDelivery ?? 0);
  const cancellationRate = Number(stats?.cancellationRate ?? 0);
  const customerSatisfaction = Number(stats?.customerSatisfaction ?? 0);
  const deliveredOrders = Number(stats?.deliveredOrders || 0);
  const totalOrders = Number(stats?.totalOrders || 0);
  const conversionRate =
    totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

  const sellerLevel = useMemo(() => {
    const trust = Number(user?.trustScore || 0);
    if (trust >= 90) return "Gold";
    if (trust >= 75) return "Silver";
    return "Bronze";
  }, [user?.trustScore]);

  const isGstVerified =
    profileSnapshot?.complianceDocs?.gstCertificate?.status === "verified";
  const isKycVerified =
    profileSnapshot?.complianceDocs?.businessLicense?.status === "verified";

  const requiredChecks = [
    String(form.name || "").trim(),
    String(form.phone || "").trim(),
    String(form.address || "").trim(),
    String(form.responseTime || "").trim(),
    String(form.description || "").trim(),
    String(form.upiId || "").trim(),
    user?.isVerified ? "ok" : "",
  ];
  const profileCompletion = Math.round(
    (requiredChecks.filter(Boolean).length / requiredChecks.length) * 100,
  );

  const hasSubmittedVerificationDocs = Boolean(
    user?.verificationDocs?.idProofUrl ||
    user?.verificationDocs?.locationProofUrl ||
    user?.verificationDocs?.makingProofUrl,
  );

  const shouldShowCompleteVerificationAction =
    !user?.isVerified && !hasSubmittedVerificationDocs;

  const reviewBars = useMemo(() => {
    const breakdown = stats?.ratingBreakdown || {};
    const stars = [5, 4, 3, 2, 1];

    return stars.map((star) => {
      const count = Number(breakdown?.[star] || 0);
      const rawPercent = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
      const value = rawPercent > 0 ? Math.max(rawPercent, 4) : 0;

      return {
        star: `${star}★`,
        value,
      };
    });
  }, [reviewCount, stats?.ratingBreakdown]);

  const hasAnalyticsData =
    totalOrders > 0 || Number(stats?.totalRevenue || 0) > 0;
  const hasReviewData = reviewCount > 0;

  const SectionTitle = ({ title, subtitle }) => (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );

  const ListItem = ({ icon, title, subtitle, onPress, disabled = false }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || !onPress}
      style={[styles.listItem, disabled && styles.listItemDisabled]}
    >
      <View style={styles.listItemLeft}>
        <View style={styles.listIconWrap}>
          <Ionicons name={icon} size={18} color="#007AFF" />
        </View>
        <View>
          <Text style={styles.listTitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.listSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <ScreenSurface style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.containerContent,
          {
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
            paddingBottom: 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identityCard}>
          <View style={styles.identityTopRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>
                {String(user?.name || "S")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
            <View style={styles.identityTextWrap}>
              <Text style={styles.identityName}>{user?.name || "Seller"}</Text>
              <Text style={styles.identityEmail}>{user?.email || "-"}</Text>
              <View style={styles.badgesRow}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{sellerLevel}</Text>
                </View>
                <View style={styles.verifyBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
                  <Text style={styles.verifyBadgeText}>
                    {user?.isVerified ? "Verified Seller" : "Pending"}
                  </Text>
                </View>
                <View style={styles.verifyBadge}>
                  <Ionicons
                    name={
                      isGstVerified ? "checkmark-circle" : "ellipse-outline"
                    }
                    size={12}
                    color={isGstVerified ? "#16A34A" : "#6B7280"}
                  />
                  <Text style={styles.verifyBadgeText}>GST</Text>
                </View>
                <View style={styles.verifyBadge}>
                  <Ionicons
                    name={
                      isKycVerified ? "checkmark-circle" : "ellipse-outline"
                    }
                    size={12}
                    color={isKycVerified ? "#16A34A" : "#6B7280"}
                  />
                  <Text style={styles.verifyBadgeText}>KYC</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.progressLabel}>
            Profile Completion: {profileCompletion}%
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${profileCompletion}%` }]}
            />
          </View>
        </View>

        <View style={styles.sectionGap}>
          <SectionTitle title="Performance Snapshot" />
          <View style={styles.inlineMetricsRow}>
            <View style={styles.inlineMetricItem}>
              <Text style={styles.inlineMetricValue}>{totalOrders}</Text>
              <Text style={styles.inlineMetricLabel}>Orders (30d)</Text>
            </View>
            <View style={styles.inlineMetricItem}>
              <Text style={styles.inlineMetricValue}>
                ₹{(stats?.totalRevenue || 0).toLocaleString()}
              </Text>
              <Text style={styles.inlineMetricLabel}>Revenue (30d)</Text>
            </View>
            <View style={styles.inlineMetricItem}>
              <Text style={styles.inlineMetricValue}>
                {stats?.totalProducts || 0}
              </Text>
              <Text style={styles.inlineMetricLabel}>Active Listings</Text>
            </View>
            <View style={styles.inlineMetricItem}>
              <Text style={styles.inlineMetricValue}>{conversionRate}%</Text>
              <Text style={styles.inlineMetricLabel}>Conversion</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.sectionGap]}>
          <SectionTitle title="Trust & Credibility" />
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Text style={styles.trustValue}>⭐ {rating.toFixed(1)}</Text>
              <Text style={styles.trustLabel}>Rating</Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustValue}>{reviewCount}</Text>
              <Text style={styles.trustLabel}>Reviews</Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustValue}>{onTimeDelivery}%</Text>
              <Text style={styles.trustLabel}>On-time</Text>
            </View>
          </View>
          <View style={styles.trustRowSecondary}>
            <Text style={styles.subtleMetric}>
              Cancellation: {cancellationRate}%
            </Text>
            <Text style={styles.subtleMetric}>
              Satisfaction: {customerSatisfaction}%
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.sectionGap]}>
          <SectionTitle title="Operations Control" />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Accepting Orders</Text>
            <Switch
              value={acceptingOrders}
              onValueChange={setAcceptingOrders}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor="#007AFF"
            />
          </View>
          <View style={styles.fieldGroupCompact}>
            <Text style={styles.label}>Working Hours</Text>
            <TextInput
              value={form.workingHours}
              onChangeText={(value) => setField("workingHours", value)}
              style={styles.input}
              placeholder="09:00 AM - 06:00 PM"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.fieldGroupCompact}>
            <Text style={styles.label}>Response Time</Text>
            <TextInput
              value={form.responseTime}
              onChangeText={(value) => setField("responseTime", value)}
              style={[styles.input, errors.responseTime && styles.inputError]}
              placeholder="< 2 hours"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.switchRowLast}>
            <Text style={styles.switchLabel}>Vacation Mode</Text>
            <Switch
              value={vacationMode}
              onValueChange={setVacationMode}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor="#007AFF"
            />
          </View>
        </View>

        <View style={styles.sectionGap}>
          <SectionTitle title="Product Management" />
          <View style={styles.listSection}>
            <ListItem
              icon="cube-outline"
              title="View My Products"
              onPress={() => navigation.navigate("Products")}
            />
            <ListItem
              icon="alert-circle-outline"
              title="Low Stock Alerts"
              onPress={() => navigation.navigate("SellerLowStock")}
            />
          </View>
        </View>

        <View style={[styles.card, styles.sectionGap]}>
          <SectionTitle title="Payout & Finance" />
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>Bank / UPI Details</Text>
            <Text style={styles.financeValue}>
              {String(form.upiId || "").trim() ? "Configured" : "Missing"}
            </Text>
          </View>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>Earnings Summary</Text>
            <Text style={styles.financeValue}>
              ₹{(stats?.totalRevenue || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.financeRowLast}>
            <Text style={styles.financeLabel}>Pending Payout</Text>
            <Text style={styles.financeValue}>
              ₹{(stats?.pendingPayout || 0).toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("SellerTransactions")}
          >
            <Text style={styles.secondaryButtonText}>View Transactions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionGap}>
          <SectionTitle title="Analytics Preview" />
          <View style={styles.analyticsRow}>
            <View style={styles.insightMiniCard}>
              <Text style={styles.insightValue}>
                ₹{Number(stats?.totalRevenue || 0).toLocaleString()}
              </Text>
              <Text style={styles.insightText}>Revenue (30d)</Text>
            </View>
            <View style={styles.insightMiniCard}>
              <Text style={styles.insightValue}>{totalOrders}</Text>
              <Text style={styles.insightText}>Orders (30d)</Text>
            </View>
          </View>
          {!hasAnalyticsData ? (
            <Text style={styles.emptyHintText}>
              No analytics data yet. Start selling to view insights.
            </Text>
          ) : null}
        </View>

        <View style={[styles.card, styles.sectionGap]}>
          <SectionTitle title="Reviews Summary" />
          <Text style={styles.reviewHeadline}>
            {rating.toFixed(1)} average from {reviewCount} reviews
          </Text>
          {hasReviewData ? (
            reviewBars.map((item) => (
              <View key={item.star} style={styles.starBarRow}>
                <Text style={styles.starLabel}>{item.star}</Text>
                <View style={styles.starTrack}>
                  <View
                    style={[styles.starFill, { width: `${item.value}%` }]}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyHintText}>No customer reviews yet.</Text>
          )}
        </View>

        <View style={[styles.card, styles.sectionGap]}>
          <SectionTitle title="Compliance & Documents" />
          <ListItem
            icon="document-attach-outline"
            title="GST Certificate"
            subtitle={
              profileSnapshot?.complianceDocs?.gstCertificate?.status ===
              "uploaded"
                ? "Uploaded • Waiting for admin approval"
                : profileSnapshot?.complianceDocs?.gstCertificate?.status ===
                    "rejected"
                  ? "Rejected • Re-upload required"
                  : isGstVerified
                    ? "Verified"
                    : "Not verified"
            }
            disabled={isGstVerified}
            onPress={
              isGstVerified
                ? undefined
                : () =>
                    navigation.navigate("SellerComplianceUpload", {
                      docType: "gstCertificate",
                    })
            }
          />
          <ListItem
            icon="briefcase-outline"
            title="Business License"
            subtitle={
              profileSnapshot?.complianceDocs?.businessLicense?.status ===
              "uploaded"
                ? "Uploaded • Waiting for admin approval"
                : profileSnapshot?.complianceDocs?.businessLicense?.status ===
                    "rejected"
                  ? "Rejected • Re-upload required"
                  : isKycVerified
                    ? "Verified"
                    : "Not verified"
            }
            disabled={isKycVerified}
            onPress={
              isKycVerified
                ? undefined
                : () =>
                    navigation.navigate("SellerComplianceUpload", {
                      docType: "businessLicense",
                    })
            }
          />
        </View>

        <View style={styles.sectionGap}>
          <SectionTitle title="Security" />
          <View style={styles.listSection}>
            <ListItem
              icon="lock-closed-outline"
              title="Change Password"
              onPress={() =>
                navigation.navigate("SellerSecurity", {
                  section: "password",
                })
              }
            />
            <ListItem
              icon="shield-outline"
              title="Enable 2FA"
              onPress={() =>
                navigation.navigate("SellerSecurity", {
                  section: "twoFactor",
                })
              }
            />
            <ListItem
              icon="time-outline"
              title="Login Activity"
              onPress={() =>
                navigation.navigate("SellerSecurity", {
                  section: "activity",
                })
              }
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loadingIndicator}
          />
        ) : (
          <View style={[styles.card, styles.sectionGap]}>
            <SectionTitle
              title="Profile Form"
              subtitle="Essential seller details"
            />
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                value={form.name}
                onChangeText={(value) => setField("name", value)}
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Your full name"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                value={form.phone}
                onChangeText={(value) => setField("phone", value)}
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                value={form.address}
                onChangeText={(value) => setField("address", value)}
                style={[styles.input, errors.address && styles.inputError]}
                placeholder="Complete business address"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.address ? (
                <Text style={styles.errorText}>{errors.address}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>UPI ID *</Text>
              <TextInput
                value={form.upiId}
                onChangeText={(value) => setField("upiId", value)}
                style={[styles.input, errors.upiId && styles.inputError]}
                placeholder="name@bank"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.upiId ? (
                <Text style={styles.errorText}>{errors.upiId}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                value={form.description}
                onChangeText={(value) => setField("description", value)}
                style={[
                  styles.input,
                  styles.inputMultilineLong,
                  errors.description && styles.inputError,
                ]}
                placeholder="One-line summary about your store"
                placeholderTextColor={colors.textSecondary}
                multiline
                textAlignVertical="top"
              />
              {errors.description ? (
                <Text style={styles.errorText}>{errors.description}</Text>
              ) : null}
            </View>
          </View>
        )}

        <View style={styles.sectionGap}>
          <SectionTitle title="Primary Actions" />
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveProfile}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : "Save Profile"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionListItem}
            onPress={() => navigation.navigate("ProductUpload")}
            activeOpacity={0.85}
          >
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Upload Product</Text>
              <Text style={styles.actionSubtitle}>
                Add new products to your catalog
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {shouldShowCompleteVerificationAction && (
            <TouchableOpacity
              style={styles.actionListItem}
              onPress={() => navigation.navigate("SellerOnboarding")}
              activeOpacity={0.85}
            >
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>Complete Verification</Text>
                <Text style={styles.actionSubtitle}>
                  Upload and manage seller documents
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scroll: {
    flex: 1,
  },
  containerContent: {
    backgroundColor: "#F9FAFB",
  },
  sectionGap: {
    marginTop: 16,
  },
  sectionTitleWrap: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  identityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  identityTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  identityTextWrap: {
    flex: 1,
  },
  identityName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  identityEmail: {
    marginTop: 2,
    color: "#6B7280",
    fontSize: 13,
  },
  badgesRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  levelBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  levelBadgeText: {
    color: "#007AFF",
    fontSize: 11,
    fontWeight: "700",
  },
  verifyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  verifyBadgeText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  progressLabel: {
    marginTop: 2,
    marginBottom: 8,
    color: "#6B7280",
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: "#E5E7EB",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#007AFF",
  },
  previewStoreButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inlineMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 4,
  },
  inlineMetricItem: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  inlineMetricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  inlineMetricLabel: {
    marginTop: 2,
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
  trustRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trustItem: {
    alignItems: "center",
    width: "32%",
  },
  trustValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  trustLabel: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  trustRowSecondary: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subtleMetric: {
    fontSize: 13,
    color: "#6B7280",
  },
  listSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  listItemDisabled: {
    opacity: 0.65,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  listIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  listSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  secondaryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 12,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  switchRowLast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  fieldGroupCompact: {
    marginBottom: 12,
  },
  financeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  financeRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  financeLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  financeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  analyticsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  insightMiniCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007AFF",
  },
  insightText: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },
  emptyHintText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
  },
  reviewHeadline: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  starBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  starLabel: {
    width: 28,
    fontSize: 12,
    color: "#6B7280",
  },
  starTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 99,
  },
  starFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#007AFF",
  },
  reviewPreview: {
    marginTop: 4,
    fontSize: 12,
    color: "#374151",
  },
  loadingIndicator: {
    marginTop: 16,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    color: "#111827",
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    color: "#111827",
    fontSize: 14,
  },
  inputMultilineLong: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    marginTop: 4,
    color: colors.error,
    fontSize: 12,
    fontWeight: "600",
  },
  saveBtn: {
    marginTop: 4,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  actionListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  actionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  logoutButton: {
    marginTop: 16,
    paddingVertical: 4,
  },
  logoutText: {
    textAlign: "center",
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SellerProfileScreen;
