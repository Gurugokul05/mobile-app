import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import Button from "../components/Button";
import { AuthContext } from "../context/AuthContext";
import { useAppAlert } from "../context/AlertContext";
import ScreenSurface from "../components/ScreenSurface";

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sendingResetOtp, setSendingResetOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [twoFactorVisible, setTwoFactorVisible] = useState(false);
  const [twoFactorSessionId, setTwoFactorSessionId] = useState("");
  const [twoFactorOtp, setTwoFactorOtp] = useState("");
  const [twoFactorCooldown, setTwoFactorCooldown] = useState(0);
  const [twoFactorVerifying, setTwoFactorVerifying] = useState(false);
  const [twoFactorResending, setTwoFactorResending] = useState(false);
  const [twoFactorEmailMasked, setTwoFactorEmailMasked] = useState("");
  const {
    login,
    sendForgotPasswordOtp,
    resetPasswordWithOtp,
    verifyLoginTwoFactorOtp,
    resendLoginTwoFactorOtp,
  } = useContext(AuthContext);
  const { showAlert } = useAppAlert();

  useEffect(() => {
    if (!otpCooldown) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  useEffect(() => {
    if (!twoFactorCooldown) return;
    const timer = setInterval(() => {
      setTwoFactorCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [twoFactorCooldown]);

  const routeByRole = (signedInUser) => {
    if (signedInUser?.role === "buyer") {
      navigation.replace("BuyerHome");
    } else {
      navigation.replace("SellerHome");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({
        title: "Validation Error",
        message: "Please enter both email and password.",
        type: "warning",
      });
      return;
    }

    try {
      const user = await login(email, password);
      if (user?.requiresTwoFactor) {
        setTwoFactorVisible(true);
        setTwoFactorSessionId(user.twoFactorSessionId || "");
        setTwoFactorEmailMasked(user.emailMasked || "");
        setTwoFactorOtp("");
        setTwoFactorCooldown(30);
        showAlert({
          title: "Verify Login",
          message:
            user?.message || "Enter the OTP sent to your email to continue.",
          type: "info",
        });
        return;
      }

      routeByRole(user);
    } catch (error) {
      showAlert({
        title: "Login Error",
        message: error?.toString() || "Something went wrong",
        type: "error",
      });
    }
  };

  const openForgotPasswordModal = () => {
    setForgotEmail(email);
    setForgotModalVisible(true);
  };

  const handleSendForgotOtp = async () => {
    if (!forgotEmail) {
      showAlert({
        title: "Validation Error",
        message: "Please enter your registered email.",
        type: "warning",
      });
      return;
    }

    try {
      setSendingResetOtp(true);
      await sendForgotPasswordOtp(forgotEmail);
      setOtpCooldown(30);
      showAlert({
        title: "OTP Sent",
        message: "Password reset OTP has been sent to your email.",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "OTP Error",
        message: error?.toString() || "Failed to send OTP",
        type: "error",
      });
    } finally {
      setSendingResetOtp(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotEmail || !forgotOtp || !newPassword || !confirmPassword) {
      showAlert({
        title: "Validation Error",
        message: "Please fill all reset password fields.",
        type: "warning",
      });
      return;
    }

    if (newPassword.length < 6) {
      showAlert({
        title: "Validation Error",
        message: "Password must be at least 6 characters.",
        type: "warning",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert({
        title: "Validation Error",
        message: "Passwords do not match.",
        type: "warning",
      });
      return;
    }

    try {
      setResettingPassword(true);
      await resetPasswordWithOtp(forgotEmail, forgotOtp, newPassword);
      showAlert({
        title: "Success",
        message: "Password updated. Please login with your new password.",
        type: "success",
      });
      setForgotModalVisible(false);
      setForgotOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showAlert({
        title: "Reset Failed",
        message: error?.toString() || "Failed to reset password",
        type: "error",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    if (!twoFactorSessionId || !/^\d{6}$/.test(twoFactorOtp)) {
      showAlert({
        title: "Validation Error",
        message: "Enter the 6-digit OTP sent to your email.",
        type: "warning",
      });
      return;
    }

    try {
      setTwoFactorVerifying(true);
      const user = await verifyLoginTwoFactorOtp(
        twoFactorSessionId,
        twoFactorOtp,
      );
      setTwoFactorVisible(false);
      setTwoFactorSessionId("");
      setTwoFactorOtp("");
      routeByRole(user);
    } catch (error) {
      showAlert({
        title: "OTP Error",
        message: error?.toString() || "Failed to verify OTP",
        type: "error",
      });
    } finally {
      setTwoFactorVerifying(false);
    }
  };

  const handleResendTwoFactorOtp = async () => {
    if (!twoFactorSessionId) {
      showAlert({
        title: "Session Expired",
        message: "Please login again to request a new OTP.",
        type: "warning",
      });
      setTwoFactorVisible(false);
      return;
    }

    try {
      setTwoFactorResending(true);
      await resendLoginTwoFactorOtp(twoFactorSessionId);
      setTwoFactorCooldown(30);
      showAlert({
        title: "OTP Sent",
        message: "A new OTP has been sent to your email.",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Resend Failed",
        message: error?.toString() || "Failed to resend OTP",
        type: "error",
      });
    } finally {
      setTwoFactorResending(false);
    }
  };

  return (
    <ScreenSurface style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="leaf" size={40} color={colors.primary} />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to discover authentic local products
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Pressable
              style={styles.forgotPassword}
              onPress={openForgotPasswordModal}
              onPressIn={openForgotPasswordModal}
              hitSlop={10}
              accessibilityRole="button"
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            <Button
              title="Sign In"
              onPress={handleLogin}
              style={styles.loginButton}
            />
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>New to Roots? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.footerAction}>Create an Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={forgotModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter your email, verify OTP, and set a new password.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Registered email"
              placeholderTextColor={colors.inputPlaceholder}
              value={forgotEmail}
              onChangeText={setForgotEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TouchableOpacity
              style={[
                styles.sendOtpBtn,
                (sendingResetOtp || otpCooldown > 0) &&
                  styles.sendOtpBtnDisabled,
              ]}
              onPress={handleSendForgotOtp}
              disabled={sendingResetOtp || otpCooldown > 0}
            >
              <Text style={styles.sendOtpBtnText}>
                {sendingResetOtp
                  ? "Sending..."
                  : otpCooldown > 0
                    ? `Resend in ${otpCooldown}s`
                    : "Send OTP"}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter OTP"
              placeholderTextColor={colors.inputPlaceholder}
              value={forgotOtp}
              onChangeText={setForgotOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="New password"
              placeholderTextColor={colors.inputPlaceholder}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Confirm new password"
              placeholderTextColor={colors.inputPlaceholder}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => setForgotModalVisible(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={handleResetPassword}
                disabled={resettingPassword}
              >
                <Text style={styles.modalBtnPrimaryText}>
                  {resettingPassword ? "Resetting..." : "Reset Password"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={twoFactorVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTwoFactorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Two-Factor Verification</Text>
            <Text style={styles.modalSubtitle}>
              Enter the OTP sent to {twoFactorEmailMasked || "your email"} to
              complete sign in.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor={colors.inputPlaceholder}
              value={twoFactorOtp}
              onChangeText={setTwoFactorOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity
              style={[
                styles.sendOtpBtn,
                (twoFactorResending || twoFactorCooldown > 0) &&
                  styles.sendOtpBtnDisabled,
              ]}
              onPress={handleResendTwoFactorOtp}
              disabled={twoFactorResending || twoFactorCooldown > 0}
            >
              <Text style={styles.sendOtpBtnText}>
                {twoFactorResending
                  ? "Sending..."
                  : twoFactorCooldown > 0
                    ? `Resend in ${twoFactorCooldown}s`
                    : "Resend OTP"}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => setTwoFactorVisible(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={handleVerifyTwoFactor}
                disabled={twoFactorVerifying}
              >
                <Text style={styles.modalBtnPrimaryText}>
                  {twoFactorVerifying ? "Verifying..." : "Verify"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: "flex-start",
  },
  iconContainer: {
    backgroundColor: colors.lightBackground,
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "400",
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  loginButton: {
    height: 56,
    borderRadius: 14,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  footerAction: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  modalSubtitle: {
    marginTop: 6,
    marginBottom: 14,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    color: colors.textPrimary,
    backgroundColor: colors.inputBackground,
  },
  sendOtpBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.lightBackground,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  sendOtpBtnDisabled: {
    opacity: 0.65,
  },
  sendOtpBtnText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  modalBtnPrimary: {
    backgroundColor: colors.primary,
  },
  modalBtnSecondary: {
    backgroundColor: colors.lightBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBtnPrimaryText: {
    color: colors.white,
    fontWeight: "700",
  },
  modalBtnSecondaryText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
});

export default LoginScreen;
