import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import AnimatedWrapper from "../../components/AnimatedWrapper";
import { useCart } from "../../context/CartContext";
import { useAppAlert } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import api from "../../api/config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ProductScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const initialProduct = route?.params?.product || {};
  const [product, setProduct] = useState(initialProduct);
  const displayLocation = "TamilNadu";
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const { addToCart } = useCart();
  const { showAlert } = useAppAlert();
  const { user, userToken } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageScaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(imageScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const normalizedSeller = useMemo(() => {
    const sellerFromProduct =
      product?.sellerId && typeof product.sellerId === "object"
        ? product.sellerId
        : null;

    return {
      _id:
        sellerFromProduct?._id ||
        (typeof product?.sellerId === "string" ? product.sellerId : undefined),
      name: sellerFromProduct?.name || product?.sellerName || "Seller",
      isVerified: Boolean(sellerFromProduct?.isVerified || product?.isVerified),
      trustScore: Number(sellerFromProduct?.trustScore || 0),
    };
  }, [product?.isVerified, product?.sellerId, product?.sellerName]);

  const isSellerVerified = Boolean(normalizedSeller?.isVerified);

  const isFullyVerifiedSeller =
    Boolean(normalizedSeller?.isVerified) &&
    Number(normalizedSeller?.trustScore || 0) >= 90;

  const safeDescription = useMemo(() => {
    if (product?.description && String(product.description).trim()) {
      return product.description;
    }

    return `Authentic ${product?.name || "product"} from ${product?.originPlace || "its place of origin"}. Crafted by local sellers and quality-checked.`;
  }, [product?.description, product?.name, product?.originPlace]);

  const productHighlights = useMemo(
    () => [
      "Authenticity checked before listing",
      `Sourced and fulfilled from ${displayLocation}`,
      `Average rating ${Number(product?.rating || 0).toFixed(1)} (${product?.numReviews || 0} reviews)`,
      `Seller trust score ${normalizedSeller?.trustScore || 0}%`,
    ],
    [
      displayLocation,
      normalizedSeller?.trustScore,
      product?.numReviews,
      product?.rating,
    ],
  );

  const hasSuggestions = suggestedProducts.length > 0;
  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
  const currentUserId = String(user?._id || "").trim();
  const currentUserReview = reviews.find(
    (review) => String(review?.user || "") === currentUserId,
  );
  const hasUserReviewed = Boolean(currentUserReview);
  const displayedReviews = useMemo(() => {
    if (reviews.length === 0) return [];

    if (!hasUserReviewed) {
      return reviews.slice(0, 3);
    }

    const ownReviews = reviews.filter(
      (review) => String(review?.user || "") === currentUserId,
    );
    const otherReviews = reviews.filter(
      (review) => String(review?.user || "") !== currentUserId,
    );

    return [...ownReviews, ...otherReviews].slice(0, 3);
  }, [currentUserId, hasUserReviewed, reviews]);
  const reviewActionLabel = hasUserReviewed
    ? "You already reviewed this product"
    : reviews.length > 0
      ? "Write a review"
      : "Be the first to review";

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!route?.params?.product?._id) return;

      try {
        setDetailsLoading(true);
        const { data } = await api.get(`/products/${route.params.product._id}`);
        if (data && data._id) {
          setProduct(data);
        }
      } catch (error) {
        console.log("Product details fetch failed:", error?.message || error);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchProductDetails();
  }, [route?.params?.product?._id]);

  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      if (!product?._id) return;

      try {
        setSuggestedLoading(true);
        const { data } = await api.get("/products");
        const list = Array.isArray(data) ? data : [];

        const related = list
          .filter((item) => item?._id && item._id !== product._id)
          .sort((a, b) => {
            const aOriginMatch =
              String(a?.originPlace || "").toLowerCase() ===
              String(product?.originPlace || "").toLowerCase();
            const bOriginMatch =
              String(b?.originPlace || "").toLowerCase() ===
              String(product?.originPlace || "").toLowerCase();

            if (aOriginMatch !== bOriginMatch) {
              return bOriginMatch ? 1 : -1;
            }

            const aScore =
              Number(a?.rating || 0) * 10 + Number(a?.numReviews || 0);
            const bScore =
              Number(b?.rating || 0) * 10 + Number(b?.numReviews || 0);
            return bScore - aScore;
          })
          .slice(0, 4);

        setSuggestedProducts(related);
      } catch (error) {
        console.log(
          "Suggested products fetch failed:",
          error?.message || error,
        );
        setSuggestedProducts([]);
      } finally {
        setSuggestedLoading(false);
      }
    };

    fetchSuggestedProducts();
  }, [product?._id, product?.originPlace]);

  const handleBuyNow = () => {
    // Basic navigation to Cart/Checkout, could store in context in real app
    navigation.navigate("Checkout", { product });
  };

  const handleOpenSellerProfile = async () => {
    const sellerId =
      normalizedSeller?._id ||
      (typeof product?.sellerId === "string" ? product.sellerId : "");

    if (sellerId || normalizedSeller?.name) {
      navigation.navigate("BuyerSellerProfile", {
        seller: normalizedSeller,
        sellerId,
        product,
      });
      return;
    }

    if (!product?._id) {
      navigation.navigate("BuyerSellerProfile", {
        seller: {
          name: "Seller",
          isVerified: Boolean(product?.isVerified),
          trustScore: 0,
        },
        product,
      });
      return;
    }

    try {
      setDetailsLoading(true);
      const { data } = await api.get(`/products/${product._id}`);
      const fetchedSeller =
        data?.sellerId && typeof data.sellerId === "object"
          ? data.sellerId
          : null;

      const fetchedSellerId =
        fetchedSeller?._id ||
        (typeof data?.sellerId === "string" ? data.sellerId : undefined);

      navigation.navigate("BuyerSellerProfile", {
        seller: {
          _id: fetchedSeller?._id,
          name: fetchedSeller?.name || "Seller",
          isVerified: Boolean(fetchedSeller?.isVerified || data?.isVerified),
          trustScore: Number(fetchedSeller?.trustScore || 0),
        },
        sellerId: fetchedSellerId,
        product: data || product,
      });
    } catch (error) {
      navigation.navigate("BuyerSellerProfile", {
        seller: {
          name: "Seller",
          isVerified: Boolean(product?.isVerified),
          trustScore: 0,
        },
        sellerId: normalizedSeller?._id,
        product,
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    const productId = String(product?._id || "").trim();

    if (!userToken) {
      showAlert({
        title: "Login Required",
        message: "Please login as a buyer to submit a review.",
        type: "error",
      });
      return;
    }

    if (!/^[a-f\d]{24}$/i.test(productId)) {
      showAlert({
        title: "Review Unavailable",
        message:
          "This is a demo product. Please open a real product loaded from server to submit a review.",
        type: "error",
      });
      return;
    }

    try {
      setReviewLoading(true);
      const { data } = await api.post(`/products/${productId}/reviews`, {
        rating: selectedRating,
        comment: reviewComment,
      });

      setProduct(data);
      setReviewModalVisible(false);
      setReviewComment("");
      setSelectedRating(5);
      showAlert({
        title: "Thank You",
        message: "Your review has been submitted.",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Review Failed",
        message: error?.response?.data?.message || "Unable to submit review",
        type: "error",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    const inWishlist = await toggleWishlist(product);
    showAlert({
      title: inWishlist ? "Added" : "Removed",
      message: inWishlist
        ? "Product added to wishlist."
        : "Product removed from wishlist.",
      type: "success",
    });
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Animated.Image
            source={{
              uri: product.images?.[0] || "https://via.placeholder.com/400",
            }}
            style={[
              styles.image,
              { opacity: fadeAnim, transform: [{ scale: imageScaleAnim }] },
            ]}
          />

          {detailsLoading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : null}

          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.28)"]}
            style={styles.imageGradient}
            pointerEvents="none"
          />

          <View style={[styles.topControls, { top: insets.top + 10 }]}>
            <TouchableOpacity
              style={styles.topControlBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.topControlBtn}
              onPress={handleToggleWishlist}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isInWishlist(product?._id) ? "heart" : "heart-outline"}
                size={20}
                color={
                  isInWishlist(product?._id) ? colors.error : colors.textPrimary
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <SafeAreaView
          edges={["left", "right", "bottom"]}
          style={styles.contentSafeArea}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 170 + insets.bottom }}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>₹{product.price}</Text>
              </View>

              <Text style={styles.origin}>From {displayLocation}</Text>

              <TouchableOpacity
                style={styles.sellerCard}
                onPress={handleOpenSellerProfile}
                activeOpacity={0.92}
              >
                <View style={styles.sellerLeftCol}>
                  <Text style={styles.sellerName}>
                    {normalizedSeller?.name || "Seller Name"}
                  </Text>
                  <Text style={styles.trustScore}>
                    Trust Score: {normalizedSeller?.trustScore || 0}%
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={colors.warning} />
                    <Text style={styles.ratingText}>
                      {Number(product.rating || 0).toFixed(1)} (
                      {product.numReviews || 0} reviews)
                    </Text>
                  </View>
                </View>
                <View style={styles.sellerRightCol}>
                  {isSellerVerified ? (
                    <Text style={styles.sellerVerifiedTag}>
                      {isFullyVerifiedSeller ? "Fully Verified" : "Verified"}
                    </Text>
                  ) : null}
                  <View style={styles.viewProfileRow}>
                    <Text style={styles.viewProfileText}>View profile</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={colors.textSecondary}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.proofContainer}>
                <Text style={styles.proofText}>
                  Packing proof will be provided upon shipping
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{safeDescription}</Text>

              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                Product Highlights
              </Text>
              {productHighlights.map((item) => (
                <View key={item} style={styles.infoRow}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.infoText}>{item}</Text>
                </View>
              ))}

              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                Delivery & Care
              </Text>
              <View style={styles.infoRow}>
                <Ionicons
                  name="cube-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.infoText}>
                  Tamper-proof packaging with quality seal
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.infoText}>
                  Estimated delivery: 3-7 business days
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.infoText}>
                  7-day refund window for eligible orders
                </Text>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                Reviews
              </Text>
              {displayedReviews.length > 0 ? (
                displayedReviews.map((review) => (
                  <View key={review._id} style={styles.reviewCard}>
                    <View style={styles.reviewTopRow}>
                      <View style={styles.reviewNameRow}>
                        <Text style={styles.reviewName}>{review.name}</Text>
                        {String(review?.user || "") === currentUserId ? (
                          <Text style={styles.yourReviewBadge}>
                            Your review
                          </Text>
                        ) : null}
                      </View>
                      <Text style={styles.reviewRating}>
                        ⭐ {review.rating}
                      </Text>
                    </View>
                    <Text style={styles.reviewComment}>
                      {review.comment || "Great product!"}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.reviewsEmptyWrap}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={20}
                    color="#9CA3AF"
                  />
                  <Text style={styles.noReviewText}>No reviews yet.</Text>
                </View>
              )}

              {!hasUserReviewed ? (
                <TouchableOpacity
                  style={styles.writeReviewBtn}
                  onPress={() => setReviewModalVisible(true)}
                >
                  <Text style={styles.writeReviewText}>
                    {reviewActionLabel}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.reviewedNotice}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.reviewedNoticeText}>
                    You have already reviewed this product
                  </Text>
                </View>
              )}

              <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
                Suggested Items
              </Text>
              {suggestedLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.suggestedLoader}
                />
              ) : hasSuggestions ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.suggestedList}
                >
                  {suggestedProducts.map((item) => (
                    <AnimatedWrapper
                      key={item._id}
                      style={styles.suggestedCard}
                      onPress={() =>
                        navigation.push("ProductScreen", { product: item })
                      }
                    >
                      <Image
                        source={{
                          uri:
                            item.images?.[0] ||
                            "https://via.placeholder.com/150",
                        }}
                        style={styles.suggestedImage}
                      />
                      <Text numberOfLines={1} style={styles.suggestedName}>
                        {item.name}
                      </Text>
                      <Text style={styles.suggestedPrice}>₹{item.price}</Text>
                    </AnimatedWrapper>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noReviewText}>
                  No suggestions available right now.
                </Text>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>

        <Modal
          visible={reviewModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setReviewModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rate this Product</Text>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setSelectedRating(star)}
                  >
                    <Ionicons
                      name={star <= selectedRating ? "star" : "star-outline"}
                      size={30}
                      color={colors.warning}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.reviewInput}
                value={reviewComment}
                onChangeText={setReviewComment}
                placeholder="Write your review..."
                placeholderTextColor={colors.textSecondary}
                multiline
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setReviewModalVisible(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleSubmitReview}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalSubmitText}>
                    {reviewLoading ? "Submitting..." : "Submit"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              addToCart(product);
              showAlert({
                title: "Success",
                message: "Added to cart!",
                type: "success",
              });
            }}
            style={styles.addToCartBtn}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>

          <View style={{ width: 12 }} />

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleBuyNow}
            style={styles.buyNowBtn}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 300,
  },
  image: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  wishlistIconBtn: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  topControls: {
    position: "absolute",
    alignItems: "center",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  topControlBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentSafeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
    marginLeft: 16,
  },
  origin: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
  },
  sellerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sellerLeftCol: {
    flex: 1,
  },
  sellerVerifiedTag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sellerRightCol: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  trustScore: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  viewProfileRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewProfileText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "700",
  },
  proofContainer: {
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  proofText: {
    color: "#92400E",
    fontWeight: "600",
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: "#374151",
    lineHeight: 22,
    fontWeight: "500",
    fontSize: 14,
  },
  reviewCard: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reviewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewName: {
    fontWeight: "700",
    color: colors.textPrimary,
  },
  reviewNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    paddingRight: 8,
    flexWrap: "wrap",
  },
  yourReviewBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  reviewRating: {
    fontWeight: "700",
    color: colors.warning,
  },
  reviewComment: {
    color: "#374151",
    lineHeight: 20,
  },
  reviewsEmptyWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  noReviewText: {
    color: "#6B7280",
    fontSize: 13,
  },
  writeReviewBtn: {
    marginTop: 12,
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  writeReviewText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  reviewedNotice: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reviewedNoticeText: {
    color: "#059669",
    fontSize: 13,
    fontWeight: "600",
  },
  suggestedLoader: {
    marginTop: 10,
    marginBottom: 4,
  },
  suggestedList: {
    paddingTop: 2,
    paddingBottom: 4,
  },
  suggestedCard: {
    width: 124,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    borderRadius: 10,
    padding: 8,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  suggestedImage: {
    width: "100%",
    height: 76,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestedName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  suggestedPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 14,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    minHeight: 90,
    textAlignVertical: "top",
    padding: 10,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "700",
  },
  modalSubmitBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubmitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 20,
  },
  addToCartBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#007AFF",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buyNowBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  buyNowText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ProductScreen;
