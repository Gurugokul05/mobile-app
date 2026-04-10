import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/config";
import { colors } from "../../theme/colors";
import AnimatedWrapper from "../../components/AnimatedWrapper";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TrendingScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products");
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Trending products fetch error:", error?.message || error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const trendingItems = useMemo(() => {
    // Show ALL products sorted by trending score
    return [...products].sort((a, b) => {
      const aScore = Number(a?.rating || 0) * 10 + Number(a?.numReviews || 0);
      const bScore = Number(b?.rating || 0) * 10 + Number(b?.numReviews || 0);
      return bScore - aScore;
    });
  }, [products]);

  const isFullyVerifiedSeller = (item) =>
    Boolean(item?.sellerId?.isVerified) &&
    Number(item?.sellerId?.trustScore || 0) >= 90;

  const renderItem = ({ item, index }) => (
    <AnimatedWrapper
      style={styles.card}
      onPress={() => navigation.navigate("ProductScreen", { product: item })}
      scaleTo={0.98}
    >
      <Image
        source={{ uri: item.images?.[0] || "https://via.placeholder.com/150" }}
        style={styles.image}
      />
      <View style={styles.infoWrap}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {index < 3 ? (
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.origin}>{item.originPlace || "India"}</Text>

        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={colors.warning} />
            <Text style={styles.ratingText}>
              {Number(item.rating || 0).toFixed(1)} ({item.numReviews || 0})
            </Text>
          </View>
          <Text style={styles.price}>
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
    <ScreenSurface style={styles.container}>
      <ScreenHeader title="Trending Items" navigation={navigation} />
      <View style={styles.headerTextWrap}>
        <Text style={styles.subtitle}>
          Ranked by rating and customer demand
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={trendingItems}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 32 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerWrap}>
              <Text style={styles.emptyText}>
                No trending products available
              </Text>
            </View>
          }
        />
      )}
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  headerTextWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
  },
  subtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
  },
  infoWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginRight: 8,
  },
  rankBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rankText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  origin: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  price: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  verifiedBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    fontSize: 9,
    color: colors.white,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
  },
  fullyVerifiedBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    fontSize: 9,
    color: colors.white,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
    fontWeight: "700",
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
});

export default TrendingScreen;
