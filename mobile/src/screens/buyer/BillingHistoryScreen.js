import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import api from "../../api/config";
import { colors } from "../../theme/colors";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

const BillingHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { userToken } = useAuth();

  const fetchBilling = async () => {
    if (!userToken) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/orders/my-orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error?.response?.status === 401) {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, [userToken]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.id}>Order #{String(item._id || "").slice(-6)}</Text>
      <Text style={styles.meta}>
        Date: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <Text style={styles.meta}>
        Status: {item.paymentDetails?.status || "Pending"}
      </Text>
      <Text style={styles.total}>
        ₹{(item.totalPrice || 0).toLocaleString()}
      </Text>
    </View>
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
      <ScreenHeader title="Billing History" navigation={navigation} />
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 32 + insets.bottom },
        ]}
        ListEmptyComponent={
          <Text style={styles.empty}>No billing records found.</Text>
        }
      />
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
    paddingTop: 14,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lightBackground,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  id: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  meta: {
    marginTop: 3,
    color: colors.textSecondary,
  },
  total: {
    marginTop: 8,
    color: colors.primary,
    fontWeight: "800",
    fontSize: 18,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});

export default BillingHistoryScreen;
