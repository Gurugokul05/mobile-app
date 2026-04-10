import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const contentMap = {
  privacy: {
    title: "Privacy & Security",
    sections: [
      {
        heading: "How We Protect Your Account",
        icon: "shield-checkmark-outline",
        points: [
          "Authentication uses secure token-based sessions.",
          "Sensitive account actions require authenticated API requests.",
          "We recommend unique passwords and regular password updates.",
        ],
      },
      {
        heading: "Your Responsibilities",
        icon: "lock-closed-outline",
        points: [
          "Do not share login credentials or OTPs with anyone.",
          "Log out from shared devices after every session.",
          "Report suspicious account activity immediately in Help Center.",
        ],
      },
      {
        heading: "Data Usage",
        icon: "document-text-outline",
        points: [
          "Profile, order, and payment metadata are used to fulfill purchases.",
          "Only required data is used for logistics, billing, and support.",
          "You can manage profile, address, and payment method data anytime.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    sections: [
      {
        heading: "Platform Use",
        points: [
          "Users must provide accurate account information.",
          "Sellers must upload authentic products and valid verification details.",
          "Misuse, fraud, or policy violations may lead to account suspension.",
        ],
      },
      {
        heading: "Orders and Delivery",
        points: [
          "Order confirmation depends on successful payment verification.",
          "Delivery timelines can vary by region and seller dispatch speed.",
          "Order tracking status updates are shown inside the Orders page.",
        ],
      },
      {
        heading: "Refund and Disputes",
        points: [
          "Refund requests require valid reason and policy compliance.",
          "Unboxing proof may be required for damage or mismatch claims.",
          "Final decisions are based on review of order and evidence data.",
        ],
      },
    ],
  },
  help: {
    title: "Help Center",
    sections: [
      {
        heading: "Fast Support Checklist",
        points: [
          "Include your order ID and issue summary.",
          "Add screenshots for UI or payment errors.",
          "Mention device type, app section, and timestamp of issue.",
        ],
      },
      {
        heading: "Payment Support",
        points: [
          "If payment fails, share checkout time and displayed error message.",
          "Retry only after confirming network stability.",
          "For duplicate payment concerns, include transaction reference.",
        ],
      },
      {
        heading: "Seller Support",
        points: [
          "For upload issues, include product name and image source used.",
          "For onboarding issues, confirm required documents were selected.",
          "For dashboard issues, include which tab/action failed.",
        ],
      },
    ],
  },
  settings: {
    title: "Profile Settings",
    sections: [
      {
        heading: "Manage Profile",
        points: [
          "Update display name and review account identity details.",
          "Maintain active email access for account recovery.",
        ],
      },
      {
        heading: "Manage Preferences",
        points: [
          "Control notifications, addresses, and payment methods.",
          "Use billing history to review previous transactions.",
        ],
      },
    ],
  },
};

const InfoScreen = ({ route, navigation }) => {
  const type = route.params?.type || "help";
  const payload = contentMap[type] || contentMap.help;
  const [search, setSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState({});
  const insets = useSafeAreaInsets();

  const filteredHelpSections = useMemo(() => {
    if (type !== "help") return payload.sections || [];
    const query = String(search || "")
      .trim()
      .toLowerCase();
    if (!query) return payload.sections || [];

    return (payload.sections || []).filter((section) => {
      const inHeading = section.heading.toLowerCase().includes(query);
      const inPoints = section.points.some((point) =>
        point.toLowerCase().includes(query),
      );
      return inHeading || inPoints;
    });
  }, [payload.sections, search, type]);

  const toggleFaq = (heading) => {
    setExpandedFaq((prev) => ({ ...prev, [heading]: !prev[heading] }));
  };

  const renderHeader = () => (
    <View style={styles.stickyHeaderWrap}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{payload.title}</Text>
        <View style={styles.headerSpacer} />
      </View>
    </View>
  );

  const renderPrivacy = () => (
    <View style={styles.sectionStack}>
      {(payload.sections || []).map((section) => (
        <View
          key={section.heading}
          style={[styles.contentCard, styles.privacyCard]}
        >
          <View style={styles.sectionTitleRow}>
            <Ionicons
              name={section.icon || "shield-outline"}
              size={18}
              color="#007AFF"
            />
            <Text style={styles.sectionHeading}>{section.heading}</Text>
          </View>
          {section.points.map((point) => (
            <View key={point} style={styles.pointRow}>
              <View style={styles.dot} />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderTerms = () => (
    <View style={styles.termsWrap}>
      {(payload.sections || []).map((section, index) => (
        <View key={section.heading} style={styles.termsSection}>
          <Text style={styles.sectionHeading}>{section.heading}</Text>
          {section.points.map((point) => (
            <View key={point} style={styles.pointRow}>
              <View style={styles.dot} />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
          {index < payload.sections.length - 1 ? (
            <View style={styles.divider} />
          ) : null}
        </View>
      ))}
    </View>
  );

  const renderHelp = () => (
    <View style={styles.sectionStack}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color="#6B7280" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search help topics"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />
      </View>

      {(filteredHelpSections || []).map((section) => {
        const isOpen = Boolean(expandedFaq[section.heading]);
        return (
          <View key={section.heading} style={styles.contentCard}>
            <TouchableOpacity
              style={styles.faqHeader}
              onPress={() => toggleFaq(section.heading)}
              activeOpacity={0.85}
            >
              <Text style={[styles.sectionHeading, styles.helpSectionHeading]}>
                {section.heading}
              </Text>
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color="#2563EB"
              />
            </TouchableOpacity>

            {isOpen
              ? section.points.map((point) => (
                  <View key={point} style={styles.pointRow}>
                    <View style={[styles.dot, styles.helpDot]} />
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))
              : null}
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        stickyHeaderIndices={[0]}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        {type === "privacy" ? renderPrivacy() : null}
        {type === "terms" ? renderTerms() : null}
        {type === "help" ? renderHelp() : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 0,
  },
  stickyHeaderWrap: {
    backgroundColor: "#F9FAFB",
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 21,
    fontWeight: "700",
    color: "#111827",
  },
  headerSpacer: {
    width: 36,
  },
  sectionStack: {
    gap: 16,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  privacyCard: {
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionHeading: {
    color: "#111827",
    fontWeight: "700",
    marginBottom: 10,
    fontSize: 17,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginTop: 8,
  },
  pointText: {
    color: "#374151",
    lineHeight: 22,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  termsWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  termsSection: {
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 10,
  },
  searchWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  helpSectionHeading: {
    color: "#2563EB",
    marginBottom: 0,
    flex: 1,
    paddingRight: 8,
  },
  helpDot: {
    backgroundColor: "#2563EB",
  },
});

export default InfoScreen;
