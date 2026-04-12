import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import api from "../../api/config";
import { useAppAlert } from "../../context/AlertContext";
import { useWishlist } from "../../context/WishlistContext";
import ScreenSurface from "../../components/ScreenSurface";

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, userToken, logout, updateUser } = useAuth();
  const { showAlert } = useAppAlert();
  const { wishlistCount } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [deleteOtpModalVisible, setDeleteOtpModalVisible] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteOtpRetryIn, setDeleteOtpRetryIn] = useState(0);
  const [sendingDeleteOtp, setSendingDeleteOtp] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    setEditName(user?.name || "");
  }, [user?.name]);

  useEffect(() => {
    fetchOrders();
    fetchAddresses();
  }, [userToken]);

  useEffect(() => {
    if (deleteOtpRetryIn <= 0) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setDeleteOtpRetryIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [deleteOtpRetryIn]);

  const fetchOrders = async () => {
    if (!userToken) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    try {
      setLoadingOrders(true);
      const { data } = await api.get("/orders/my-orders");
      setOrders(data?.slice(0, 3) || []);
    } catch (error) {
      if (error?.response?.status === 401) {
        setOrders([]);
        return;
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    if (!userToken) {
      setSavedAddresses([]);
      return;
    }

    try {
      const { data } = await api.get("/auth/addresses");
      const mapped = (Array.isArray(data) ? data : []).map((item, index) => ({
        id: item._id || index + 1,
        label: item.label || "Address",
        address: `${item.street}, ${item.city}, ${item.state} - ${item.pincode}`,
        isDefault: !!item.isDefault,
      }));
      setSavedAddresses(mapped);
    } catch (error) {
      if (error?.response?.status === 401) {
        setSavedAddresses([]);
      }
    }
  };

  const sendDeleteOtp = async () => {
    try {
      setSendingDeleteOtp(true);
      const { data } = await api.post("/auth/me/delete/send-otp");

      showAlert({
        title: "OTP Sent",
        message: data?.message || "A deletion OTP has been sent to your email.",
        type: "success",
      });
    } catch (error) {
      const retryAfter = Number(error?.response?.data?.retryAfter || 0);
      if (retryAfter > 0) {
        setDeleteOtpRetryIn(retryAfter);
      }

      showAlert({
        title: "Error",
        message:
          error?.response?.data?.message ||
          "Failed to send account deletion OTP",
        type: "error",
      });
    } finally {
      setSendingDeleteOtp(false);
    }
  };

  const confirmDeleteAccountWithOtp = async () => {
    const normalizedOtp = String(deleteOtp || "").trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      showAlert({
        title: "Invalid OTP",
        message: "Please enter a valid 6-digit OTP.",
        type: "error",
      });
      return;
    }

    try {
      setDeletingAccount(true);
      await api.post("/auth/me/delete/confirm", { otp: normalizedOtp });
      await logout();
      setDeleteOtpModalVisible(false);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });

      showAlert({
        title: "Deleted",
        message: "Your account has been deleted.",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Error",
        message: error?.response?.data?.message || "Failed to delete account",
        type: "error",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent. We will send an OTP to your email to confirm deletion.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: async () => {
            setDeleteOtp("");
            setDeleteOtpRetryIn(0);
            setDeleteOtpModalVisible(true);
            await sendDeleteOtp();
          },
        },
      ],
    );
  };

  const handleUpdateProfile = async () => {
    try {
      const { data } = await api.put(`/auth/profile`, {
        name: String(editName || "").trim(),
      });
      await updateUser({
        _id: data?._id,
        name: data?.name,
        email: data?.email,
        role: data?.role,
        phone: data?.phone,
        address: data?.address,
      });
      setEditName(data?.name || editName);
      showAlert({
        title: "Success",
        message: "Profile updated!",
        type: "success",
      });
      setEditModalVisible(false);
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Failed to update profile",
        type: "error",
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Log Out",
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
        style: "destructive",
      },
    ]);
  };

  const OrderItem = ({ order }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>
            Order #{order._id?.slice(-6) || "N/A"}
          </Text>
          <Text style={styles.orderDate}>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : "Recently"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                order.status === "delivered" ? colors.success : colors.warning,
            },
          ]}
        >
          <Text style={styles.statusText}>{order.status || "pending"}</Text>
        </View>
      </View>
      <Text style={styles.orderTotal}>₹{order.totalAmount || 0}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenSurface style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate("Info", { type: "settings" })}
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 80 + insets.bottom },
          ]}
        >
          {/* Profile Hero Card */}
          <View style={styles.profileHero}>
            <View style={styles.profileHeaderRow}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0) || "U"}
                </Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.name || "User"}</Text>
                <Text style={styles.userEmail}>
                  {user?.email || "user@example.com"}
                </Text>
                <View style={styles.verificationBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#059669" />
                  <Text style={styles.verificationText}>Verified Account</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => setEditModalVisible(true)}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{orders.length}</Text>
              <Text style={styles.statLabel}>Purchases</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{wishlistCount}</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Items</Text>
            <MenuItem
              icon="heart-outline"
              label="My Wishlist"
              onPress={() => navigation.navigate("Wishlist")}
              trailing={
                <View style={styles.wishlistTrailing}>
                  <Text style={styles.wishlistCount}>{wishlistCount}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              }
            />
          </View>

          {/* Recent Orders */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("OrderTracking")}
              >
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {loadingOrders ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : orders.length > 0 ? (
              <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <OrderItem order={item} />}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="bag-outline" size={32} color="#CBD5E1" />
                <Text style={styles.emptytext}>No orders yet</Text>
              </View>
            )}
          </View>

          {/* Saved Addresses */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Addresses</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Addresses")}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={savedAddresses}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.addressCard}
                  onPress={() => navigation.navigate("Addresses")}
                >
                  <View style={styles.addressIcon}>
                    <Ionicons
                      name={item.label === "Home" ? "home" : "briefcase"}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.addressInfo}>
                    <View style={styles.addressLabel}>
                      <Text style={styles.addressTitle}>{item.label}</Text>
                      {item.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {item.address}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              onPress={() => setNotifications(!notifications)}
              trailing={
                <View style={styles.switchWrap}>
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                  />
                </View>
              }
            />

            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy & Security"
              onPress={() => navigation.navigate("PrivacyPolicy")}
              trailing={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />

            <MenuItem
              icon="document-text-outline"
              label="Terms & Conditions"
              onPress={() => navigation.navigate("Terms")}
              trailing={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />

            <MenuItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => navigation.navigate("HelpCenter")}
              trailing={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />
          </View>

          {/* Payment & Billing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment & Billing</Text>

            <MenuItem
              icon="alert-circle-outline"
              label="Refund Disputes"
              onPress={() => navigation.navigate("Refunds")}
              trailing={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />

            <MenuItem
              icon="card-outline"
              label="Payment Methods"
              onPress={() => navigation.navigate("PaymentMethods")}
              trailing={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />

            <MenuItem
              icon="receipt-outline"
              label="Billing History"
              onPress={() => navigation.navigate("BillingHistory")}
              trailing={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Account</Text>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>App Version 1.0.0</Text>
          </View>
        </ScrollView>

        {/* Edit Profile Modal */}
        <Modal
          visible={editModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={28} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <View style={{ width: 28 }} />
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.inputPlaceholder}
                />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.modalInput, styles.disabledInput]}
                  value={user?.email}
                  editable={false}
                  placeholder="Email cannot be changed"
                  placeholderTextColor={colors.inputPlaceholder}
                />

                <Button
                  title="Save Changes"
                  onPress={handleUpdateProfile}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={deleteOtpModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setDeleteOtpModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setDeleteOtpModalVisible(false)}
                >
                  <Ionicons name="close" size={28} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Delete Account OTP</Text>
                <View style={{ width: 28 }} />
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.deleteOtpInfoText}>
                  Enter the 6-digit OTP sent to your email to confirm permanent
                  account deletion.
                </Text>

                <Text style={styles.inputLabel}>OTP</Text>
                <TextInput
                  style={styles.modalInput}
                  value={deleteOtp}
                  onChangeText={setDeleteOtp}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor={colors.inputPlaceholder}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                <Button
                  title={deletingAccount ? "Deleting..." : "Confirm Delete"}
                  onPress={confirmDeleteAccountWithOtp}
                  style={styles.modalButton}
                  disabled={deletingAccount || sendingDeleteOtp}
                />

                <Button
                  title={
                    deleteOtpRetryIn > 0
                      ? `Resend OTP in ${deleteOtpRetryIn}s`
                      : sendingDeleteOtp
                        ? "Sending OTP..."
                        : "Resend OTP"
                  }
                  type="secondary"
                  onPress={sendDeleteOtp}
                  style={styles.resendButton}
                  disabled={sendingDeleteOtp || deleteOtpRetryIn > 0}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenSurface>
  );
};

const MenuItem = ({ icon, label, onPress, trailing }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={19} color={colors.primary} />
    <Text style={styles.menuText}>{label}</Text>
    {trailing}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  profileHero: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  verificationText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
    marginLeft: 4,
  },
  editProfileBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  editBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  seeAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingVertical: 14,
    paddingHorizontal: 0,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  wishlistTrailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wishlistCount: {
    minWidth: 26,
    textAlign: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  switchWrap: {
    transform: [{ scale: 0.9 }],
  },
  logoutBtn: {
    paddingVertical: 12,
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "600",
  },
  deleteBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  orderDate: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.white,
    textTransform: "capitalize",
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 0,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  defaultBadge: {
    marginLeft: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: "600",
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 16,
    opacity: 0.75,
  },
  emptytext: {
    marginTop: 8,
    fontSize: 13,
    color: "#6B7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
    backgroundColor: colors.inputBackground,
  },
  disabledInput: {
    backgroundColor: colors.lightBackground,
    opacity: 0.6,
  },
  modalButton: {
    marginTop: 8,
  },
  resendButton: {
    marginTop: 6,
  },
  deleteOtpInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ProfileScreen;
