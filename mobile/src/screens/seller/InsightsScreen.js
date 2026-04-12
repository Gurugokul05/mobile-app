import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api/config";
import { colors } from "../../theme/colors";
import ScreenSurface from "../../components/ScreenSurface";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppAlert } from "../../context/AlertContext";

const maxOrOne = (arr) => {
  const max = Math.max(...arr, 0);
  return max > 0 ? max : 1;
};

const InsightsScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [revenuePoints, setRevenuePoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const insets = useSafeAreaInsets();
  const { showAlert } = useAppAlert();

  const fetchInsights = async () => {
    try {
      const [statsRes, revenueRes] = await Promise.all([
        api.get("/seller/me/stats"),
        api.get("/seller/me/revenue"),
      ]);
      setStats(statsRes.data || null);
      setRevenuePoints(
        Array.isArray(revenueRes.data) ? revenueRes.data.slice(-6) : [],
      );
    } catch (error) {
      console.log(
        "Seller insights fetch error:",
        error?.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setDownloading(true);
      const fileName = `revenue-insights-${new Date().getTime()}.pdf`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      const token = await AsyncStorage.getItem("userToken");
      const baseURL = String(api.defaults.baseURL || "").replace(/\/$/, "");
      const requestUrl = `${baseURL}/seller/me/insights/pdf`;

      await FileSystem.downloadAsync(requestUrl, filePath, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Share or open the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "application/pdf",
          dialogTitle: "Share Revenue Insights",
        });
      } else {
        showAlert({
          title: "Success",
          message: "PDF downloaded to your device",
          type: "success",
        });
      }
    } catch (error) {
      console.error(
        "PDF download error:",
        error?.response?.data || error?.message || error,
      );
      showAlert({
        title: "Error",
        message:
          error?.response?.data?.message ||
          "Failed to download PDF. Please try again.",
        type: "error",
      });
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const maxRevenue = useMemo(
    () => maxOrOne(revenuePoints.map((point) => Number(point.revenue) || 0)),
    [revenuePoints],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenSurface style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
            paddingBottom: 32 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Business Insights</Text>
            <Text style={styles.subtitle}>
              Revenue trend and health indicators
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.downloadBtn,
              downloading && styles.downloadBtnDisabled,
            ]}
            onPress={downloadPDF}
            disabled={downloading}
            accessibilityRole="button"
            accessibilityLabel="Export insights"
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#374151" />
            ) : (
              <Ionicons name="download-outline" size={20} color="#374151" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, styles.kpiCardPrimary]}>
            <Text style={styles.kpiLabel}>Total Revenue</Text>
            <Text style={[styles.kpiValue, styles.kpiValuePrimary]}>
              ₹{(stats?.totalRevenue || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Orders</Text>
            <Text style={styles.kpiValue}>{stats?.totalOrders || 0}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Delivered</Text>
            <Text style={styles.kpiValue}>{stats?.deliveredOrders || 0}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Trust Score</Text>
            <Text style={styles.kpiValue}>{stats?.trustScore || 0}%</Text>
          </View>
        </View>

        <View style={styles.revenueSection}>
          <Text style={styles.chartTitle}>Revenue (Last 6 periods)</Text>
          {revenuePoints.length === 0 ? (
            <View style={styles.emptyStateWrap}>
              <Ionicons
                name="bar-chart-outline"
                size={50}
                color={colors.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No revenue data</Text>
              <Text style={styles.emptySubtitle}>
                Start selling to see insights
              </Text>
              <TouchableOpacity
                style={styles.emptyCtaButton}
                onPress={() => navigation.navigate("ProductUpload")}
              >
                <Text style={styles.emptyCtaText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.barsWrap}>
              {revenuePoints.map((point) => {
                const ratio = (Number(point.revenue) || 0) / maxRevenue;
                return (
                  <View key={point.label} style={styles.barItem}>
                    <View
                      style={[
                        styles.bar,
                        { height: Math.max(14, Math.round(120 * ratio)) },
                      ]}
                    />
                    <Text numberOfLines={1} style={styles.barValue}>
                      ₹{Number(point.revenue || 0).toLocaleString()}
                    </Text>
                    <Text style={styles.barLabel}>{point.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
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
  content: {
    backgroundColor: "#F9FAFB",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 0,
  },
  downloadBtn: {
    width: 38,
    height: 38,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadBtnDisabled: {
    opacity: 0.6,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  kpiCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiCardPrimary: {
    backgroundColor: "#F8FBFF",
  },
  kpiLabel: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 12,
  },
  kpiValue: {
    marginTop: 4,
    color: "#111827",
    fontWeight: "700",
    fontSize: 20,
  },
  kpiValuePrimary: {
    fontSize: 22,
    color: "#007AFF",
  },
  revenueSection: {
    marginTop: 16,
  },
  chartTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  barsWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 170,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 3,
  },
  bar: {
    width: "85%",
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  barValue: {
    marginTop: 6,
    fontSize: 10,
    color: colors.textSecondary,
  },
  barLabel: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  emptyStateWrap: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyIcon: {
    opacity: 0.3,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyCtaButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  emptyCtaText: {
    color: "#007AFF",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default InsightsScreen;
