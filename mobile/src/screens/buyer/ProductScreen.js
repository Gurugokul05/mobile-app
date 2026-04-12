import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { useCart } from "../../context/CartContext";
import { useAppAlert } from "../../context/AlertContext";
import { useWishlist } from "../../context/WishlistContext";
import ScreenSurface from "../../components/ScreenSurface";

const TABS = ["Description", "Reviews", "Shipping"];

const ProductScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const product = route?.params?.product || {};
  const [activeTab, setActiveTab] = useState("Description");
  const [quantity, setQuantity] = useState(1);
  const [tabOpacity] = useState(new Animated.Value(1));
  const { addToCart } = useCart();
  const { showAlert } = useAppAlert();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const trustScore = Number(product?.sellerId?.trustScore || 0);
  const clampedTrust = Math.max(0, Math.min(100, trustScore));
  const trustWidth = `${clampedTrust}%`;
  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];

  const tabContent = useMemo(() => {
    if (activeTab === "Description") {
      return (
        <View>
          <Text style={styles.bodyText}>
            {product?.description ||
              "Handpicked and authentic regional product crafted by local sellers."}
          </Text>
          <View style={styles.bulletRow}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={styles.bulletText}>
              Origin: {product?.originPlace || "Regional"}
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons
              name="shield-checkmark"
              size={14}
              color={colors.primary}
            />
            <Text style={styles.bulletText}>
              Quality-checked before listing
            </Text>
          </View>
        </View>
      );
    }

    if (activeTab === "Reviews") {
      if (!reviews.length) {
        return (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyArt}>:-)</Text>
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.bodyText}>
              Be the first buyer to leave feedback.
            </Text>
          </View>
        );
      }

      return (
        <View>
          {reviews.slice(0, 4).map((item) => (
            <View key={item?._id || item?.name} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewName}>{item?.name || "Buyer"}</Text>
                <Text style={styles.reviewRating}>
                  Rating {item?.rating || 5}
                </Text>
              </View>
              <Text style={styles.bodyText}>
                {item?.comment || "Great quality."}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View>
        <View style={styles.bulletRow}>
          <Ionicons name="time-outline" size={15} color={colors.primary} />
          <Text style={styles.bulletText}>
            Estimated delivery in 3-7 business days
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Ionicons name="cube-outline" size={15} color={colors.primary} />
          <Text style={styles.bulletText}>Secure tamper-proof packaging</Text>
        </View>
        <View style={styles.bulletRow}>
          <Ionicons name="refresh-outline" size={15} color={colors.primary} />
          <Text style={styles.bulletText}>
            Refund supported for eligible delivered orders
          </Text>
        </View>
      </View>
    );
  }, [activeTab, product?.description, product?.originPlace, reviews]);

  const animateTab = (nextTab) => {
    Animated.sequence([
      Animated.timing(tabOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(tabOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveTab(nextTab);
  };

  const addSelectedQuantityToCart = () => {
    for (let i = 0; i < quantity; i += 1) addToCart(product);
    showAlert({
      title: "Added to Cart",
      message: `${quantity} item${quantity > 1 ? "s" : ""} added successfully`,
      type: "success",
    });
  };

  return (
    <ScreenSurface style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.heroWrap}>
          <Image
            source={{
              uri: product?.images?.[0] || "https://via.placeholder.com/600",
            }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.12)", "rgba(0,0,0,0.35)"]}
            style={styles.heroOverlay}
          />

          <View style={[styles.topPillRow, { top: insets.top + 10 }]}>
            <TouchableOpacity
              style={styles.frostedPill}
              onPress={() => navigation.goBack()}
              activeOpacity={0.9}
            >
              <Ionicons
                name="chevron-back"
                size={19}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.frostedPill}
              onPress={async () => {
                const inWishlist = await toggleWishlist(product);
                showAlert({
                  title: inWishlist ? "Saved" : "Removed",
                  message: inWishlist
                    ? "Added to wishlist"
                    : "Removed from wishlist",
                  type: "success",
                });
              }}
              activeOpacity={0.9}
            >
              <Ionicons
                name={isInWishlist(product?._id) ? "heart" : "heart-outline"}
                size={18}
                color={
                  isInWishlist(product?._id) ? colors.error : colors.textPrimary
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 132 + insets.bottom }}
        >
          <View style={styles.contentWrap}>
            <Text style={styles.title}>{product?.name || "Product"}</Text>
            <Text style={styles.price}>
              Rs {Number(product?.price || 0).toLocaleString()}
            </Text>

            <View style={styles.sellerCard}>
              <View style={styles.sellerTop}>
                <Text style={styles.sellerName}>
                  {product?.sellerId?.name || "Seller"}
                </Text>
                <Text style={styles.sellerTag}>{clampedTrust}% trust</Text>
              </View>
              <Text style={styles.sellerBarLabel}>Seller Trust Score</Text>
              <View style={styles.trustRail}>
                <View style={[styles.trustFill, { width: trustWidth }]} />
              </View>
            </View>

            <View style={styles.tabsWrap}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabBtn,
                    activeTab === tab && styles.tabBtnActive,
                  ]}
                  onPress={() => animateTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.tabTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Animated.View style={[styles.tabPanel, { opacity: tabOpacity }]}>
              {tabContent}
            </Animated.View>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
            >
              <Ionicons name="remove" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setQuantity((prev) => Math.min(9, prev + 1))}
            >
              <Ionicons name="add" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={addSelectedQuantityToCart}
          >
            <Text style={styles.ctaText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, backgroundColor: colors.surface },
  heroWrap: { width: "100%", height: 300, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  topPillRow: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  frostedPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  contentWrap: { paddingHorizontal: 16, paddingTop: 14 },
  title: { fontSize: 22, fontWeight: "800", color: colors.textPrimary },
  price: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
  },
  sellerCard: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 12,
  },
  sellerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sellerName: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  sellerTag: { fontSize: 12, fontWeight: "700", color: colors.primary },
  sellerBarLabel: { marginTop: 8, fontSize: 12, color: colors.textSecondary },
  trustRail: {
    marginTop: 8,
    width: "100%",
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.lightBackground,
    overflow: "hidden",
  },
  trustFill: { height: "100%", backgroundColor: colors.primary },
  tabsWrap: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: colors.lightBackground,
    padding: 4,
    flexDirection: "row",
  },
  tabBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnActive: { backgroundColor: colors.white },
  tabText: { color: colors.textSecondary, fontWeight: "700", fontSize: 13 },
  tabTextActive: { color: colors.primary },
  tabPanel: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 12,
  },
  bodyText: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  bulletRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  bulletText: { marginLeft: 8, color: colors.textPrimary, fontSize: 13 },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  reviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reviewName: { color: colors.textPrimary, fontWeight: "700" },
  reviewRating: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  emptyWrap: { alignItems: "center", paddingVertical: 12 },
  emptyArt: { fontSize: 34 },
  emptyTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  stepper: {
    width: 126,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: 16, fontWeight: "800", color: colors.textPrimary },
  ctaBtn: {
    flex: 1,
    marginLeft: 10,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: colors.white, fontWeight: "800", fontSize: 15 },
});

export default ProductScreen;
