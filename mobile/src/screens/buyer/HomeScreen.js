import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import ScreenSurface from "../../components/ScreenSurface";
import AnimatedWrapper from "../../components/AnimatedWrapper";

const CATEGORIES = ["All", "Crafts", "Food", "Textiles"];

const mapCategory = (item) => {
  const source = `${item?.name || ""} ${item?.originPlace || ""}`.toLowerCase();
  if (/tea|spice|food|coffee|snack/.test(source)) return "Food";
  if (/shawl|saree|silk|textile|fabric/.test(source)) return "Textiles";
  return "Crafts";
};

const trustLabel = (item) => {
  const trust = Number(item?.sellerId?.trustScore || 0);
  if (trust >= 90) return "Trusted 90+";
  if (item?.isVerified) return "Verified";
  return "New Seller";
};

const ProductSkeleton = () => (
  <View style={styles.productCard}>
    <View style={styles.skeletonImage} />
    <View style={styles.productContent}>
      <View style={styles.skeletonLineLg} />
      <View style={styles.skeletonLineSm} />
      <View style={styles.skeletonPrice} />
    </View>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const profileInitials = useMemo(() => {
    const name = String(user?.name || "").trim();
    if (!name) return "U";
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [user?.name]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/products");
        setProducts(Array.isArray(data) ? data : []);
      } catch (_error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      const categoryMatch =
        activeCategory === "All" || mapCategory(item) === activeCategory;
      if (!categoryMatch) return false;
      if (!q) return true;
      return `${item?.name || ""} ${item?.originPlace || ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [activeCategory, products, searchQuery]);

  const nearYou = useMemo(
    () => filteredProducts.slice(0, 8),
    [filteredProducts],
  );

  const renderCategory = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        activeCategory === category && styles.categoryChipActive,
      ]}
      onPress={() => setActiveCategory(category)}
      activeOpacity={0.9}
    >
      <Text
        style={[
          styles.categoryChipText,
          activeCategory === category && styles.categoryChipTextActive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderNearYouItem = ({ item }) => (
    <AnimatedWrapper
      style={styles.nearCard}
      onPress={() => navigation.navigate("ProductScreen", { product: item })}
    >
      <Image
        source={{ uri: item?.images?.[0] || "https://via.placeholder.com/300" }}
        style={styles.nearImage}
      />
      <View style={styles.nearMeta}>
        <Text numberOfLines={1} style={styles.nearName}>
          {item?.name || "Product"}
        </Text>
        <Text style={styles.nearLocation}>{item?.originPlace || "Nearby"}</Text>
      </View>
    </AnimatedWrapper>
  );

  const renderProduct = ({ item }) => (
    <AnimatedWrapper
      style={styles.productCard}
      onPress={() => navigation.navigate("ProductScreen", { product: item })}
    >
      <View style={styles.productImageWrap}>
        <Image
          source={{
            uri: item?.images?.[0] || "https://via.placeholder.com/300",
          }}
          style={styles.productImage}
        />
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
          <Text style={styles.trustBadgeText}>{trustLabel(item)}</Text>
        </View>
      </View>
      <View style={styles.productContent}>
        <Text style={styles.productName} numberOfLines={1}>
          {item?.name || "Product"}
        </Text>
        <Text style={styles.productMeta}>{item?.originPlace || "Local"}</Text>
        <Text style={styles.productPrice}>
          Rs {Number(item?.price || 0).toLocaleString()}
        </Text>
      </View>
    </AnimatedWrapper>
  );

  return (
    <ScreenSurface style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          contentContainerStyle={{ paddingBottom: 88 + insets.bottom }}
        >
          <View
            style={[styles.stickySearchWrap, { paddingTop: insets.top + 10 }]}
          >
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>Roots Marketplace</Text>
                <Text style={styles.headerSubtitle}>
                  Find regional originals near you
                </Text>
              </View>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{profileInitials}</Text>
              </View>
            </View>

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.textSecondary}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by product, place, or seller"
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {CATEGORIES.map(renderCategory)}
              </View>
            </ScrollView>
          </View>

          <View style={styles.contentWrap}>
            <View style={styles.sectionHeadRow}>
              <Text style={styles.sectionTitle}>Near You</Text>
            </View>

            {loading ? (
              <View>
                <View style={styles.nearSkeleton} />
              </View>
            ) : (
              <FlatList
                horizontal
                data={nearYou}
                keyExtractor={(item) => item?._id || item?.name}
                renderItem={renderNearYouItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 6 }}
              />
            )}

            <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
              All Products
            </Text>

            {loading ? (
              <View>
                {[1, 2, 3, 4].map((k) => (
                  <ProductSkeleton key={k} />
                ))}
              </View>
            ) : filteredProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyArt}>:-|</Text>
                <Text style={styles.emptyTitle}>No products found</Text>
                <TouchableOpacity
                  style={styles.emptyCta}
                  onPress={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                >
                  <Text style={styles.emptyCtaText}>Reset filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item?._id || item?.name}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 8 }}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, backgroundColor: colors.surface },
  stickySearchWrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: colors.textPrimary },
  headerSubtitle: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lightBackground,
  },
  avatarText: { fontSize: 14, fontWeight: "800", color: colors.primary },
  searchBox: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 10,
  },
  categoryRow: { flexDirection: "row", marginTop: 10 },
  categoryChip: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.lightBackground,
    borderColor: colors.primary,
  },
  categoryChipText: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 13,
  },
  categoryChipTextActive: { color: colors.primary },
  contentWrap: { paddingHorizontal: 16, paddingTop: 14 },
  sectionHeadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  nearCard: {
    width: 240,
    marginRight: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  nearImage: { width: "100%", aspectRatio: 16 / 9, resizeMode: "cover" },
  nearMeta: { padding: 10 },
  nearName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  nearLocation: { marginTop: 3, fontSize: 12, color: colors.textSecondary },
  productCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.09,
    shadowRadius: 5,
    elevation: 2,
    overflow: "hidden",
  },
  productImageWrap: { position: "relative" },
  productImage: { width: "100%", aspectRatio: 16 / 9, resizeMode: "cover" },
  trustBadge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.93)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  trustBadgeText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  productContent: { padding: 12 },
  productName: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  productMeta: { marginTop: 4, fontSize: 12, color: colors.textSecondary },
  productPrice: {
    marginTop: 7,
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },
  skeletonImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#E5ECF4",
  },
  skeletonLineLg: {
    height: 14,
    borderRadius: 7,
    width: "80%",
    backgroundColor: "#E5ECF4",
  },
  skeletonLineSm: {
    height: 12,
    borderRadius: 6,
    width: "45%",
    backgroundColor: "#E5ECF4",
    marginTop: 8,
  },
  skeletonPrice: {
    height: 14,
    borderRadius: 7,
    width: "38%",
    backgroundColor: "#E5ECF4",
    marginTop: 10,
  },
  nearSkeleton: {
    width: 240,
    aspectRatio: 16 / 10,
    borderRadius: 12,
    backgroundColor: "#E5ECF4",
  },
  emptyState: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 20,
    alignItems: "center",
  },
  emptyArt: { fontSize: 40 },
  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptyCta: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCtaText: { color: colors.white, fontWeight: "700" },
});

export default HomeScreen;
