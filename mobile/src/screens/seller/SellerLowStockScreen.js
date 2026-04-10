import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenSurface from "../../components/ScreenSurface";
import api from "../../api/config";

const SellerLowStockScreen = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/seller/me/products");
        const products = Array.isArray(data) ? data : [];
        const lowStock = products.filter((p) => {
          const stock = Number(
            p?.stock ?? p?.quantity ?? p?.inventoryCount ?? 0,
          );
          return Number.isFinite(stock) && stock <= 5;
        });
        setItems(lowStock);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ScreenSurface style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
      >
        <Text style={styles.title}>Low Stock Alerts</Text>
        <Text style={styles.subtitle}>
          Restock these items to avoid missed orders
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 20 }}
          />
        ) : items.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No low stock products right now.
            </Text>
          </View>
        ) : (
          items.map((item) => {
            const stock = Number(
              item?.stock ?? item?.quantity ?? item?.inventoryCount ?? 0,
            );
            return (
              <View key={item._id} style={styles.row}>
                <Text style={styles.name}>
                  {item.name || "Untitled Product"}
                </Text>
                <Text style={styles.stock}>Stock: {stock}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 14, color: "#6B7280" },
  row: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  name: { fontSize: 14, fontWeight: "600", color: "#111827" },
  stock: { marginTop: 2, fontSize: 12, color: "#DC2626" },
  emptyBox: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  emptyText: { color: "#6B7280", fontSize: 13 },
});

export default SellerLowStockScreen;
