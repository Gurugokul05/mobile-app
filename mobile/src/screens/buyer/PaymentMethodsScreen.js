import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import api from "../../api/config";
import { colors } from "../../theme/colors";
import { useAppAlert } from "../../context/AlertContext";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const initialForm = {
  type: "upi",
  label: "UPI",
  details: "",
  isDefault: false,
};

const PaymentMethodsScreen = ({ navigation }) => {
  const { showAlert } = useAppAlert();
  const insets = useSafeAreaInsets();
  const [methods, setMethods] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(initialForm);

  const fetchMethods = async () => {
    try {
      const { data } = await api.get("/auth/payment-methods");
      setMethods(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert({
        title: "Error",
        message:
          error.response?.data?.message || "Unable to load payment methods",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleAdd = async () => {
    if (!form.label || !form.details) {
      showAlert({
        title: "Validation",
        message: "Fill all fields",
        type: "warning",
      });
      return;
    }
    try {
      const { data } = await api.post("/auth/payment-methods", form);
      setMethods(Array.isArray(data) ? data : []);
      setModalVisible(false);
      setForm(initialForm);
      showAlert({
        title: "Saved",
        message: "Payment method added",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to add payment method",
        type: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await api.delete(`/auth/payment-methods/${id}`);
      setMethods(Array.isArray(data) ? data : []);
      showAlert({
        title: "Deleted",
        message: "Payment method removed",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to delete payment method",
        type: "error",
      });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.label}</Text>
        <Text style={styles.details}>{item.details}</Text>
        {item.isDefault ? <Text style={styles.default}>Default</Text> : null}
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id)}>
        <Ionicons name="trash-outline" size={22} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenSurface style={styles.container}>
      <ScreenHeader title="Payment Methods" navigation={navigation} />
      <Button
        title="Add Payment Method"
        onPress={() => setModalVisible(true)}
        style={styles.addBtn}
      />

      <FlatList
        data={methods}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 32 + insets.bottom },
        ]}
        ListEmptyComponent={
          <Text style={styles.empty}>No saved payment methods.</Text>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Payment Method</Text>

            <TextInput
              style={styles.input}
              placeholder="Label (UPI/Card)"
              value={form.label}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, label: value }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Details (e.g. demo@upi or XXXX-1234)"
              value={form.details}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, details: value }))
              }
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Set as default</Text>
              <Switch
                value={form.isDefault}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, isDefault: value }))
                }
              />
            </View>

            <Button title="Save" onPress={handleAdd} />
            <Button
              title="Cancel"
              type="secondary"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  addBtn: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    borderRadius: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  details: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  default: {
    marginTop: 6,
    color: colors.success,
    fontWeight: "700",
    fontSize: 12,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: colors.textPrimary,
    backgroundColor: colors.inputBackground,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  switchLabel: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
});

export default PaymentMethodsScreen;
