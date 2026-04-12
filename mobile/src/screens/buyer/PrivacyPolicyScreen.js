import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import { colors } from "../../theme/colors";

const sections = [
  {
    title: "1. Introduction",
    body: "Roots is a digital marketplace that connects buyers with independent sellers and artisan makers. The platform includes buyer and seller interfaces, along with an admin review system that helps with order quality, compliance checks, and dispute handling.",
  },
  {
    title: "2. Information We Collect",
    body: "We collect account data such as your name, email address, and phone number. For order fulfillment, we collect shipping details including address, city, state, and postal code. Payments are processed by third-party gateways such as Razorpay; Roots does not store full card numbers or CVV data. We also process platform media, including product photos, packing proof uploads, and refund evidence videos.",
  },
  {
    title: "3. How We Use Your Data",
    body: "Data is used to process orders, manage shipping and delivery, and maintain account access. We use your contact information for transaction updates, verification flows, and support communication. Data may also be used to detect abuse, prevent fraud, enforce marketplace rules, and improve reliability and user experience.",
  },
  {
    title: "4. Data Sharing",
    body: "Order-related data is shared between buyers and sellers when required to complete transactions. We share limited data with service providers used by the platform, including payment processors and media hosting providers such as Cloudinary. Information may also be disclosed when required by law, regulation, or lawful requests from authorities.",
  },
  {
    title: "5. Data Security",
    body: "Roots uses JWT-based authentication and access-controlled APIs to reduce unauthorized access. Operational data is stored using secure server-side practices, and sensitive workflows are restricted to relevant buyer, seller, or admin roles. Internal access to operational tools is limited based on business need.",
  },
  {
    title: "6. User Rights",
    body: "You can update profile information from your account settings. You can request account deletion and may request removal of certain personal data, subject to transaction, legal, and fraud-prevention obligations. You can also contact support for help with privacy-related requests.",
  },
  {
    title: "7. Data Retention",
    body: "Roots retains account and transaction records while your account remains active, and for additional periods where needed for legal, regulatory, tax, audit, or dispute-resolution purposes. Once retention obligations end, data is deleted or anonymized where practical.",
  },
  {
    title: "8. Contact",
    body: "For privacy questions, account data requests, or deletion support, contact: support.roots.app@gmail.com",
  },
];

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <ScreenSurface style={styles.container}>
      <ScreenHeader title="Privacy Policy" navigation={navigation} />
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

export default PrivacyPolicyScreen;
