import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/config";

const SellerProfileScreen = ({ route, navigation }) => {
  const seller = route?.params?.seller || {};
  const initialProduct = route?.params?.product;
  const routeSellerId = String(route?.params?.sellerId || "").trim();
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sellerDetails, setSellerDetails] = useState(null);
  const insets = useSafeAreaInsets();

  const sellerId = useMemo(
    () => String(routeSellerId || seller?._id || seller?.id || "").trim(),
    [routeSellerId, seller?._id, seller?.id],
  );

  useEffect(() => {
    if (sellerId) {
      const fetchSellerProfile = async () => {
        try {
          const { data } = await api.get(`/seller/public/${sellerId}`);
          setSellerDetails(data || null);
        } catch (error) {
          console.log("Seller profile fetch failed:", error?.message || error);
          setSellerDetails(seller || null);
        }
      };

      fetchSellerProfile();
    }
  }, [sellerId, seller]);

  const displaySeller = useMemo(
    () => sellerDetails || seller,
    [sellerDetails, seller],
  );

  useEffect(() => {
    const fetchSellerProducts = async () => {
      if (!sellerId) return;

      try {
        setLoading(true);
        const { data } = await api.get("/products");
        const products = Array.isArray(data) ? data : [];
        const ownProducts = products
          .filter(
            (item) =>
              String(item?.sellerId?._id || item?.sellerId || "") === sellerId,
          )
          .slice(0, 6);

        setSellerProducts(ownProducts);
      } catch (error) {
        console.log(
          "Seller profile products fetch failed:",
          error?.message || error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProducts();
  }, [sellerId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.headerRow, { paddingTop: insets.top + 10 }]}>
          <View style={styles.headerTopBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Ionicons name="chevron-back" size={18} color="#111827" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.avatarCircle}>
            {displaySeller?.avatar ? (
              <Image
                source={{ uri: displaySeller.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {String(displaySeller?.name || "S")
                  .trim()
                  .charAt(0)
                  .toUpperCase() || "S"}
              </Text>
            )}
          </View>

          <Text style={styles.sellerName}>
            {displaySeller?.name || "Seller"}
          </Text>
          <Text style={styles.sellerMeta}>
            {displaySeller?.location || "Trusted local seller"}
          </Text>

          {displaySeller?.description && (
            <Text style={styles.description}>{displaySeller.description}</Text>
          )}

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="shield-checkmark" size={14} color="#007AFF" />
              <Text style={styles.metaText}>
                {displaySeller?.isVerified ? "Verified" : "Pending"}
              </Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons name="stats-chart" size={14} color="#007AFF" />
              <Text style={styles.metaText}>
                Trust {displaySeller?.trustScore || 0}%
              </Text>
            </View>
          </View>
        </View>

        {(displaySeller?.phone ||
          displaySeller?.email ||
          displaySeller?.address) && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Contact</Text>

            {displaySeller?.phone && (
              <View style={styles.detailRow}>
                <View style={styles.iconWrap}>
                  <Ionicons name="call-outline" size={16} color="#007AFF" />
                </View>
                <Text style={styles.detailText}>{displaySeller.phone}</Text>
              </View>
            )}

            {displaySeller?.email && (
              <View style={styles.detailRow}>
                <View style={styles.iconWrap}>
                  <Ionicons name="mail-outline" size={16} color="#007AFF" />
                </View>
                <Text style={styles.detailText}>{displaySeller.email}</Text>
              </View>
            )}

            {displaySeller?.address && (
              <View style={styles.detailRow}>
                <View style={styles.iconWrap}>
                  <Ionicons name="location-outline" size={16} color="#007AFF" />
                </View>
                <Text style={styles.detailText}>{displaySeller.address}</Text>
              </View>
            )}
          </View>
        )}

        {(displaySeller?.responseTime ||
          displaySeller?.returnRate ||
          displaySeller?.averageRating) && (
          <View style={styles.statsCardTop}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {displaySeller?.responseTime || "-"}
              </Text>
              <Text style={styles.statLabel}>Response</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {displaySeller?.returnRate || "-"}
              </Text>
              <Text style={styles.statLabel}>Return</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {displaySeller?.averageRating || 0}★
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        )}

        {displaySeller?.specialties && displaySeller.specialties.length > 0 && (
          <View style={styles.specialtiesSection}>
            <Text style={styles.specLabel}>Specialties</Text>
            <View style={styles.specialtiesRow}>
              {displaySeller.specialties.map((specialty, idx) => (
                <View key={idx} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {displaySeller?.certifications &&
          displaySeller.certifications.length > 0 && (
            <View style={styles.certificationsSection}>
              <Text style={styles.specLabel}>Certifications</Text>
              {displaySeller.certifications.map((cert, idx) => (
                <View key={idx} style={styles.certRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
                  <Text style={styles.certText}>{cert}</Text>
                </View>
              ))}
            </View>
          )}

        {displaySeller?.about && (
          <View style={styles.aboutSection}>
            <Text style={styles.specLabel}>About the Seller</Text>
            <Text style={styles.aboutText}>{displaySeller.about}</Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>
              {displaySeller?.totalOrders || 0}
            </Text>
            <Text style={styles.statItemLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>
              {displaySeller?.totalReviews || 0}
            </Text>
            <Text style={styles.statItemLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statItemValue}>
              {displaySeller?.yearsInBusiness || 0}
            </Text>
            <Text style={styles.statItemLabel}>Years</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items by this Seller</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginTop: 18 }}
          />
        ) : sellerProducts.length > 0 ? (
          <View style={styles.grid}>
            {sellerProducts.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.productCard}
                onPress={() =>
                  navigation.replace("ProductScreen", { product: item })
                }
                activeOpacity={0.9}
              >
                <Image
                  source={{
                    uri: item.images?.[0] || "https://via.placeholder.com/150",
                  }}
                  style={styles.productImage}
                />
                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.productPrice}>₹{item.price}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : initialProduct ? (
          <TouchableOpacity
            style={styles.singleFallbackCard}
            onPress={() =>
              navigation.replace("ProductScreen", { product: initialProduct })
            }
          >
            <Text style={styles.fallbackText}>
              No additional items yet. View current product.
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.emptyText}>
            No items available for this seller right now.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerRow: {
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTopBar: {
    width: "100%",
    marginBottom: 16,
  },
  backBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 4,
  },
  backText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 14,
  },
  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 46,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#007AFF",
  },
  sellerName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  sellerMeta: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    marginTop: 12,
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320,
  },
  metaRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconWrap: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  detailText: {
    flex: 1,
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  statsCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  specialtiesSection: {
    marginBottom: 16,
  },
  specLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  specialtiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  specialtyTag: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  certificationsSection: {
    marginBottom: 16,
  },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  certText: {
    marginLeft: 10,
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  aboutSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statItemValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  statItemLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    height: 36,
    alignSelf: "center",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    padding: 8,
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#007AFF",
  },
  singleFallbackCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  fallbackText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  emptyText: {
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 24,
  },
});

export default SellerProfileScreen;
