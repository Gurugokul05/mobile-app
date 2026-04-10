import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../theme/colors";
import api from "../../api/config";
import ScreenSurface from "../../components/ScreenSurface";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const PlaceScreen = ({ route, navigation }) => {
  const place = route?.params?.place || "Place";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState("popular");
  const [priceMode, setPriceMode] = useState("low");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchPlaceProducts();
  }, []);

  const fetchPlaceProducts = async () => {
    try {
      // In a real app we'd filter by place on the backend
      const { data } = await api.get("/products");
      const list = Array.isArray(data) ? data : [];
      const filtered = list.filter((p) =>
        String(p?.originPlace || "")
          .toLowerCase()
          .includes(place.toLowerCase()),
      );
      setProducts(filtered);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const displayedProducts = useMemo(() => {
    let next = [...products];

    if (verifiedOnly) {
      next = next.filter((item) => Boolean(item?.isVerified));
    }

    next.sort((a, b) => {
      if (sortMode === "popular") {
        const aScore = Number(a?.rating || 0) * 10 + Number(a?.numReviews || 0);
        const bScore = Number(b?.rating || 0) * 10 + Number(b?.numReviews || 0);
        return bScore - aScore;
      }

      const aPrice = Number(a?.price || 0);
      const bPrice = Number(b?.price || 0);
      return priceMode === "low" ? aPrice - bPrice : bPrice - aPrice;
    });

    return next;
  }, [priceMode, products, sortMode, verifiedOnly]);

  const toggleSort = () => {
    setSortMode((prev) => (prev === "popular" ? "price" : "popular"));
  };

  const togglePriceMode = () => {
    setPriceMode((prev) => (prev === "low" ? "high" : "low"));
    setSortMode("price");
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate("ProductScreen", { product: item })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.images?.[0] || "https://via.placeholder.com/150" }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productMeta} numberOfLines={1}>
          {item.originPlace || place}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>
            ₹
            {typeof item.price === "number"
              ? item.price.toLocaleString()
              : item.price}
          </Text>
          {item.isVerified && (
            <Text style={styles.verifiedBadge}>Verified</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.banner, { marginTop: insets.top + 56 }]}
      >
        <Text style={styles.bannerTitle}>{place}</Text>
        <Text style={styles.bannerSubtitle}>
          Discover authentic items from this region.
        </Text>
      </LinearGradient>

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterChip} onPress={toggleSort}>
          <Ionicons name="swap-vertical" size={14} color="#6B7280" />
          <Text style={styles.filterChipText}>
            Sort: {sortMode === "popular" ? "Popular" : "Price"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterChip} onPress={togglePriceMode}>
          <Ionicons name="pricetag-outline" size={14} color="#6B7280" />
          <Text style={styles.filterChipText}>
            Price: {priceMode === "low" ? "Low-High" : "High-Low"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            verifiedOnly ? styles.filterChipActive : null,
          ]}
          onPress={() => setVerifiedOnly((prev) => !prev)}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={14}
            color={verifiedOnly ? "#007AFF" : "#6B7280"}
          />
          <Text
            style={[
              styles.filterChipText,
              verifiedOnly ? styles.filterChipTextActive : null,
            ]}
          >
            Verified only
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={28} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptyText}>
        Try a different filter or explore all places.
      </Text>
      <TouchableOpacity
        style={styles.emptyCtaBtn}
        onPress={() => navigation.navigate("Places")}
      >
        <Text style={styles.emptyCtaText}>Browse Places</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenSurface style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backButtonWrap, { top: insets.top + 10 }]}
        activeOpacity={0.85}
      >
        <Ionicons name="chevron-back" size={20} color="#111827" />
        <Text style={styles.backButton}>Back</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => String(item._id)}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: 32 + insets.bottom },
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  backButtonWrap: {
    position: "absolute",
    left: 16,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  backButton: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    marginLeft: 2,
  },
  banner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterChipActive: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  filterChipText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#007AFF",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    marginLeft: 0,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
  },
  verifiedBadge: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "700",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 12,
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 6,
    fontSize: 13,
  },
  emptyCtaBtn: {
    marginTop: 12,
    backgroundColor: "#007AFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  emptyCtaText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default PlaceScreen;
