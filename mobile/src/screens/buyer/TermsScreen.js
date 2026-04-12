import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import { colors } from "../../theme/colors";

const sections = [
  {
    title: "1. Platform Role",
    body: "Roots is an intermediary marketplace that enables transactions between buyers and independent sellers. Roots is not the direct seller of listed products unless explicitly stated for a specific listing.",
  },
  {
    title: "2. User Responsibilities",
    body: "Users must provide accurate account and delivery information, maintain account security, and use the platform lawfully. Any fraudulent behavior, impersonation, payment abuse, or false claims may result in account action.",
  },
  {
    title: "3. Seller Responsibilities",
    body: "Sellers are responsible for product authenticity, accurate listing details, and truthful pricing/availability. Sellers must package orders properly, upload required packing proof when applicable, and ship within expected timelines.",
  },
  {
    title: "4. Orders & Payments",
    body: "Orders are placed and tracked through Roots platform workflows. Payment processing is handled by third-party providers such as Razorpay. Payment authorization, settlement, and gateway-level controls are governed by the payment provider's terms.",
  },
  {
    title: "5. Refund Policy",
    body: "Refund disputes require mandatory unboxing evidence where requested by policy. Refund requests are reviewed through platform workflows and admin adjudication. In dispute cases handled by admin review, the final platform decision is binding.",
  },
  {
    title: "6. Prohibited Activities",
    body: "The following are prohibited: fake listings, sale of unauthorized goods, abusive or manipulated refund submissions, payment fraud, harassment, platform scraping, and any attempt to bypass system controls or verification rules.",
  },
  {
    title: "7. Limitation of Liability",
    body: "To the extent permitted by law, Roots is not liable for indirect, incidental, or consequential damages arising from platform use, delivery delays, third-party payment interruptions, or user-generated listing inaccuracies.",
  },
  {
    title: "8. Account Termination",
    body: "Roots may suspend or terminate accounts that violate these terms, misuse platform features, or create operational or legal risk. Serious or repeated violations may result in permanent access removal.",
  },
];

const TermsScreen = ({ navigation }) => {
  return (
    <ScreenSurface style={styles.container}>
      <ScreenHeader title="Terms & Conditions" navigation={navigation} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: April 11, 2026</Text>
        {sections.map((section, index) => (
          <View key={section.title} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
            {index < sections.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </ScrollView>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 32,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  sectionWrap: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
    color: "#1F2937",
    textAlign: "justify",
  },
  divider: {
    marginTop: 14,
    marginBottom: 10,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
});

export default TermsScreen;
