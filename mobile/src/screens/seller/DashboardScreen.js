import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Polyline, Svg } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/config";
import ScreenSurface from "../../components/ScreenSurface";

const toSparklinePoints = (values) => {
  if (!values.length) return "0,26 20,18 40,20 60,10 80,14";

  const max = Math.max(...values, 1);
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 80;
      const y = 26 - (value / max) * 20;
      return `${x},${y}`;
    })
    .join(" ");
};

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, verificationRes] = await Promise.all([
        api.get("/seller/me/stats"),
        api.get("/seller/me/verification-status"),
      ]);

      setStats(statsRes?.data || null);
      setVerificationStatus(verificationRes?.data || null);
    } catch (_error) {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const verificationState = String(verificationStatus?.status || "")
    .trim()
    .toLowerCase();
  const isSellerApproved =
    verificationState === "approved" || Boolean(user?.isVerified);

  const verificationBanner = useMemo(() => {
    if (verificationState === "pending") {
      return {
        title: "Verification under review",
        subtitle: "Your submission is being verified by the admin team.",
        cta: "View status",
        color: colors.warning,
        bg: colors.warningLight,
      };
    }

    if (verificationState === "rejected") {
      return {
        title: "Verification needs update",
        subtitle: "Update your documents to continue listing products.",
        cta: "Resubmit docs",
        color: colors.error,
        bg: colors.errorLight,
      };
    }

    return {
      title: "Complete your verification",
      subtitle: "Get verified to unlock product publishing and payouts.",
      cta: "Start onboarding",
      color: colors.primary,
      bg: colors.lightBackground,
    };
  }, [verificationState]);

  const trendSeries = {
    orders: [20, 24, 23, 30, 33, 36],
    revenue: [34, 36, 38, 42, 46, 52],
    trust: [70, 73, 76, 79, 82, 84],
    products: [8, 9, 11, 12, 14, 15],
  };

  const kpis = [
    {
      key: "orders",
      label: "Orders",
      value: Number(stats?.totalOrders || 0),
      icon: "receipt-outline",
      delta: "up 12%",
      series: trendSeries.orders,
    },
    {
      key: "revenue",
      label: "Revenue",
      value: `Rs ${Number(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: "cash-outline",
      delta: "up 8%",
      series: trendSeries.revenue,
    },
    {
      key: "trust",
      label: "Trust",
      value: `${Number(stats?.trustScore || user?.trustScore || 0)}%`,
      icon: "shield-checkmark-outline",
      delta: "up 3%",
      series: trendSeries.trust,
    },
    {
      key: "products",
      label: "Products",
      value: Number(stats?.totalProducts || 0),
      icon: "cube-outline",
      delta: "up 5%",
      series: trendSeries.products,
    },
  ];

  const quickActions = [
    {
      key: "add",
      title: "Add Product",
      icon: "add-circle-outline",
      route: "ProductUpload",
    },
    {
      key: "orders",
      title: "View Orders",
      icon: "receipt-outline",
      route: "Orders",
    },
    {
      key: "compliance",
      title: "Check Compliance",
      icon: "document-text-outline",
      route: "SellerCompliance",
    },
  ];

  return (
    <ScreenSurface style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 16,
          paddingBottom: 88 + insets.bottom,
        }}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.header}>Seller Dashboard</Text>
            <Text style={styles.subheader}>
              Performance, trust, and operations
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate("SellerProfile")}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {!isSellerApproved ? (
          <View
            style={[
              styles.banner,
              {
                backgroundColor: verificationBanner.bg,
                borderColor: verificationBanner.color,
              },
            ]}
          >
            <Text
              style={[styles.bannerTitle, { color: verificationBanner.color }]}
            >
              {verificationBanner.title}
            </Text>
            <Text style={styles.bannerSubtitle}>
              {verificationBanner.subtitle}
            </Text>
            <TouchableOpacity
              style={[
                styles.bannerCta,
                { backgroundColor: verificationBanner.color },
              ]}
              onPress={() => navigation.navigate("SellerOnboarding")}
            >
              <Text style={styles.bannerCtaText}>{verificationBanner.cta}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 32 }}
          />
        ) : (
          <View style={styles.kpiGrid}>
            {kpis.map((item) => (
              <View key={item.key} style={styles.kpiCard}>
                <View style={styles.kpiTop}>
                  <View style={styles.kpiIcon}>
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.kpiDelta}>{item.delta}</Text>
                </View>
                <Text style={styles.kpiValue}>{item.value}</Text>
                <Text style={styles.kpiLabel}>{item.label}</Text>
                <Svg width="84" height="28" style={{ marginTop: 8 }}>
                  <Polyline
                    points={toSparklinePoints(item.series)}
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth="2"
                  />
                </Svg>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.quickTile}
              onPress={() => navigation.navigate(action.route)}
            >
              <View style={styles.quickIconWrap}>
                <Ionicons name={action.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.quickTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, backgroundColor: colors.surface },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: { fontSize: 25, fontWeight: "800", color: colors.textPrimary },
  subheader: { marginTop: 3, color: colors.textSecondary, fontSize: 13 },
  settingsBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  bannerTitle: { fontSize: 17, fontWeight: "800" },
  bannerSubtitle: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  bannerCta: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerCtaText: { color: colors.white, fontWeight: "800", fontSize: 14 },
  kpiGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  kpiCard: {
    width: "48.5%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 12,
    marginBottom: 12,
  },
  kpiTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kpiIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  kpiDelta: { color: colors.success, fontWeight: "700", fontSize: 12 },
  kpiValue: {
    marginTop: 10,
    fontSize: 19,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  kpiLabel: { marginTop: 1, fontSize: 12, color: colors.textSecondary },
  sectionTitle: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  quickGrid: { flexDirection: "row", justifyContent: "space-between" },
  quickTile: {
    width: "31%",
    minHeight: 94,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  quickIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickTitle: {
    textAlign: "center",
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 12,
  },
  logoutBtn: {
    marginTop: 20,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.errorLight,
  },
  logoutText: { color: colors.error, fontWeight: "700" },
});

export default DashboardScreen;
