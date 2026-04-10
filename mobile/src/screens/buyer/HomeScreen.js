import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import api from "../../api/config";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import AnimatedWrapper from "../../components/AnimatedWrapper";
import ScreenSurface from "../../components/ScreenSurface";

const MOCK_PLACES = [
  {
    id: "1",
    name: "Kashmir",
    image:
      "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    name: "Rajasthan",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    name: "Kerala",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    name: "Darjeeling",
    image:
      "https://images.unsplash.com/photo-1544256226-724fc9b441da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "5",
    name: "Varanasi",
    image:
      "https://images.unsplash.com/photo-1561359313-0639aad49ca6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
];

const MOCK_PRODUCTS = [
  {
    _id: "m1",
    name: "Authentic Pashmina Shawl",
    originPlace: "Kashmir",
    price: "12,500",
    images: [
      "https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerId: "seller1",
  },
  {
    _id: "m2",
    name: "Jaipuri Blue Pottery Vase",
    originPlace: "Rajasthan",
    price: "1,200",
    images: [
      "https://images.unsplash.com/photo-1610715936287-6c2ad208cdbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerId: "seller2",
  },
  {
    _id: "m3",
    name: "Premium First Flush Tea",
    originPlace: "Darjeeling",
    price: "850",
    images: [
      "https://images.unsplash.com/photo-1576092762791-dd9e222046d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerId: "seller3",
  },
  {
    _id: "m4",
    name: "Kanchipuram Pure Silk Saree",
    originPlace: "Tamil Nadu",
    price: "18,000",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550905b0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerId: "seller4",
  },
  {
    _id: "m5",
    name: "Handcrafted Sandalwood Idol",
    originPlace: "Mysore",
    price: "3,500",
    images: [
      "https://images.unsplash.com/photo-1629851498382-b7e1ce790472?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: false,
    sellerId: "seller5",
  },
  {
    _id: "m6",
    name: "Kerala Spices Gift Box",
    originPlace: "Kerala",
    price: "950",
    images: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerId: "seller1",
  },
];

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const displayLocation = "TamilNadu";

  const profileInitials = useMemo(() => {
    const name = String(user?.name || "").trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }, [user?.name]);

  const topLocation = useMemo(() => displayLocation, [displayLocation]);

  const trendingProducts = useMemo(() => {
    const scoped = products.filter((product) => {
      if (!topLocation || topLocation === "Your Area") return true;
      return (
        (product?.originPlace || "").toLowerCase() === topLocation.toLowerCase()
      );
    });

    return [...scoped]
      .sort((a, b) => {
        const aScore = Number(a?.rating || 0) * 10 + Number(a?.numReviews || 0);
        const bScore = Number(b?.rating || 0) * 10 + Number(b?.numReviews || 0);
        return bScore - aScore;
      })
      .slice(0, 6);
  }, [products, topLocation]);

  const isFullyVerifiedSeller = (item) =>
    Boolean(item?.sellerId?.isVerified) &&
    Number(item?.sellerId?.trustScore || 0) >= 90;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      // If API returns data, use it; otherwise fallback to mock data
      if (data && Array.isArray(data) && data.length > 0) {
        const uniqueProducts = Array.from(
          new Map(
            data
              .filter(Boolean)
              .map((product) => [
                product._id || `${product.name}-${product.originPlace}`,
                product,
              ]),
          ).values(),
        );
        console.log(
          `Loaded products from API: ${uniqueProducts.length} unique (${data.length} raw)`,
        );
        setProducts(uniqueProducts);
      } else {
        console.log("No products from API, using mock data");
      }
    } catch (error) {
      console.log("Using mock data. API Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPlaceItem = ({ item }) => (
    <AnimatedWrapper
      style={styles.placeCard}
      onPress={() => navigation.navigate("PlaceScreen", { place: item.name })}
    >
      <Image source={{ uri: item.image }} style={styles.placeImage} />
      <Text style={styles.placeText}>{item.name}</Text>
    </AnimatedWrapper>
  );

  const renderProductItem = ({ item }) => (
    <AnimatedWrapper
      style={styles.productCard}
      onPress={() => navigation.navigate("ProductScreen", { product: item })}
    >
      <Image
        source={{ uri: item.images?.[0] || "https://via.placeholder.com/150" }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productOrigin}>{displayLocation}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.warning} />
          <Text style={styles.ratingText}>
            {Number(item.rating || 0).toFixed(1)} ({item.numReviews || 0})
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>
            ₹
            {typeof item.price === "number"
              ? item.price.toLocaleString()
              : item.price}
          </Text>
        </View>
        {isFullyVerifiedSeller(item) ? (
          <Text style={styles.fullyVerifiedBadge}>Fully Verified Seller</Text>
        ) : item.isVerified ? (
          <Text style={styles.verifiedBadge}>Verified</Text>
        ) : null}
      </View>
    </AnimatedWrapper>
  );

  return (
    <ScreenSurface style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header outside ScrollView so it acts like a real header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <View>
            <Text style={styles.headerTitle}>Roots</Text>
            <Text style={styles.headerSubtitle}>
              Discover hidden authentic gems
            </Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{profileInitials}</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 80 + insets.bottom },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore by Place</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Places")}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={MOCK_PLACES}
            renderItem={renderPlaceItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.placeList}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Top Trending in {displayLocation}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Trending")}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={trendingProducts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <AnimatedWrapper
                style={styles.trendingCard}
                onPress={() =>
                  navigation.navigate("ProductScreen", { product: item })
                }
              >
                <Image
                  source={{
                    uri: item.images?.[0] || "https://via.placeholder.com/150",
                  }}
                  style={styles.trendingImage}
                />
                <Text style={styles.trendingName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.trendingMetaRow}>
                  <Ionicons name="star" size={12} color={colors.warning} />
                  <Text style={styles.trendingMetaText}>
                    {Number(item.rating || 0).toFixed(1)} (
                    {item.numReviews || 0})
                  </Text>
                </View>
                {isFullyVerifiedSeller(item) ? (
                  <Text style={styles.fullyVerifiedBadgeSmall}>
                    Fully Verified Seller
                  </Text>
                ) : null}
              </AnimatedWrapper>
            )}
            contentContainerStyle={styles.trendingList}
            showsHorizontalScrollIndicator={false}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Authentic Finds</Text>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 40 }}
            />
          ) : (
            <View style={styles.productsGrid}>
              {products.map((item) => (
                <React.Fragment key={item._id}>
                  {renderProductItem({ item })}
                </React.Fragment>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenSurface>
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
  header: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  avatarText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 15,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },
  seeAllText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  placeList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  trendingList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  trendingCard: {
    width: 170,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  trendingImage: {
    width: "100%",
    height: 128,
    borderRadius: 12,
    marginBottom: 12,
  },
  trendingName: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 6,
  },
  trendingMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  trendingMetaText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  placeCard: {
    marginRight: 12,
    alignItems: "center",
  },
  placeImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  placeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productImage: {
    width: "100%",
    height: 132,
    borderRadius: 12,
    marginBottom: 12,
  },
  productInfo: {
    paddingHorizontal: 0,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  productOrigin: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  productPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: "#007AFF",
  },
  verifiedBadge: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    fontSize: 12,
    color: "#059669",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    fontWeight: "600",
    textAlign: "center",
  },
  fullyVerifiedBadge: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    fontSize: 12,
    color: "#059669",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    fontWeight: "600",
    textAlign: "center",
  },
  fullyVerifiedBadgeSmall: {
    marginTop: 8,
    alignSelf: "flex-start",
    fontSize: 12,
    color: "#059669",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    fontWeight: "600",
  },
});

export default HomeScreen;
