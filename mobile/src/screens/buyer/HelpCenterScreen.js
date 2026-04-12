import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import { colors } from "../../theme/colors";

const helpContent = [
  {
    category: "Orders",
    items: [
      {
        question: "How do I place an order?",
        answer:
          "Browse products, add items to cart, confirm your address, and complete payment from checkout. Once payment succeeds, the order appears under your order tracking screen with a unique order ID.",
      },
      {
        question: "How do I track my order?",
        answer:
          "Open Orders from the bottom navigation to view live status updates such as Accepted, Packed, Shipped, and Delivered. If seller tracking details are available, they appear inside the order timeline.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        question: "What payment methods are supported?",
        answer:
          "Payments are handled through secure third-party gateway integrations. Available options depend on gateway availability in your region and may include UPI, cards, and net banking at checkout.",
      },
      {
        question: "What should I do if payment fails?",
        answer:
          "If a transaction fails, wait a few minutes and check your order history before retrying. If amount is debited without order confirmation, contact support with payment reference details for verification.",
      },
    ],
  },
  {
    category: "Refunds",
    items: [
      {
        question: "How do I request a refund?",
        answer:
          "Go to Refund Disputes in your profile, choose the delivered order, provide your reason, and upload required evidence. The request is then reviewed by seller/admin workflow before a final decision.",
      },
      {
        question: "Why is unboxing video required for refund disputes?",
        answer:
          "Unboxing proof helps verify product condition at delivery time and prevents misuse of the refund process. This protects both buyers and sellers and supports fair, evidence-based decisions.",
      },
    ],
  },
  {
    category: "Sellers",
    items: [
      {
        question: "How do sellers upload products?",
        answer:
          "Sellers can add products from their dashboard by entering item details, pricing, stock, and photos. Listings should be accurate and complete to pass quality checks and reduce buyer disputes.",
      },
      {
        question: "How should sellers handle orders?",
        answer:
          "Sellers should follow the order lifecycle in sequence: accept, pack with proof, ship, and complete delivery. Prompt status updates and proper packaging are required for reliable fulfillment.",
      },
    ],
  },
  {
    category: "Account",
    items: [
      {
        question: "How do I reset my password?",
        answer:
          "Use the forgot-password flow on login. After OTP verification sent to your registered email, you can set a new password and sign in again with the updated credentials.",
      },
      {
        question: "How do I update my profile details?",
        answer:
          "Open My Profile, tap Edit, and save updated information. You can also manage addresses and payment preferences from profile settings to keep your checkout data current.",
      },
    ],
  },
];

const HelpCenterScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [expandedKey, setExpandedKey] = useState("");

  const filteredContent = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return helpContent;

    return helpContent
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [searchText]);

  return (
    <ScreenSurface style={styles.container}>
      <ScreenHeader title="Help Center" navigation={navigation} />

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search help topics"
          placeholderTextColor={colors.inputPlaceholder}
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredContent.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No matching topics</Text>
            <Text style={styles.emptyText}>
              Try a broader keyword such as order, payment, refund, or account.
            </Text>
          </View>
        ) : (
          filteredContent.map((category) => (
            <View key={category.category} style={styles.categoryWrap}>
              <Text style={styles.categoryTitle}>{category.category}</Text>

              {category.items.map((item) => {
                const key = `${category.category}-${item.question}`;
                const isOpen = expandedKey === key;

                return (
                  <View key={key} style={styles.itemWrap}>
                    <TouchableOpacity
                      style={styles.questionButton}
                      onPress={() => setExpandedKey(isOpen ? "" : key)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.questionText}>{item.question}</Text>
                      <Ionicons
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>

                    {isOpen ? (
                      <View style={styles.answerWrap}>
                        <Text style={styles.answerText}>{item.answer}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  categoryWrap: {
    marginTop: 14,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  itemWrap: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  questionButton: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  answerWrap: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  answerText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#374151",
  },
  emptyWrap: {
    marginTop: 36,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default HelpCenterScreen;
