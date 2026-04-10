import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { AuthContext } from "../context/AuthContext";
import { useAppAlert } from "../context/AlertContext";
import { colors } from "../theme/colors";
import ScreenSurface from "../components/ScreenSurface";

const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [role, setRole] = useState("buyer"); // 'buyer' or 'seller'
  const { sendRegisterOtp, registerWithOtp } = useContext(AuthContext);
  const { showAlert } = useAppAlert();

  useEffect(() => {
    if (!otpCooldown) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    if (!email) {
      showAlert({
        title: "Validation Error",
        message: "Please enter email first.",
        type: "warning",
      });
      return;
    }

    try {
      setSendingOtp(true);
      const data = await sendRegisterOtp(email);
      setOtpSent(true);
      setOtp("");
      setOtpCooldown(Number(data?.retryAfter || 30));

      showAlert({
        title: "OTP Sent",
        message: data?.devOtp
          ? `OTP sent. Dev OTP: ${data.devOtp}`
          : "OTP sent to your email.",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "OTP Error",
        message: error?.toString() || "Failed to send OTP",
        type: "error",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !otp) {
      showAlert({
        title: "Validation Error",
        message: "Please fill in all fields including OTP.",
        type: "warning",
      });
      return;
    }

    if (!otpSent) {
      showAlert({
        title: "OTP Required",
        message: "Please send OTP first.",
        type: "warning",
      });
      return;
    }

    try {
      const user = await registerWithOtp(name, email, password, role, otp);
      if (user.role === "buyer") {
        navigation.replace("BuyerHome");
      } else {
        navigation.replace("SellerHome");
      }
    } catch (error) {
      showAlert({
        title: "Registration Error",
        message: error?.toString() || "Something went wrong",
        type: "error",
      });
    }
  };

  return (
    <ScreenSurface style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 80 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Roots to explore or sell premium products
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

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
              <TouchableOpacity
                style={[
                  styles.otpSendBtn,
                  (sendingOtp || otpCooldown > 0) && styles.otpSendBtnDisabled,
                ]}
                onPress={handleSendOtp}
                disabled={sendingOtp || otpCooldown > 0}
              >
                <Text style={styles.otpSendText}>
                  {sendingOtp
                    ? "Sending..."
                    : otpCooldown > 0
                      ? `Resend in ${otpCooldown}s`
                      : otpSent
                        ? "Resend OTP"
                        : "Send OTP"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>OTP</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>I want to...</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    role === "buyer" && styles.roleBtnActive,
                  ]}
                  onPress={() => setRole("buyer")}
                >
                  <Ionicons
                    name="bag-handle-outline"
                    size={20}
                    color={
                      role === "buyer" ? colors.primary : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === "buyer" && styles.roleTextActive,
                    ]}
                  >
                    Buy products
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    role === "seller" && styles.roleBtnActive,
                  ]}
                  onPress={() => setRole("seller")}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={20}
                    color={
                      role === "seller" ? colors.primary : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === "seller" && styles.roleTextActive,
                    ]}
                  >
                    Sell products
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              style={styles.registerButton}
            />
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerAction}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingVertical: 20,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 36,
    alignItems: "flex-start",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
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
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.inputBackground,
  },
  roleBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.lightBackground,
  },
  roleText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  roleTextActive: {
    color: colors.primary,
  },
  registerButton: {
    height: 56,
    borderRadius: 14,
    marginTop: 12,
  },
  otpSendBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: colors.lightBackground,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  otpSendBtnDisabled: {
    opacity: 0.65,
  },
  otpSendText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
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
});

export default RegisterScreen;
