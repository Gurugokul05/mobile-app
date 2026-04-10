import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import Button from "../../components/Button";
import { AuthContext } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/config";
import ScreenSurface from "../../components/ScreenSurface";

const ACTION_COLOR = "#007AFF";

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/seller/me/stats");
      setStats(data || null);
    } catch (error) {
      console.log(
        "Seller stats fetch error:",
        error?.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const KPI = ({ label, value, icon }) => (
    <View style={styles.kpiCard}>
      <View style={styles.kpiIconWrap}>
        <Ionicons name={icon} size={18} color={ACTION_COLOR} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );

  const quickActions = [
    {
      key: "inventory",
      icon: "cube-outline",
      title: "Inventory",
      subtitle: "Manage products",
      onPress: () => navigation.navigate("Products"),
    },
    {
      key: "fulfillment",
      icon: "receipt-outline",
      title: "Fulfillment",
      subtitle: "Process incoming orders",
      onPress: () => navigation.navigate("Orders"),
    },
    {
      key: "insights",
      icon: "stats-chart-outline",
      title: "Insights",
      subtitle: "Revenue and trends",
      onPress: () => navigation.navigate("Insights"),
    },
  ];

  return (
    <ScreenSurface style={styles.safeArea}>
      <StatusBar translucent={false} barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 80 + insets.bottom,
        }}
      >
        <View style={styles.hero}>
          <View>
            <Text style={styles.header}>Seller Command Center</Text>
            <Text style={styles.heroSub}>
              Track revenue, orders, and inventory from one place.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate("SellerProfile")}
            accessibilityRole="button"
            accessibilityLabel="Open seller profile"
          >
            <Ionicons name="settings-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {!user?.isVerified && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Verification Needed</Text>
            <Text style={styles.warningText}>
              Please complete onboarding to start selling.
            </Text>
            <Button
              title="Complete Onboarding"
              onPress={() => navigation.navigate("SellerOnboarding")}
              style={{ marginTop: 12 }}
            />
          </View>
        )}

        {user?.isVerified && (
          <>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginVertical: 20 }}
              />
            ) : (
              <View style={styles.kpiGrid}>
                <KPI
                  icon="shield-checkmark-outline"
                  label="Trust"
                  value={`${stats?.trustScore || user?.trustScore || 0}%`}
                />
                <KPI
                  icon="receipt-outline"
                  label="Orders"
                  value={stats?.totalOrders || 0}
                />
                <KPI
                  icon="cube-outline"
                  label="Products"
                  value={stats?.totalProducts || 0}
                />
                <KPI
                  icon="cash-outline"
                  label="Revenue"
                  value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
                />
              </View>
            )}

            <View style={styles.quickActions}>
              {quickActions.map((action, index) => (
                <View key={action.key}>
                  <TouchableOpacity
                    style={styles.quickActionItem}
                    onPress={action.onPress}
                  >
                    <View style={styles.quickActionLeft}>
                      <View style={styles.quickActionIconWrap}>
                        <Ionicons
                          name={action.icon}
                          size={18}
                          color={ACTION_COLOR}
                        />
                      </View>
                      <View>
                        <Text style={styles.quickActionTitle}>
                          {action.title}
                        </Text>
                        <Text style={styles.quickActionSub}>
                          {action.subtitle}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                  {index !== quickActions.length - 1 && (
                    <View style={styles.quickActionDivider} />
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => navigation.navigate("ProductUpload")}
            >
              <Text style={styles.primaryActionText}>Add New Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => navigation.navigate("Orders")}
            >
              <Text style={styles.secondaryActionText}>
                Manage Orders & Packing
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingBottom: 20,
  },
  hero: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  heroSub: {
    marginTop: 2,
    color: "#6B7280",
    fontSize: 14,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  warningCard: {
    backgroundColor: colors.errorLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.errorDark,
    marginBottom: 8,
  },
  warningText: {
    color: colors.errorVeryDark,
    fontSize: 14,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  kpiCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  kpiLabel: {
    marginTop: 1,
    fontSize: 12,
    color: "#6B7280",
  },
  quickActions: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  quickActionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  quickActionDivider: {
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    marginVertical: 4,
  },
  quickActionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  quickActionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  quickActionTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  quickActionSub: {
    marginTop: 2,
    color: "#6B7280",
    fontSize: 12,
  },
  primaryActionButton: {
    marginTop: 20,
    backgroundColor: ACTION_COLOR,
    borderRadius: 12,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryActionButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: ACTION_COLOR,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryActionText: {
    color: ACTION_COLOR,
    fontSize: 15,
    fontWeight: "700",
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

export default DashboardScreen;
