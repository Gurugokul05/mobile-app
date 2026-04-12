import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../api/config";
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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const { addToCart } = useCart();
  const { showAlert } = useAppAlert();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const trustScore = Number(product?.sellerId?.trustScore || 0);
  const clampedTrust = Math.max(0, Math.min(100, trustScore));
  const trustWidth = `${clampedTrust}%`;
  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
  const productImages = Array.isArray(product?.images)
    ? product.images.filter(Boolean)
    : [];
  const heroImage = productImages[0] || "https://via.placeholder.com/600";

  const productHighlights = useMemo(
    () => [
      {
        icon: "location-outline",
        label: "Origin",
        value: product?.originPlace || "Local craft",
      },
      {
        icon: "shield-checkmark-outline",
        label: "Trust",
        value: `${clampedTrust}% seller trust`,
      },
      {
        icon: "pricetag-outline",
        label: "Price",
        value: `Rs ${Number(product?.price || 0).toLocaleString()}`,
      },
      {
        icon: "star-outline",
        label: "Reviews",
        value: `${reviews.length || 0} customer review${reviews.length === 1 ? "" : "s"}`,
      },
    ],
    [clampedTrust, product?.originPlace, product?.price, reviews.length],
  );

  const carePoints = useMemo(
    () => [
      "Verified seller profile and trust score",
      "Secure checkout and buyer protection",
      "Quality-checked product listing before sale",
      "Trackable order with support for refund claims",
    ],
    [],
  );

  useEffect(() => {
    const loadRelatedProducts = async () => {
      try {
        setRelatedLoading(true);
        const { data } = await api.get("/products");
        const allProducts = Array.isArray(data) ? data : [];
        const currentId = String(product?._id || "");
        const currentOrigin = String(product?.originPlace || "")
          .trim()
          .toLowerCase();
        const currentSellerId = String(
          product?.sellerId?._id || product?.sellerId || "",
        );

        const scored = allProducts
          .filter((item) => String(item?._id || "") !== currentId)
          .map((item) => {
            const sameOrigin =
              currentOrigin &&
              String(item?.originPlace || "")
                .trim()
                .toLowerCase() === currentOrigin;
            const sameSeller =
              currentSellerId &&
              String(item?.sellerId?._id || item?.sellerId || "") ===
                currentSellerId;
            const trust = Number(item?.sellerId?.trustScore || 0);
            const score =
              (sameOrigin ? 2 : 0) + (sameSeller ? 1 : 0) + trust / 100;

            return { ...item, _score: score };
          })
          .sort((a, b) => b._score - a._score)
          .slice(0, 8);

        setRelatedProducts(scored);
      } catch (_error) {
        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    loadRelatedProducts();
  }, [product?._id, product?.originPlace, product?.sellerId]);

  const tabContent = useMemo(() => {
    if (activeTab === "Description") {
      return (
        <View>
          <Text style={styles.bodyText}>
            {product?.description ||
              "Handpicked and authentic regional product crafted by local sellers."}
          </Text>
          <View style={styles.featureGrid}>
            {productHighlights.map((item) => (
              <View key={item.label} style={styles.featureCard}>
                <Ionicons name={item.icon} size={16} color={colors.primary} />
                <Text style={styles.featureLabel}>{item.label}</Text>
                <Text style={styles.featureValue}>{item.value}</Text>
              </View>
            ))}
          </View>
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

        <View style={styles.listCardSoft}>
          <Text style={styles.sectionHeading}>Why shoppers like this</Text>
          {carePoints.map((point) => (
            <View key={point} style={styles.bulletRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={15}
                color={colors.success}
              />
              <Text style={styles.bulletText}>{point}</Text>
            </View>
          ))}
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
              uri: heroImage,
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

            <Text style={styles.shortDescription} numberOfLines={3}>
              {product?.description ||
                "A crafted ROOTS product with verified seller details, secure checkout, and buyer support."}
            </Text>

            {productImages.length > 1 ? (
              <View style={styles.galleryWrap}>
                <Text style={styles.sectionHeading}>More Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {productImages.slice(0, 5).map((uri, index) => (
                    <Image
                      key={`${uri}-${index}`}
                      source={{ uri }}
                      style={styles.galleryThumb}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.sellerCard}>
              <View style={styles.sellerTop}>
                <Text style={styles.sellerName}>
                  {product?.sellerId?.name || "Seller"}
                </Text>
                <Text style={styles.sellerTag}>{clampedTrust}% trust</Text>
              </View>
              <Text style={styles.sellerMeta}>
                {product?.sellerId?.location ||
                  product?.originPlace ||
                  "Verified local seller"}
              </Text>
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

            <View style={styles.sellerCard}>
              <Text style={styles.sectionHeading}>Shipping & Returns</Text>
              <View style={styles.bulletRow}>
                <Ionicons
                  name="time-outline"
                  size={15}
                  color={colors.primary}
                />
                <Text style={styles.bulletText}>
                  Expected delivery in 3-7 business days
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Ionicons
                  name="cube-outline"
                  size={15}
                  color={colors.primary}
                />
                <Text style={styles.bulletText}>
                  Seller packs securely before shipping
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Ionicons
                  name="return-up-back-outline"
                  size={15}
                  color={colors.primary}
                />
                <Text style={styles.bulletText}>
                  Refunds can be requested for eligible delivered orders
                </Text>
              </View>
            </View>

            <View style={styles.relatedWrap}>
              <View style={styles.relatedHeader}>
                <Text style={styles.sectionHeading}>You May Like</Text>
                {relatedLoading ? (
                  <Text style={styles.relatedHint}>Loading...</Text>
                ) : null}
              </View>

              {relatedProducts.length ? (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={relatedProducts}
                  keyExtractor={(item) => String(item?._id)}
                  contentContainerStyle={styles.relatedList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.relatedCard}
                      onPress={() =>
                        navigation.replace("ProductScreen", { product: item })
                      }
                    >
                      <Image
                        source={{
                          uri:
                            item?.images?.[0] ||
                            "https://via.placeholder.com/300",
                        }}
                        style={styles.relatedImage}
                      />
                      <Text style={styles.relatedTitle} numberOfLines={2}>
                        {item?.name || "Product"}
                      </Text>
                      <Text style={styles.relatedMeta} numberOfLines={1}>
                        {item?.originPlace || "Local"}
                      </Text>
                      <Text style={styles.relatedPrice}>
                        Rs {Number(item?.price || 0).toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyArt}>:-)</Text>
                  <Text style={styles.emptyTitle}>No related products yet</Text>
                  <Text style={styles.bodyText}>
                    More items from similar sellers will appear here.
                  </Text>
                </View>
              )}
            </View>
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
  shortDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  galleryWrap: {
    marginTop: 14,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  galleryThumb: {
    width: 92,
    height: 92,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: colors.lightBackground,
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
  sellerMeta: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
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
  featureGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: "48%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 10,
    marginBottom: 8,
  },
  featureLabel: {
    marginTop: 6,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  featureValue: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  bulletRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  bulletText: { marginLeft: 8, color: colors.textPrimary, fontSize: 13 },
  listCardSoft: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: colors.lightBackground,
    padding: 12,
  },
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
  relatedWrap: {
    marginTop: 16,
  },
  relatedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  relatedHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  relatedList: {
    paddingRight: 8,
  },
  relatedCard: {
    width: 152,
    marginRight: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 10,
  },
  relatedImage: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    backgroundColor: colors.lightBackground,
  },
  relatedTitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  relatedMeta: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textSecondary,
  },
  relatedPrice: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
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
