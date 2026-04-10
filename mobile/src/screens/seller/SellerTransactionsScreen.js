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

const SellerTransactionsScreen = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/seller/me/transactions");
        setSummary(data?.summary || null);
        setTransactions(
          Array.isArray(data?.transactions) ? data.transactions : [],
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formatDate = (date) =>
    new Date(date || Date.now()).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });

  return (
    <ScreenSurface style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
      >
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>Payout and earnings movement</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryValue}>
              ₹{Number(summary?.monthlyEarnings || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pending Payout</Text>
            <Text style={styles.summaryValue}>
              ₹{Number(summary?.pendingPayout || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.listCard}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={{ marginVertical: 16 }}
            />
          ) : transactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions available yet.</Text>
          ) : (
            transactions.slice(0, 20).map((txn, index) => (
              <View
                key={txn.id || `${txn.orderId}-${index}`}
                style={[
                  styles.txRow,
                  index === Math.min(transactions.length, 20) - 1 &&
                    styles.txRowLast,
                ]}
              >
                <View>
                  <Text style={styles.txLabel}>
                    {txn.label || "Transaction"}
                  </Text>
                  <Text style={styles.txDate}>{formatDate(txn.createdAt)}</Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    txn.direction !== "credit" && styles.txAmountNegative,
                  ]}
                >
                  {txn.direction === "credit" ? "+" : "-"}₹
                  {Number(txn.amount || 0).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 14, color: "#6B7280" },
  summaryCard: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 13, color: "#6B7280" },
  summaryValue: { fontSize: 15, fontWeight: "700", color: "#111827" },
  listCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  txRowLast: { borderBottomWidth: 0 },
  txLabel: { fontSize: 14, color: "#111827", fontWeight: "600" },
  txDate: { marginTop: 2, fontSize: 12, color: "#6B7280" },
  txAmount: { fontSize: 14, color: "#16A34A", fontWeight: "700" },
  txAmountNegative: { color: "#DC2626" },
  emptyText: {
    paddingVertical: 14,
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
  },
});

export default SellerTransactionsScreen;
