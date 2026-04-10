import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenSurface from "../../components/ScreenSurface";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/config";

const VALID_SECTIONS = ["password", "twoFactor", "activity"];

const SellerSecurityScreen = ({ route }) => {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [updating2fa, setUpdating2fa] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [securityInfo, setSecurityInfo] = useState(null);
  const requestedSection = String(route?.params?.section || "password");
  const [activeSection, setActiveSection] = useState(
    VALID_SECTIONS.includes(requestedSection) ? requestedSection : "password",
  );

  useEffect(() => {
    if (VALID_SECTIONS.includes(requestedSection)) {
      setActiveSection(requestedSection);
    }
  }, [requestedSection]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/seller/me/security");
        setSecurityInfo(data || null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleTwoFactor = async (enabled) => {
    try {
      setUpdating2fa(true);
      const { data } = await api.put("/seller/me/security/2fa", { enabled });
      setSecurityInfo((prev) => ({
        ...(prev || {}),
        twoFactorEnabled: Boolean(data?.twoFactorEnabled),
      }));
    } catch (error) {
      Alert.alert(
        "Update Failed",
        error?.response?.data?.message || "Could not update 2FA setting.",
      );
    } finally {
      setUpdating2fa(false);
    }
  };

  const sendOtp = async () => {
    const email = user?.email;

    if (!email) {
      Alert.alert(
        "Missing Email",
        "No account email is available for this user.",
      );
      return;
    }

    try {
      setSendingOtp(true);
      const { data } = await api.post("/auth/forgot-password/send-otp", {
        email,
      });
      Alert.alert(
        "OTP Sent",
        data?.message || "A reset OTP was sent to your email.",
      );
    } catch (error) {
      Alert.alert(
        "OTP Failed",
        error?.response?.data?.message || "Could not send OTP right now.",
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const resetPassword = async () => {
    const email = user?.email;

    if (!email) {
      Alert.alert(
        "Missing Email",
        "No account email is available for this user.",
      );
      return;
    }

    if (!otp.trim()) {
      Alert.alert("OTP Required", "Enter the OTP sent to your email.");
      return;
    }

    if (newPassword.trim().length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters.");
      return;
    }

    try {
      setResetting(true);
      const { data } = await api.post("/auth/forgot-password/reset", {
        email,
        otp: otp.trim(),
        newPassword: newPassword.trim(),
      });

      setOtp("");
      setNewPassword("");
      if (typeof updateUser === "function") {
        await updateUser({ updatedAt: new Date().toISOString() });
      }

      Alert.alert(
        "Password Updated",
        data?.message || "Your password was reset successfully.",
      );
    } catch (error) {
      Alert.alert(
        "Reset Failed",
        error?.response?.data?.message || "Could not reset password.",
      );
    } finally {
      setResetting(false);
    }
  };

  const lastLoginLabel = securityInfo?.lastLoginAt
    ? new Date(securityInfo.lastLoginAt).toLocaleString("en-IN")
    : "Not available";
  const createdAtLabel = securityInfo?.createdAt
    ? new Date(securityInfo.createdAt).toLocaleDateString("en-IN")
    : "Not available";
  const updatedAtLabel = securityInfo?.updatedAt
    ? new Date(securityInfo.updatedAt).toLocaleString("en-IN")
    : "Not available";

  return (
    <ScreenSurface style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
      >
        <Text style={styles.title}>Security & Access</Text>
        <Text style={styles.subtitle}>
          Manage your password and account safety
        </Text>

        <View style={styles.sectionTabs}>
          {VALID_SECTIONS.map((section) => (
            <TouchableOpacity
              key={section}
              style={[
                styles.sectionTab,
                activeSection === section && styles.sectionTabActive,
              ]}
              onPress={() => setActiveSection(section)}
            >
              <Text
                style={[
                  styles.sectionTabText,
                  activeSection === section && styles.sectionTabTextActive,
                ]}
              >
                {section === "twoFactor"
                  ? "2FA"
                  : section === "activity"
                    ? "Activity"
                    : "Password"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator
            size="small"
            color="#007AFF"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <>
            {activeSection === "password" && (
              <View style={styles.listCard}>
                <Text style={styles.itemTitle}>Reset Password</Text>
                <Text style={styles.itemSubtitle}>
                  Request an OTP and set a new password for your account
                </Text>

                <Text style={styles.label}>OTP</Text>
                <TextInput
                  style={[styles.input, resetting && styles.inputDisabled]}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter OTP"
                  keyboardType="number-pad"
                  editable={!resetting}
                  maxLength={6}
                />

                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={[styles.input, resetting && styles.inputDisabled]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Minimum 8 characters"
                  secureTextEntry
                  editable={!resetting}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={sendOtp}
                    disabled={sendingOtp}
                  >
                    <Text style={styles.secondaryBtnText}>
                      {sendingOtp ? "Sending..." : "Send OTP"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={resetPassword}
                    disabled={resetting}
                  >
                    <Text style={styles.primaryBtnText}>
                      {resetting ? "Resetting..." : "Reset Password"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeSection === "twoFactor" && (
              <View style={styles.listCard}>
                <View style={styles.itemNoBorder}>
                  <View style={styles.itemLeft}>
                    <View style={styles.iconWrap}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={18}
                        color="#007AFF"
                      />
                    </View>
                    <View>
                      <Text style={styles.itemTitle}>Enable 2FA</Text>
                      <Text style={styles.itemSubtitle}>
                        Enable extra login protection
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={Boolean(securityInfo?.twoFactorEnabled)}
                    onValueChange={toggleTwoFactor}
                    disabled={updating2fa}
                    trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                    thumbColor="#007AFF"
                  />
                </View>
              </View>
            )}

            {activeSection === "activity" && (
              <View style={styles.listCard}>
                <View style={styles.itemNoBorder}>
                  <View style={styles.itemLeft}>
                    <View style={styles.iconWrap}>
                      <Ionicons name="time-outline" size={18} color="#007AFF" />
                    </View>
                    <View>
                      <Text style={styles.itemTitle}>Login Activity</Text>
                      <Text style={styles.itemSubtitle}>
                        Last login: {lastLoginLabel}
                      </Text>
                      <Text style={styles.itemSubtitle}>
                        Account created: {createdAtLabel}
                      </Text>
                      <Text style={styles.itemSubtitle}>
                        Last profile update: {updatedAtLabel}
                      </Text>
                      {(securityInfo?.loginActivity || [])
                        .slice(0, 2)
                        .map((entry, idx) => (
                          <Text
                            key={`${entry?.timestamp || idx}`}
                            style={styles.itemSubtitle}
                          >
                            {new Date(
                              entry?.timestamp || Date.now(),
                            ).toLocaleString("en-IN")}{" "}
                            � {entry?.ip || "unknown IP"}
                          </Text>
                        ))}
                    </View>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 14, color: "#6B7280" },
  sectionTabs: {
    marginTop: 14,
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    padding: 4,
  },
  sectionTab: {
    flex: 1,
    borderRadius: 8,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTabActive: {
    backgroundColor: "#FFFFFF",
  },
  sectionTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  sectionTabTextActive: {
    color: "#111827",
  },
  listCard: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  itemNoBorder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  itemTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  itemSubtitle: { marginTop: 2, fontSize: 12, color: "#6B7280" },
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
  },
  inputDisabled: {
    opacity: 0.75,
  },
  buttonRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondaryBtn: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 10,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryBtnText: {
    color: "#007AFF",
    fontSize: 13,
    fontWeight: "600",
  },
  primaryBtn: {
    width: "48%",
    borderRadius: 10,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default SellerSecurityScreen;
