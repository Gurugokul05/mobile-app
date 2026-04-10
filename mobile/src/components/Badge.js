import React from "react";
import { View, Text, StyleSheet } from "react-native";

const config = {
  pending: { bg: "#FEF3C7", text: "#92400E", dot: "#D97706" },
  confirmed: { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  shipped: { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  delivered: { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  rejected: { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  verified: { bg: "#EDE9FE", text: "#5B21B6", dot: "#7C3AED" },
  draft: { bg: "#E2E8F0", text: "#334155", dot: "#64748B" },
};

const Badge = ({ label, type = "draft", style }) => {
  const badge = config[type] || config.draft;

  return (
    <View style={[styles.container, { backgroundColor: badge.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: badge.dot }]} />
      <Text style={[styles.label, { color: badge.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default Badge;
