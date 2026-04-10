import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import api from "../../api/config";
import { colors } from "../../theme/colors";
import { useAppAlert } from "../../context/AlertContext";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const emptyForm = {
  label: "Home",
  street: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const AddressesScreen = () => {
  const { showAlert } = useAppAlert();
  const [addresses, setAddresses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const insets = useSafeAreaInsets();

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get("/auth/addresses");
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert({
        title: "Error",
        message: error.response?.data?.message || "Unable to load addresses",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAdd = async () => {
    if (!form.street || !form.city || !form.state || !form.pincode) {
      showAlert({
        title: "Validation",
        message: "Please fill all address fields.",
        type: "warning",
      });
      return;
    }

    try {
      const { data } = await api.post("/auth/addresses", form);
      setAddresses(Array.isArray(data) ? data : []);
      setModalVisible(false);
      setForm(emptyForm);
      showAlert({ title: "Saved", message: "Address added", type: "success" });
    } catch (error) {
      showAlert({
        title: "Error",
        message: error.response?.data?.message || "Failed to add address",
        type: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await api.delete(`/auth/addresses/${id}`);
      setAddresses(Array.isArray(data) ? data : []);
      showAlert({
        title: "Deleted",
        message: "Address removed",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Error",
        message: error.response?.data?.message || "Failed to delete address",
        type: "error",
      });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.label || "Address"}</Text>
        <Text style={styles.text}>
          {item.street}, {item.city}, {item.state} - {item.pincode}
        </Text>
        {item.isDefault ? <Text style={styles.default}>Default</Text> : null}
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id)}>
        <Ionicons name="trash-outline" size={22} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenSurface style={styles.container}>
      <ScreenHeader title="Saved Addresses" navigation={navigation} />
      <Button
        title="Add Address"
        onPress={() => setModalVisible(true)}
        style={styles.addBtn}
      />

      <FlatList
        data={addresses}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 32 + insets.bottom },
        ]}
        ListEmptyComponent={
          <Text style={styles.empty}>No saved addresses.</Text>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Label (Home/Work)"
              value={form.label}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, label: value }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Street"
              value={form.street}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, street: value }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={form.city}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, city: value }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={form.state}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, state: value }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Pincode"
              keyboardType="numeric"
              value={form.pincode}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, pincode: value }))
              }
            />
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
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  text: {
    color: colors.textSecondary,
    marginTop: 3,
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
});

export default AddressesScreen;
